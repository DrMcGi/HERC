import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../lib/auth";
import { prisma } from "../../../lib/db";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";

const EDITABLE_TEXT_FIELDS = ["firstName", "middleName", "surname", "email", "phone", "address", "nationality", "ethnicity", "homeLanguage", "qualification", "experience", "tradeTestDetails"] as const;

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT" || !session.identificationNumber) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body." }, { status: 400 });

  const data: Record<string, string | null> = {};
  for (const field of EDITABLE_TEXT_FIELDS) {
    if (typeof body[field] === "string") {
      const value = field === "email" ? body[field].trim().toLowerCase() : body[field].trim();
      data[field] = value || (field === "middleName" || field === "tradeTestDetails" ? null : value);
    }
  }
  if (body.tradeTest === "Yes" || body.tradeTest === "No") data.tradeTest = body.tradeTest === "Yes" ? "YES" : "NO";

  try {
    const student = await prisma.student.update({ where: { identificationNumber: session.identificationNumber }, data: data as Prisma.StudentUpdateInput });
    return NextResponse.json({ ok: true, name: `${student.firstName} ${student.surname}` });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "This email is already in use by another account." }, { status: 409 });
    }
    throw error;
  }
}
