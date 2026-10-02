import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { createSession, isAdminCredentials, verifyPassword } from "../../../lib/auth";
import { normalizeIdentificationNumber } from "../../../lib/identity";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const identifier = String(body?.identifier ?? "").trim();
  const password = String(body?.password ?? "");
  if (!identifier || !password) return NextResponse.json({ error: "Please enter your details and password." }, { status: 400 });

  if (isAdminCredentials(identifier, password)) {
    await createSession({ role: "ADMIN", name: "HERC Administrator" });
    return NextResponse.json({ ok: true, role: "ADMIN" });
  }

  const student = identifier.includes("@")
    ? await prisma.student.findUnique({ where: { email: identifier.toLowerCase() } })
    : await prisma.student.findUnique({ where: { identificationNumber: normalizeIdentificationNumber(identifier) } });
  if (!student || !(await verifyPassword(password, student.passwordHash))) {
    return NextResponse.json({ error: "Those details were not recognised." }, { status: 401 });
  }
  if (student.status === "REJECTED") {
    return NextResponse.json({ error: "This application was rejected. Please contact HERC for assistance." }, { status: 403 });
  }

  await createSession({ role: "STUDENT", identificationNumber: student.identificationNumber, name: `${student.firstName} ${student.surname}` });
  return NextResponse.json({ ok: true, role: "STUDENT" });
}
