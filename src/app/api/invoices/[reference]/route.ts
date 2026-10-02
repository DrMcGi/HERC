import { NextResponse } from "next/server";
import { getInvoiceByReference } from "../../../lib/payments";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const invoice = await getInvoiceByReference(reference);
  if (!invoice) return NextResponse.json({ error: "Invoice not found." }, { status: 404 });

  const html = `<!doctype html><html><head><meta charset="utf-8" /><title>HERC Invoice ${invoice.invoiceNumber}</title>
  <style>body{font-family:Arial,sans-serif;color:#14221c;padding:48px;max-width:640px;margin:0 auto}
  h1{color:#174b3b;font-size:28px}table{width:100%;border-collapse:collapse;margin-top:24px}
  td{padding:10px 0;border-bottom:1px solid #e2ddce}.total{font-weight:bold;font-size:18px}</style></head>
  <body><h1>HERC — Payment Invoice</h1><p>Hulisani Education Resources Centre</p>
  <table>
  <tr><td>Invoice number</td><td>${invoice.invoiceNumber}</td></tr>
  <tr><td>Reference</td><td>${invoice.reference}</td></tr>
  <tr><td>Billed to</td><td>${invoice.emailedTo}</td></tr>
  <tr><td>Programme</td><td>PV GreenCard training and assessment</td></tr>
  <tr><td>Issued</td><td>${new Date(invoice.issuedAt).toLocaleString()}</td></tr>
  <tr class="total"><td>Amount paid</td><td>R${invoice.amount}</td></tr>
  </table>
  <p style="margin-top:32px;color:#7c837b;font-size:12px">This invoice confirms a successful Ozow payment for the PV GreenCard programme. Use your browser's print function to save this as a PDF.</p>
  </body></html>`;

  return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
}

