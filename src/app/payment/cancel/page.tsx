"use client";

import Link from "next/link";
import { Sun, XCircle } from "lucide-react";

export default function PaymentCancelPage() {
  return <main className="portal-gate">
    <Sun className="portal-gate-sun" size={52} />
    <XCircle color="#a3463d" size={40} />
    <h1>Payment<br /><i>cancelled.</i></h1>
    <p>Your registration is saved, but your PV GreenCard payment was not completed. You can try again from the login page.</p>
    <Link className="button button-dark" href="/auth">Return to login</Link>
  </main>;
}
