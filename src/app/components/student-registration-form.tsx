"use client";

import { FormEvent, useState } from "react";
import { ArrowUpRight, ChevronDown, FileText, ShieldCheck } from "lucide-react";
import { startOzowPayment } from "../lib/payment-client";

type FormState = { firstName: string; middleName: string; surname: string; email: string; phone: string; address: string; dateOfBirth: string; identificationType: "South African ID" | "Passport" | ""; identificationNumber: string; nationality: string; ethnicity: string; homeLanguage: string; qualification: string; experience: string; tradeTest: "Yes" | "No" | ""; tradeTestDetails: string; costAware: string; invoice: string; cohort: string; venueAware: string; password: string; confirm: string };
const initialForm: FormState = { firstName: "", middleName: "", surname: "", email: "", phone: "", address: "", dateOfBirth: "", identificationType: "", identificationNumber: "", nationality: "", ethnicity: "", homeLanguage: "", qualification: "", experience: "", tradeTest: "", tradeTestDetails: "", costAware: "", invoice: "", cohort: "", venueAware: "", password: "", confirm: "" };

type Props = { onSuccess?: () => void; onSubmit?: () => void; submitLabel?: string; cohorts?: string[] };

function ageFromDate(date: string) { const birth = new Date(date); const today = new Date(); let age = today.getFullYear() - birth.getFullYear(); if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age -= 1; return age; }
function Field({ label, value, onChange, type = "text", required = true, placeholder = "" }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; placeholder?: string }) { return <label className="field"><span>{label} {required && <b>*</b>}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} /></label>; }

export default function StudentRegistrationForm({ onSuccess, onSubmit, submitLabel = "Submit registration", cohorts: providedCohorts }: Props) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [error, setError] = useState("");
  const [registered, setRegistered] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const cohorts = providedCohorts ?? [];
  const update = (name: keyof FormState, value: string) => { setForm((current) => ({ ...current, [name]: value })); setError(""); };

  async function retryPayment() {
    setSubmitting(true);
    const result = await startOzowPayment();
    setSubmitting(false);
    if (!result.ok) setError(result.error || "Unable to start payment.");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (ageFromDate(form.dateOfBirth) < 16 || ageFromDate(form.dateOfBirth) > 100) { setError("Please enter a valid date of birth."); return; }
    if (form.tradeTest === "Yes" && !form.tradeTestDetails.trim()) { setError("Please tell us which trade test you have completed."); return; }
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }

    setSubmitting(true);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json();
    if (!response.ok) { setSubmitting(false); setError(data.error || "Unable to complete registration."); return; }

    onSubmit?.();
    setRegistered(true);
    const payment = await startOzowPayment();
    setSubmitting(false);
    if (!payment.ok) { setError(payment.error || "Your registration was saved, but payment could not be started. Please retry below."); return; }
    onSuccess?.();
  }

  return <form className="student-registration-form" onSubmit={submit}>
    <div className="form-section-label">Personal details</div>
    <div className="auth-form-grid"><Field label="First name(s)" value={form.firstName} onChange={(value) => update("firstName", value)} /><Field label="Surname" value={form.surname} onChange={(value) => update("surname", value)} /></div>
    <Field label="Middle name(s)" value={form.middleName} onChange={(value) => update("middleName", value)} required={false} />
    <div className="auth-form-grid"><Field label="Email address" type="email" value={form.email} onChange={(value) => update("email", value)} /><Field label="Phone number" type="tel" value={form.phone} onChange={(value) => update("phone", value)} /></div>
    <Field label="Residential address" value={form.address} onChange={(value) => update("address", value)} />
    <div className="auth-form-grid"><Field label="Date of birth" type="date" value={form.dateOfBirth} onChange={(value) => update("dateOfBirth", value)} /><Field label="Age" value={form.dateOfBirth ? String(ageFromDate(form.dateOfBirth)) : ""} onChange={() => undefined} required={false} placeholder="Calculated automatically" /></div>
    <div className="form-section-label">Identity and background</div>
    <div className="auth-form-grid"><label className="field"><span>Identification type <b>*</b></span><select value={form.identificationType} onChange={(event) => update("identificationType", event.target.value)} required><option value="" disabled>Select type</option><option>South African ID</option><option>Passport</option></select><ChevronDown className="select-icon" size={16} /></label><Field label="ID / passport number" value={form.identificationNumber} onChange={(value) => update("identificationNumber", value)} /></div>
    <div className="auth-form-grid"><Field label="Nationality" value={form.nationality} onChange={(value) => update("nationality", value)} placeholder="Example: South African" /><Field label="Home language" value={form.homeLanguage} onChange={(value) => update("homeLanguage", value)} placeholder="Example: Sepedi" /></div>
    <label className="field"><span>Ethnicity <small>(optional)</small></span><select value={form.ethnicity} onChange={(event) => update("ethnicity", event.target.value)}><option value="">Prefer not to say</option><option>African</option><option>Coloured</option><option>Indian / Asian</option><option>White</option><option>Other</option></select></label>
    <div className="form-section-label">Education and experience</div>
    <Field label="Highest qualification" value={form.qualification} onChange={(value) => update("qualification", value)} placeholder="Example: Grade 12, N6, Diploma" />
    <label className="field"><span>Relevant work or technical experience <b>*</b></span><textarea value={form.experience} onChange={(event) => update("experience", event.target.value)} placeholder="Tell us about your experience" required /></label>
    <fieldset><legend>Do you have a trade test? *</legend><label><input type="radio" name="trade-test" checked={form.tradeTest === "Yes"} onChange={() => update("tradeTest", "Yes")} required /> Yes</label><label><input type="radio" name="trade-test" checked={form.tradeTest === "No"} onChange={() => update("tradeTest", "No")} /> No</label></fieldset>
    {form.tradeTest === "Yes" && <Field label="Which trade test?" value={form.tradeTestDetails} onChange={(value) => update("tradeTestDetails", value)} placeholder="Example: Electrical, Plumbing, Welding" />}
    <div className="form-section-label">Programme details</div>
    <fieldset><legend>Are you aware of the R12,550 all-inclusive cost? *</legend><label><input type="radio" name="cost" checked={form.costAware === "Yes"} onChange={() => update("costAware", "Yes")} required /> Yes</label><label><input type="radio" name="cost" checked={form.costAware === "No"} onChange={() => update("costAware", "No")} /> No</label></fieldset>
    <fieldset><legend>How would you prefer to receive the invoice? *</legend><label><input type="radio" name="invoice" checked={form.invoice === "Email"} onChange={() => update("invoice", "Email")} required /> Email</label><label><input type="radio" name="invoice" checked={form.invoice === "WhatsApp"} onChange={() => update("invoice", "WhatsApp")} /> WhatsApp</label><label><input type="radio" name="invoice" checked={form.invoice === "Either"} onChange={() => update("invoice", "Either")} /> Either is fine</label></fieldset>
    <label className="field"><span>Preferred training date *</span><select value={form.cohort} onChange={(event) => update("cohort", event.target.value)} required><option value="" disabled>Select an available cohort</option>{cohorts.map((cohort) => <option key={cohort}>{cohort}</option>)}</select><ChevronDown className="select-icon" size={16} /></label>
    <fieldset><legend>Can you attend at Sekhukhune Skills Centre in Aquaville? *</legend><label><input type="radio" name="venue" checked={form.venueAware === "Yes"} onChange={() => update("venueAware", "Yes")} required /> Yes</label><label><input type="radio" name="venue" checked={form.venueAware === "No"} onChange={() => update("venueAware", "No")} /> No</label></fieldset>
    <p className="form-note"><ShieldCheck size={16} /> Candidates provide their own PPE. Travel and accommodation are for the candidate&apos;s own account.</p>
    <div className="upload-grid"><label className="upload"><FileText size={20} /><span>Curriculum Vitae <small>PDF or image · up to 5 files</small></span><input type="file" name="cv" accept=".pdf,image/*" multiple /></label><label className="upload"><FileText size={20} /><span>Qualifications <small>PDF, document or image · up to 5</small></span><input type="file" name="qualifications" accept=".pdf,.doc,.docx,image/*" multiple /></label><label className="upload"><FileText size={20} /><span>ID Copy <small>PDF, document or image · up to 5 files</small></span><input type="file" name="id-copy" accept=".pdf,.doc,.docx,image/*" multiple /></label></div>
    <div className="form-section-label">Secure your account</div><div className="auth-form-grid"><Field label="Password" type="password" value={form.password} onChange={(value) => update("password", value)} /><Field label="Confirm password" type="password" value={form.confirm} onChange={(value) => update("confirm", value)} /></div>
    {error && <p className="auth-error">{error}</p>}
    {registered ? <button className="button button-dark auth-submit submit-button" type="button" onClick={retryPayment} disabled={submitting}>{submitting ? "Starting payment…" : "Retry payment"} <ArrowUpRight size={17} /></button>
      : <button className="button button-dark auth-submit submit-button" type="submit" disabled={submitting}>{submitting ? "Saving…" : submitLabel} <ArrowUpRight size={17} /></button>}
  </form>;
}
