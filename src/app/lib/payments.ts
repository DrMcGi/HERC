import { prisma } from "./db";
import { PaymentStatus } from "@prisma/client";

// Payments are keyed by identificationNumber (the stable identity anchor), not
// email, so a student changing their email never breaks payment history or
// portal access. Invoice emails always resolve the student's current email
// from the database at send time rather than a value captured earlier.

export function createPayment(reference: string, identificationNumber: string, amount: string) {
  return prisma.payment.create({ data: { reference, identificationNumber, amount, status: PaymentStatus.PENDING } });
}

export function updatePaymentStatus(reference: string, status: PaymentStatus, transactionId?: string) {
  return prisma.payment.update({
    where: { reference },
    data: { status, transactionId, paidAt: status === PaymentStatus.PAID ? new Date() : undefined },
  });
}

export function getPaymentByReference(reference: string) {
  return prisma.payment.findUnique({ where: { reference } });
}

export async function getLatestPaymentForIdentification(identificationNumber: string) {
  return prisma.payment.findFirst({ where: { identificationNumber }, orderBy: { createdAt: "desc" } });
}

export async function hasConfirmedPayment(identificationNumber: string) {
  const payment = await getLatestPaymentForIdentification(identificationNumber);
  return payment?.status === PaymentStatus.PAID;
}

export function saveInvoice(data: { reference: string; invoiceNumber: string; emailedTo: string; amount: string; emailSent: boolean; emailError?: string }) {
  return prisma.invoice.create({ data });
}

export function getInvoiceByReference(reference: string) {
  return prisma.invoice.findUnique({ where: { reference } });
}
