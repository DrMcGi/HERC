import { NextRequest, NextResponse } from "next/server";
import { getInvoiceByReference, getLatestPaymentForIdentification, getPaymentByReference } from "../../../lib/payments";
import { getSession } from "../../../lib/auth";
import { normalizeIdentificationNumber } from "../../../lib/identity";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get("reference");
  const session = await getSession();
  const identificationNumber = request.nextUrl.searchParams.get("identificationNumber");

  const payment = reference
    ? await getPaymentByReference(reference)
    : identificationNumber
      ? await getLatestPaymentForIdentification(normalizeIdentificationNumber(identificationNumber))
      : session?.identificationNumber
        ? await getLatestPaymentForIdentification(session.identificationNumber)
        : undefined;
  if (!payment) return NextResponse.json({ paid: false, status: "none" });

  const invoice = await getInvoiceByReference(payment.reference);
  return NextResponse.json({
    paid: payment.status === "PAID",
    status: payment.status,
    reference: payment.reference,
    invoiceUrl: invoice ? `/api/invoices/${payment.reference}` : null,
  });
}

