"use client";

import { FormEvent, useState } from "react";
import { ArrowLeft, ArrowRight, Check, LockKeyhole } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StudentRegistrationForm from "../components/student-registration-form";
import { checkPaymentStatus, startOzowPayment } from "../lib/payment-client";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [paymentRequired, setPaymentRequired] = useState(false);
  const [payingNow, setPayingNow] = useState(false);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPaymentRequired(false);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });
    const data = await response.json();
    if (!response.ok) { setError(data.error || "Login failed."); return; }

    if (data.role === "ADMIN") { router.push("/portal"); return; }

    const paymentStatus = await checkPaymentStatus();
    if (!paymentStatus.paid) { setPaymentRequired(true); return; }
    router.push("/portal");
  }

  async function payNow() {
    setPayingNow(true);
    const result = await startOzowPayment();
    setPayingNow(false);
    if (!result.ok) setError(result.error || "Unable to start payment.");
  }

  function switchMode(next: "login" | "register") { setMode(next); setError(""); setSuccess(""); setPaymentRequired(false); }

  const loginPane = <>
    <p className="eyebrow">Welcome back</p>
    <h2>Return to<br /><i>your energy.</i></h2>
    <p className="auth-intro">Students and administrators can access the HERC workspace here.</p>
    {error && <p className="auth-error">{error}</p>}
    {success && <p className="auth-success"><Check size={15} /> {success}</p>}
    {paymentRequired ? <div className="payment-gate">
      <p className="auth-error">Your PV GreenCard registration is not paid yet. Portal access unlocks once your Ozow payment is confirmed.</p>
      <button className="button button-dark auth-submit" type="button" onClick={payNow} disabled={payingNow}>{payingNow ? "Starting payment…" : "Pay now with Ozow"} <ArrowRight size={17} /></button>
    </div> : <form className="auth-form" onSubmit={login}>
      <label className="field"><span>Email or ID / passport number <b>*</b></span><input value={identifier} onChange={(event) => { setIdentifier(event.target.value); setError(""); }} autoComplete="username" required /></label>
      <label className="field"><span>Password <b>*</b></span><input type="password" value={password} onChange={(event) => { setPassword(event.target.value); setError(""); }} required /></label>
      <button className="button button-dark auth-submit" type="submit">Enter workspace <ArrowRight size={17} /></button>
    </form>}
    <p className="auth-footnote">Log in with your email or ID/passport number and password.</p>
  </>;

  const registerPane = <>
    <p className="eyebrow">Student registration</p>
    <h2>Create your<br /><i>student account.</i></h2>
    <p className="auth-intro">Complete the same HERC programme application used on the public site. Portal access unlocks after your Ozow payment is confirmed.</p>
    {success && <p className="auth-success"><Check size={15} /> {success}</p>}
    <StudentRegistrationForm submitLabel="Create student account and pay" onSuccess={() => { setMode("login"); setSuccess("Payment confirmed. Log in with the ID/passport number and password you created."); }} />
  </>;

  return <main className="auth-page">
    <div className="auth-visual">
      <Link className="brand brand-logo auth-brand" href="/"><Image src="/herc_logo.svg" alt="Hulisani Education Resources Centre" width={155} height={65} priority /></Link>
      <div><p className="eyebrow"><span /> HERC learning network</p><h1>Make your<br /><i>next move.</i></h1><p>One account for your application, learning materials, assessment updates and certificate.</p></div>
      <Link className="back-home" href="/"><ArrowLeft size={16} /> Back to the public site</Link>
    </div>
    <div className="auth-panel">
      <div className="auth-panel-top"><span className="auth-label"><LockKeyhole size={14} /> Secure access</span><Link href="/" aria-label="Close"><ArrowLeft size={17} /></Link></div>
      <div className="auth-box">
        <div className="auth-tabs">
          <button type="button" className={mode === "login" ? "active" : ""} onClick={() => switchMode("login")}>Log in</button>
          <button type="button" className={mode === "register" ? "active" : ""} onClick={() => switchMode("register")}>Register</button>
        </div>
        {mode === "login" ? loginPane : registerPane}
      </div>
    </div>
  </main>;
}
