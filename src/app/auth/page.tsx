"use client";

import { FormEvent, useState } from "react";
import { ArrowLeft, ArrowRight, Check, LockKeyhole, Sun } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StudentRegistrationForm from "../components/student-registration-form";
import { ADMIN_EMAIL, ADMIN_PASSWORD, getUsers } from "../lib/demo-auth";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD) { localStorage.setItem("herc-session", JSON.stringify({ email: ADMIN_EMAIL, name: "Giftk Rantho", role: "admin" })); router.push("/portal"); return; }
    const student = getUsers().find((user) => user.email === normalizedEmail && user.password === password);
    if (!student) { setError("That email and password combination was not recognised."); return; }
    if (student.status === "rejected") { setError("This application was rejected. Please contact HERC for assistance."); return; }
    localStorage.setItem("herc-session", JSON.stringify({ email: student.email, name: student.name, role: "student", status: student.status })); router.push("/portal");
  }
  function switchMode(next: "login" | "register") { setMode(next); setError(""); setSuccess(""); }
  return <main className="auth-page"><div className="auth-visual"><Link className="brand auth-brand" href="/"><span className="brand-mark"><Sun size={22} /></span><span>HERC <small>Hulisani Education<br />Resources Centre</small></span></Link><div><p className="eyebrow"><span /> HERC learning network</p><h1>Make your<br /><i>next move.</i></h1><p>One account for your application, learning materials, assessment updates and certificate.</p></div><Link className="back-home" href="/"><ArrowLeft size={16} /> Back to the public site</Link></div><div className="auth-panel"><div className="auth-panel-top"><span className="auth-label"><LockKeyhole size={14} /> Secure access</span><Link href="/" aria-label="Close"><ArrowLeft size={17} /></Link></div><div className="auth-box"><div className="auth-tabs"><button type="button" className={mode === "login" ? "active" : ""} onClick={() => switchMode("login")}>Log in</button><button type="button" className={mode === "register" ? "active" : ""} onClick={() => switchMode("register")}>Register</button></div>{mode === "login" ? <><p className="eyebrow">Welcome back</p><h2>Return to<br /><i>your energy.</i></h2><p className="auth-intro">Students and administrators can access the HERC workspace here.</p>{error && <p className="auth-error">{error}</p>}{success && <p className="auth-success"><Check size={15} /> {success}</p>}<form className="auth-form" onSubmit={login}><label className="field"><span>Email address <b>*</b></span><input type="email" value={email} onChange={(event) => { setEmail(event.target.value); setError(""); }} required /></label><label className="field"><span>Password <b>*</b></span><input type="password" value={password} onChange={(event) => { setPassword(event.target.value); setError(""); }} required /></label><button className="button button-dark auth-submit" type="submit">Enter workspace <ArrowRight size={17} /></button></form><p className="auth-footnote">Use your HERC account details to access the appropriate workspace.</p></> : <><p className="eyebrow">Student registration</p><h2>Create your<br /><i>student account.</i></h2><p className="auth-intro">Complete the same HERC programme application used on the public site.</p>{success && <p className="auth-success"><Check size={15} /> {success}</p>}<StudentRegistrationForm submitLabel="Create student account" onSuccess={() => { setMode("login"); setSuccess("Application submitted. Use the email and password you created to access your student portal."); }} /></>}</div></div></main>;
}
