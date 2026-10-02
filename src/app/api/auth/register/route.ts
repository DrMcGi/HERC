import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { createSession, hashPassword } from "../../../lib/auth";
import { normalizeIdentificationNumber } from "../../../lib/identity";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";

function ageFromDate(date: Date) {
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  if (today.getMonth() < date.getMonth() || (today.getMonth() === date.getMonth() && today.getDate() < date.getDate())) age -= 1;
  return age;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body." }, { status: 400 });

  const required = ["firstName", "surname", "email", "phone", "address", "dateOfBirth", "identificationType", "identificationNumber", "nationality", "homeLanguage", "qualification", "experience", "tradeTest", "costAware", "invoice", "cohort", "venueAware", "password"];
  for (const field of required) {
    if (!String(body[field] ?? "").trim()) return NextResponse.json({ error: "Please complete every required field." }, { status: 400 });
  }
  if (body.tradeTest === "Yes" && !String(body.tradeTestDetails ?? "").trim()) {
    return NextResponse.json({ error: "Please tell us which trade test you have completed." }, { status: 400 });
  }

  const dateOfBirth = new Date(body.dateOfBirth);
  const age = ageFromDate(dateOfBirth);
  if (Number.isNaN(dateOfBirth.getTime()) || age < 16 || age > 100) {
    return NextResponse.json({ error: "Please enter a valid date of birth." }, { status: 400 });
  }

  const identificationNumber = normalizeIdentificationNumber(String(body.identificationNumber));
  const existing = await prisma.student.findUnique({ where: { identificationNumber } });
  if (existing) return NextResponse.json({ error: "An account with this ID/passport number already exists." }, { status: 409 });
  const email = String(body.email).trim().toLowerCase();
  if (await prisma.student.findFirst({ where: { email } })) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const passwordHash = await hashPassword(String(body.password));

  let student;
  try {
    student = await prisma.student.create({
    data: {
      identificationNumber,
      identificationType: body.identificationType === "Passport" ? "PASSPORT" : "SOUTH_AFRICAN_ID",
      firstName: String(body.firstName).trim(),
      middleName: String(body.middleName ?? "").trim() || null,
      surname: String(body.surname).trim(),
      email,
      phone: String(body.phone).trim(),
      address: String(body.address).trim(),
      dateOfBirth,
      nationality: String(body.nationality).trim(),
      ethnicity: String(body.ethnicity ?? "").trim() || "Prefer not to say",
      homeLanguage: String(body.homeLanguage).trim(),
      qualification: String(body.qualification).trim(),
      experience: String(body.experience).trim(),
      tradeTest: body.tradeTest === "Yes" ? "YES" : "NO",
      tradeTestDetails: String(body.tradeTestDetails ?? "").trim() || null,
      cohortLabel: String(body.cohort),
      passwordHash,
      costAware: body.costAware === "Yes",
      invoicePreference: String(body.invoice),
      venueAware: body.venueAware === "Yes",
    },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "An account with this email or ID/passport number already exists." }, { status: 409 });
    }
    throw error;
  }

  await createSession({ role: "STUDENT", identificationNumber: student.identificationNumber, name: `${student.firstName} ${student.surname}` });
  return NextResponse.json({ ok: true });
}
