// Client-safe helper: calls our server route (which reads the signed-in session and
// holds the Ozow keys) and redirects the browser to the returned Ozow payment URL.
export async function startOzowPayment(): Promise<{ ok: boolean; error?: string }> {
  try {
    const response = await fetch("/api/payments/initiate", { method: "POST" });
    const data = await response.json();
    if (!response.ok || !data.redirectUrl) return { ok: false, error: data.error || "Unable to start payment." };
    window.location.href = data.redirectUrl;
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not reach the payment service." };
  }
}

export async function checkPaymentStatus(): Promise<{ paid: boolean; status: string }> {
  try {
    const response = await fetch("/api/payments/status");
    return await response.json();
  } catch {
    return { paid: false, status: "unknown" };
  }
}
