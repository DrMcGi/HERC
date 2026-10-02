// Server-only. Sends the invoice email via Resend when RESEND_API_KEY is configured.
// Without a configured provider, no email is sent — the caller must surface that
// honestly rather than assume delivery succeeded.

export async function sendInvoiceEmail(options: { to: string; name: string; reference: string; amount: string; invoiceUrl: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.INVOICE_FROM_EMAIL || "HERC <info@herc.org.za>";
  if (!apiKey) return { sent: false, error: "No email provider configured (RESEND_API_KEY missing)." };

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from, to: options.to, subject: "Your HERC PV GreenCard payment invoice",
        html: `<p>Hi ${options.name},</p><p>Thank you for your payment of R${options.amount} for the PV GreenCard programme.</p><p>Reference: ${options.reference}</p><p><a href="${options.invoiceUrl}">View your invoice</a></p><p>HERC — Hulisani Education Resources Centre</p>`,
      }),
    });
    if (!response.ok) return { sent: false, error: `Email provider responded with ${response.status}` };
    return { sent: true };
  } catch (error) {
    return { sent: false, error: error instanceof Error ? error.message : "Unknown email error" };
  }
}
