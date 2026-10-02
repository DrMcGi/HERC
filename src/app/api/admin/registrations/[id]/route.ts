import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../lib/auth";
import { prisma } from "../../../../lib/db";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Admins only." }, { status: 403 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const status = body?.status === "approved" ? "APPROVED" : body?.status === "rejected" ? "REJECTED" : null;
  if (!status) return NextResponse.json({ error: "Invalid status." }, { status: 400 });

  await prisma.student.update({ where: { id }, data: { status } });
  return NextResponse.json({ ok: true });
}
