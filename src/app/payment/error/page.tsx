"use client";

import Link from "next/link";
import { AlertTriangle, Sun } from "lucide-react";

export default function PaymentErrorPage() {
  return <main className="portal-gate">
    <Sun className="portal-gate-sun" size={52} />
    <AlertTriangle color="#a3463d" size={40} />
    <h1>Payment<br /><i>didn&apos;t go through.</i></h1>
    <p>Something went wrong processing your Ozow payment. Please try again, or contact HERC if this continues.</p>
    <Link className="button button-dark" href="/auth">Return to login</Link>
  </main>;
}
