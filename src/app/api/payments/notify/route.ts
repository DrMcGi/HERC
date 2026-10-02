import { NextRequest, NextResponse } from "next/server";
import { verifyNotifyHash, OzowNotifyPayload } from "../../../lib/ozow";
import { getPaymentByReference, saveInvoice, updatePaymentStatus } from "../../../lib/payments";
import { sendInvoiceEmail } from "../../../lib/email";
import { prisma } from "../../../lib/db";

export const runtime = "nodejs";

async function parsePayload(request: NextRequest): Promise<OzowNotifyPayload> {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return request.json();
  const form = await request.formData();
  return Object.fromEntries(form.entries()) as unknown as OzowNotifyPayload;
}

export async function POST(request: NextRequest) {
  const payload = await parsePayload(request);

  if (!verifyNotifyHash(payload)) {
    return NextResponse.json({ error: "Hash verification failed." }, { status: 400 });
  }

  const payment = await getPaymentByReference(payload.TransactionReference);
  if (!payment) return NextResponse.json({ error: "Unknown transaction reference." }, { status: 404 });

  const status = payload.Status === "Complete" ? "PAID" : payload.Status === "Cancelled" ? "CANCELLED" : "FAILED";
  await updatePaymentStatus(payload.TransactionReference, status, payload.TransactionId);

  if (status === "PAID") {
    // Resolve the student's current email at confirmation time, not whatever it was at registration.
    const student = await prisma.student.findUnique({ where: { identificationNumber: payment.identificationNumber } });
    if (student) {
      const invoiceNumber = `INV-${payload.TransactionReference.slice(5)}`;
      const invoiceUrl = `${new URL(request.url).origin}/api/invoices/${payload.TransactionReference}`;
      const emailResult = await sendInvoiceEmail({ to: student.email, name: `${student.firstName} ${student.surname}`, reference: payload.TransactionReference, amount: payment.amount, invoiceUrl });
      await saveInvoice({
        reference: payload.TransactionReference, invoiceNumber, emailedTo: student.email,
        amount: payment.amount, emailSent: emailResult.sent, emailError: emailResult.error,
      });
    }
  }

  // Ozow requires a 200 response to acknowledge receipt of the notification.
  return NextResponse.json({ received: true });
}

