import { NextResponse } from "next/server";
import { getSession } from "../../lib/auth";
import { prisma } from "../../lib/db";
import { hasConfirmedPayment, getLatestPaymentForIdentification, getInvoiceByReference } from "../../lib/payments";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  if (session.role === "ADMIN") {
    const [students, cohorts, content] = await Promise.all([
      prisma.student.findMany({ orderBy: { createdAt: "desc" }, include: { certificate: true, payments: { orderBy: { createdAt: "desc" }, take: 1 } } }),
      prisma.cohort.findMany({ orderBy: { position: "asc" } }),
      prisma.portalContent.findUnique({ where: { id: "singleton" } }),
    ]);
    return NextResponse.json({
      role: "ADMIN",
      name: session.name,
      registrations: students.map((student) => ({
        id: student.id,
        identificationNumber: student.identificationNumber,
        name: `${student.firstName} ${student.surname}`,
        email: student.email,
        qualification: student.qualification,
        cohort: student.cohortLabel,
        status: student.status,
        paid: student.payments[0]?.status === "PAID",
        certificateReady: Boolean(student.certificate),
      })),
      cohorts,
      content,
    });
  }

  const student = await prisma.student.findUnique({ where: { identificationNumber: session.identificationNumber }, include: { certificate: true } });
  if (!student) return NextResponse.json({ error: "Account not found." }, { status: 404 });

  const paid = await hasConfirmedPayment(student.identificationNumber);
  if (!paid) {
    return NextResponse.json({ role: "STUDENT", name: session.name, status: student.status, paid: false });
  }

  const [cohorts, content, latestPayment] = await Promise.all([
    prisma.cohort.findMany({ orderBy: { position: "asc" } }),
    prisma.portalContent.findUnique({ where: { id: "singleton" } }),
    getLatestPaymentForIdentification(student.identificationNumber),
  ]);
  const invoice = latestPayment ? await getInvoiceByReference(latestPayment.reference) : null;

  return NextResponse.json({
    role: "STUDENT",
    paid: true,
    status: student.status,
    firstName: student.firstName,
    middleName: student.middleName,
    surname: student.surname,
    name: `${student.firstName} ${student.surname}`,
    email: student.email,
    phone: student.phone,
    address: student.address,
    nationality: student.nationality,
    ethnicity: student.ethnicity,
    homeLanguage: student.homeLanguage,
    qualification: student.qualification,
    experience: student.experience,
    tradeTest: student.tradeTest,
    tradeTestDetails: student.tradeTestDetails,
    cohorts,
    content,
    invoiceUrl: invoice ? `/api/invoices/${invoice.reference}` : null,
    certificate: student.certificate ? { fileName: student.certificate.fileName, blobUrl: student.certificate.blobUrl, uploadedAt: student.certificate.uploadedAt } : null,
  });
}
