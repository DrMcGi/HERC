"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Download, Sun } from "lucide-react";
import Link from "next/link";

function SuccessContent() {
  const reference = useSearchParams().get("reference");
  const [state, setState] = useState<"checking" | "paid" | "pending">(reference ? "checking" : "pending");
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) return;
    let cancelled = false;
    async function poll() {
      const response = await fetch(`/api/payments/status?reference=${reference}`);
      const data = await response.json();
      if (cancelled) return;
      if (data.paid) { setState("paid"); setInvoiceUrl(data.invoiceUrl); }
      else setTimeout(poll, 2000);
    }
    poll();
    return () => { cancelled = true; };
  }, [reference]);

  return <main className="portal-gate">
    <Sun className="portal-gate-sun" size={52} />
    {state === "paid" ? <>
      <CheckCircle2 color="#34704d" size={40} />
      <h1>Payment<br /><i>confirmed.</i></h1>
      <p>Your PV GreenCard registration is now paid. You can log in to your student portal.</p>
      <div className="hero-actions">
        {invoiceUrl && <a className="button button-dark" href={invoiceUrl} target="_blank" rel="noreferrer"><Download size={16} /> View invoice</a>}
        <Link className="button button-light" href="/auth">Go to login</Link>
      </div>
    </> : <>
      <h1>Confirming your<br /><i>payment.</i></h1>
      <p>We are waiting for Ozow to confirm your payment. This page will update automatically.</p>
    </>}
  </main>;
}

export default function PaymentSuccessPage() {
  return <Suspense fallback={<main className="portal-gate"><Sun className="portal-gate-sun" size={52} /><p>Loading…</p></main>}>
    <SuccessContent />
  </Suspense>;
}
