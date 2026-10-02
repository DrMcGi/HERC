import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { OZOW_PROGRAMME_AMOUNT, requestOzowPaymentUrl } from "../../../lib/ozow";
import { createPayment } from "../../../lib/payments";
import { getSession } from "../../../lib/auth";
import { prisma } from "../../../lib/db";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT" || !session.identificationNumber) {
    return NextResponse.json({ error: "Please log in before starting a payment." }, { status: 401 });
  }
  const student = await prisma.student.findUnique({ where: { identificationNumber: session.identificationNumber } });
  if (!student) return NextResponse.json({ error: "Account not found." }, { status: 404 });

  const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
  const reference = `HERC-${Date.now()}-${randomBytes(3).toString("hex")}`;

  try {
    const redirectUrl = await requestOzowPaymentUrl({
      transactionReference: reference,
      bankReference: `HERC${reference.slice(-8)}`,
      amount: OZOW_PROGRAMME_AMOUNT,
      customer: `${student.firstName} ${student.surname}`,
      cancelUrl: `${origin}/payment/cancel?reference=${reference}`,
      errorUrl: `${origin}/payment/error?reference=${reference}`,
      successUrl: `${origin}/payment/success?reference=${reference}`,
      notifyUrl: `${origin}/api/payments/notify`,
    });
    await createPayment(reference, student.identificationNumber, OZOW_PROGRAMME_AMOUNT);
    return NextResponse.json({ redirectUrl, reference });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to start payment." }, { status: 502 });
  }
}
