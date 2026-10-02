import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getSession } from "../../../../lib/auth";
import { prisma } from "../../../../lib/db";

export const runtime = "nodejs";

export async function POST(request: NextRequest, { params }: { params: Promise<{ studentId: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Admins only." }, { status: 403 });

  const { studentId } = await params;
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file was provided." }, { status: 400 });

  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student || student.status !== "APPROVED") {
    return NextResponse.json({ error: "Certificates can only be uploaded for approved students." }, { status: 400 });
  }

  const blob = await put(`certificates/${student.identificationNumber}-${file.name}`, file, { access: "public", addRandomSuffix: true });

  await prisma.certificate.upsert({
    where: { studentId },
    update: { fileName: file.name, fileType: file.type, blobUrl: blob.url, uploadedAt: new Date() },
    create: { studentId, fileName: file.name, fileType: file.type, blobUrl: blob.url },
  });

  return NextResponse.json({ ok: true, blobUrl: blob.url });
}
