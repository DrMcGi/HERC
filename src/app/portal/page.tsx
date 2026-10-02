"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import { BookOpen, Check, ChevronRight, Download, FileText, LogOut, Plus, Save, Settings2, ShieldCheck, Sun, Upload, Users, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startOzowPayment } from "../lib/payment-client";

type Cohort = { id: string; label: string; training: string; assessment: string };
type PortalContent = { programmeTitle: string; programmeDescription: string; welcomeMessage: string };
type StudentMe = {
  role: "STUDENT"; paid: boolean; status?: string; name?: string;
  firstName?: string; middleName?: string | null; surname?: string; email?: string; phone?: string; address?: string;
  nationality?: string; ethnicity?: string | null; homeLanguage?: string; qualification?: string; experience?: string;
  tradeTest?: "YES" | "NO"; tradeTestDetails?: string | null;
  cohorts?: Cohort[]; content?: PortalContent; invoiceUrl?: string | null;
  certificate?: { fileName: string; blobUrl: string; uploadedAt: string } | null;
};
type AdminRegistration = { id: string; identificationNumber: string; name: string; email: string; qualification: string; cohort: string | null; status: string; paid: boolean; certificateReady: boolean };
type AdminMe = { role: "ADMIN"; name: string; registrations: AdminRegistration[]; cohorts: Cohort[]; content: PortalContent | null };
type Me = StudentMe | AdminMe;

const materials = [
  { title: "PV GreenCard learner guide", type: "PDF · 4.8 MB", status: "Available" },
  { title: "Installation safety checklist", type: "PDF · 1.2 MB", status: "Available" },
  { title: "Pre-assessment preparation", type: "PDF · 2.1 MB", status: "Unlocks soon" },
];

async function logout(router: ReturnType<typeof useRouter>) {
  await fetch("/api/auth/logout", { method: "POST" });
  router.push("/auth");
}

export default function PortalPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null | "loading" | "unauthenticated">("loading");

  useEffect(() => {
    fetch("/api/me").then(async (response) => {
      if (response.status === 401) { setMe("unauthenticated"); return; }
      setMe(await response.json());
    }).catch(() => setMe("unauthenticated"));
  }, []);

  if (me === "loading") return <main className="portal-gate"><Sun className="portal-gate-sun" size={52} /><p>Loading your workspace…</p></main>;
  if (me === "unauthenticated" || !me) return <main className="portal-gate"><Sun className="portal-gate-sun" size={52} /><h1>Your HERC workspace<br /><i>is waiting.</i></h1><p>Please log in to continue.</p><Link className="button button-dark" href="/auth">Go to login</Link></main>;

  if (me.role === "ADMIN") return <AdminPortal me={me} onLogout={() => logout(router)} />;
  if (!me.paid) return <PaymentGate status={me.status} onLogout={() => logout(router)} />;
  return <StudentPortal me={me} onLogout={() => logout(router)} />;
}

function PaymentGate({ status, onLogout }: { status?: string; onLogout: () => void }) {
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  async function payNow() {
    setPaying(true);
    const result = await startOzowPayment();
    setPaying(false);
    if (!result.ok) setError(result.error || "Unable to start payment.");
  }
  return <main className="portal-gate">
    <Sun className="portal-gate-sun" size={52} />
    <h1>Almost there.<br /><i>Complete your payment.</i></h1>
    <p>Your application is {status?.toLowerCase() || "pending"}. Portal access unlocks once your Ozow payment is confirmed.</p>
    {error && <p className="auth-error">{error}</p>}
    <div className="hero-actions">
      <button className="button button-dark" onClick={payNow} disabled={paying}>{paying ? "Starting payment…" : "Pay now with Ozow"}</button>
      <button className="text-link dark-link" onClick={onLogout}>Sign out</button>
    </div>
  </main>;
}

function PortalShell({ name, role, active, children, onLogout, onProfile }: { name: string; role: "STUDENT" | "ADMIN"; children: ReactNode; active: string; onLogout: () => void; onProfile?: () => void }) {
  return <main className="portal-shell"><aside className="portal-sidebar"><Link className="brand brand-logo portal-brand" href="/"><Image src="/herc_logo.svg" alt="Hulisani Education Resources Centre" width={155} height={65} /></Link><button className="portal-user" onClick={onProfile} aria-label={role === "STUDENT" ? "Open account settings" : "Open account profile"}><span>{name.slice(0, 1).toUpperCase()}</span><div><strong>{name}</strong><small>{role === "ADMIN" ? "Administrator" : "PV GreenCard student"}</small></div><Settings2 size={15} /></button><nav className="portal-nav"><a className={active === "overview" ? "active" : ""} href="#overview"><BookOpen size={17} /> Overview</a>{role === "ADMIN" && <a className={active === "registrations" ? "active" : ""} href="#registrations"><Users size={17} /> Registrations</a>}<a className={active === "materials" ? "active" : ""} href="#materials"><FileText size={17} /> Course materials</a><a className={active === "certificates" ? "active" : ""} href="#certificates"><ShieldCheck size={17} /> Certificates</a>{role === "ADMIN" && <a className={active === "settings" ? "active" : ""} href="#settings"><Settings2 size={17} /> Admin controls</a>}</nav><button className="logout-button" onClick={onLogout}><LogOut size={16} /> Sign out</button></aside><section className="portal-main"><header className="portal-header"><div><span className="portal-kicker">HERC workspace / 2026</span><h2>{role === "ADMIN" ? "Command centre" : "Your learning space"}</h2></div><Link className="portal-public-link" href="/">View public site <ChevronRight size={15} /></Link></header>{children}</section></main>;
}

function StudentProfile({ me, onClose, onSaved }: { me: StudentMe; onClose: () => void; onSaved: (name: string) => void }) {
  const [form, setForm] = useState({
    firstName: me.firstName || "", middleName: me.middleName || "", surname: me.surname || "", email: me.email || "",
    phone: me.phone || "", address: me.address || "", nationality: me.nationality || "", ethnicity: me.ethnicity || "",
    homeLanguage: me.homeLanguage || "", qualification: me.qualification || "", experience: me.experience || "",
    tradeTest: me.tradeTest === "YES" ? "Yes" : "No", tradeTestDetails: me.tradeTestDetails || "",
  });
  const [saved, setSaved] = useState("");
  const [error, setError] = useState("");
  function update(name: string, value: string) { setForm((current) => ({ ...current, [name]: value })); }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/students/me", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await response.json();
    if (!response.ok) { setError(data.error || "Unable to save changes."); return; }
    onSaved(data.name); setSaved("Details saved"); setTimeout(() => setSaved(""), 2200);
  }
  return <div className="profile-overlay" role="dialog" aria-modal="true" aria-label="Account settings"><div className="profile-panel"><div className="profile-panel-head"><div><span className="portal-kicker">Account settings</span><h2>Your profile</h2><p>Keep your student details current for HERC communications.</p></div><button className="close-profile" onClick={onClose} aria-label="Close account settings"><X /></button></div>{error && <p className="auth-error">{error}</p>}<form className="profile-form" onSubmit={save}><div className="form-section-label">Personal details</div><div className="auth-form-grid"><label className="field"><span>First name(s)</span><input value={form.firstName} onChange={(event) => update("firstName", event.target.value)} /></label><label className="field"><span>Surname</span><input value={form.surname} onChange={(event) => update("surname", event.target.value)} /></label></div><label className="field"><span>Middle name(s)</span><input value={form.middleName} onChange={(event) => update("middleName", event.target.value)} /></label><div className="auth-form-grid"><label className="field"><span>Email address</span><input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} /></label><label className="field"><span>Phone number</span><input value={form.phone} onChange={(event) => update("phone", event.target.value)} /></label></div><label className="field"><span>Residential address</span><input value={form.address} onChange={(event) => update("address", event.target.value)} /></label><div className="form-section-label">Background</div><div className="auth-form-grid"><label className="field"><span>Nationality</span><input value={form.nationality} onChange={(event) => update("nationality", event.target.value)} /></label><label className="field"><span>Home language</span><input value={form.homeLanguage} onChange={(event) => update("homeLanguage", event.target.value)} /></label></div><label className="field"><span>Ethnicity</span><select value={form.ethnicity} onChange={(event) => update("ethnicity", event.target.value)}><option value="">Prefer not to say</option><option>African</option><option>Coloured</option><option>Indian / Asian</option><option>White</option><option>Other</option></select></label><div className="form-section-label">Education and experience</div><label className="field"><span>Highest qualification</span><input value={form.qualification} onChange={(event) => update("qualification", event.target.value)} /></label><label className="field"><span>Relevant experience</span><textarea value={form.experience} onChange={(event) => update("experience", event.target.value)} /></label><fieldset><legend>Do you have a trade test?</legend><label><input type="radio" name="profile-trade-test" checked={form.tradeTest === "Yes"} onChange={() => update("tradeTest", "Yes")} /> Yes</label><label><input type="radio" name="profile-trade-test" checked={form.tradeTest === "No"} onChange={() => update("tradeTest", "No")} /> No</label></fieldset>{form.tradeTest === "Yes" && <label className="field"><span>Which trade test?</span><input value={form.tradeTestDetails} onChange={(event) => update("tradeTestDetails", event.target.value)} /></label>}<div className="profile-actions"><button className="button button-dark" type="submit"><Save size={16} /> Save changes</button><button className="profile-cancel" type="button" onClick={onClose}>Cancel</button>{saved && <span className="profile-saved"><Check size={14} /> {saved}</span>}</div></form></div></div>;
}

function StudentPortal({ me, onLogout }: { me: StudentMe; onLogout: () => void }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [name, setName] = useState(me.name || "");
  const cohorts = me.cohorts || [];
  const content = me.content;
  return <PortalShell name={name} role="STUDENT" active="overview" onLogout={onLogout} onProfile={() => setProfileOpen(true)}>
    <div className="portal-welcome" id="overview"><div><p className="eyebrow"><span /> Student dashboard</p><h1>{content?.welcomeMessage}</h1><p>Your PV GreenCard journey, organised in one calm place.</p></div><div className="portal-sun"><Sun size={38} /></div></div>
    <div className="portal-grid"><article className="portal-card progress-card"><div className="card-heading"><span>Programme progress</span><span className={`status-pill ${me.status === "APPROVED" ? "approved-pill" : ""}`}>{me.status?.toLowerCase() || "pending"}</span></div><h3>{content?.programmeTitle}</h3><div className="progress-track"><span /></div><div className="progress-meta"><span>Application status</span><strong>{me.status?.toLowerCase() || "pending"}</strong></div><p>{content?.programmeDescription}</p></article><article className="portal-card next-card"><div className="card-heading"><span>Next available intake</span><Sun size={20} /></div><h3>{cohorts[0]?.training}</h3><p>Training</p><strong>Assessment · {cohorts[0]?.assessment}</strong><a href="#materials">View preparation materials <ChevronRight size={15} /></a></article></div>
    <section className="portal-section" id="materials"><div className="section-heading"><div><span className="portal-kicker">Your resources</span><h2>Course materials</h2></div><span className="count-label">{materials.length} resources</span></div><div className="material-list">{materials.map((material) => <div className="material-row" key={material.title}><span className="file-icon"><FileText size={19} /></span><div><strong>{material.title}</strong><small>{material.type}</small></div><span className={material.status === "Available" ? "material-status available" : "material-status"}>{material.status}</span><button aria-label={`Open ${material.title}`}><ChevronRight size={17} /></button></div>)}</div></section>
    <section className="portal-section certificate-section" id="certificates"><div className="section-heading"><div><span className="portal-kicker">Your achievements</span><h2>Certificates</h2></div></div>{me.certificate ? <div className="certificate-ready"><span className="certificate-seal"><ShieldCheck size={27} /></span><div><h3>PV GreenCard certificate</h3><p>Issued by HERC · {new Date(me.certificate.uploadedAt).toLocaleDateString()}</p></div><a className="button button-dark certificate-download" href={me.certificate.blobUrl} download={me.certificate.fileName} target="_blank" rel="noreferrer"><Download size={16} /> Download certificate</a></div> : <div className="empty-certificate"><ShieldCheck size={28} /><div><h3>Your certificate will appear here</h3><p>Once HERC approves and uploads your certificate, it will be available here for download.</p></div></div>}{me.invoiceUrl && <p className="form-note"><FileText size={16} /> <a href={me.invoiceUrl} target="_blank" rel="noreferrer">View your payment invoice</a></p>}</section>
    {profileOpen && <StudentProfile me={me} onClose={() => setProfileOpen(false)} onSaved={(newName) => { setName(newName); setProfileOpen(false); }} />}
  </PortalShell>;
}

function AdminPortal({ me, onLogout }: { me: AdminMe; onLogout: () => void }) {
  const [active, setActive] = useState("overview");
  const [registrations, setRegistrations] = useState(me.registrations);
  const [cohorts, setCohorts] = useState(me.cohorts);
  const [content, setContent] = useState(me.content || { programmeTitle: "", programmeDescription: "", welcomeMessage: "" });
  const [saved, setSaved] = useState("");
  const pending = registrations.filter((item) => item.status === "PENDING");
  const approved = registrations.filter((item) => item.status === "APPROVED");
  function flash(message: string) { setSaved(message); setTimeout(() => setSaved(""), 2200); }

  async function updateStatus(id: string, status: "approved" | "rejected") {
    const response = await fetch(`/api/admin/registrations/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    if (response.ok) setRegistrations(registrations.map((item) => item.id === id ? { ...item, status: status.toUpperCase() } : item));
  }
  async function saveCohorts() {
    const response = await fetch("/api/admin/cohorts", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cohorts }) });
    if (response.ok) flash("Cohorts updated");
  }
  async function saveContent(event: FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(content) });
    if (response.ok) flash("Portal content updated");
  }
  function addCohort() { setCohorts([...cohorts, { id: crypto.randomUUID(), label: "New cohort", training: "New training dates", assessment: "New assessment dates" }]); }
  async function uploadCertificate(studentId: string, file: File) {
    const form = new FormData();
    form.set("file", file);
    const response = await fetch(`/api/admin/certificates/${studentId}`, { method: "POST", body: form });
    if (response.ok) { setRegistrations(registrations.map((item) => item.id === studentId ? { ...item, certificateReady: true } : item)); flash("Certificate made available to the student"); }
  }

  return <PortalShell name={me.name} role="ADMIN" active={active} onLogout={onLogout}>
    <div className="admin-overview" id="overview"><div><p className="eyebrow"><span /> Administrator access</p><h1>Shape the<br /><i>learning journey.</i></h1><p>Every application, resource and cohort is within reach from here.</p></div><div className="admin-signal"><span>Live system</span><strong>●</strong></div></div>
    <div className="admin-stats"><button onClick={() => setActive("registrations")}><span>Pending registrations</span><strong>{pending.length}</strong><small>Review queue <ChevronRight size={14} /></small></button><button><span>Approved students</span><strong>{approved.length}</strong><small>Certificate workflow <ChevronRight size={14} /></small></button><button onClick={() => setActive("materials")}><span>Published resources</span><strong>03</strong><small>Manage library <ChevronRight size={14} /></small></button></div>
    <section className="admin-panel" id="registrations"><div className="section-heading"><div><span className="portal-kicker">Admissions desk</span><h2>Registration review</h2></div><span className="count-label">{registrations.length} total applications</span></div>{registrations.length === 0 ? <div className="admin-empty"><Users size={28} /><p>No registrations yet. New programme applications will appear here.</p></div> : <div className="registration-table"><div className="table-head"><span>Candidate</span><span>Qualification</span><span>Preferred cohort</span><span>Status</span><span>Certificate</span></div>{registrations.map((item) => <div className="table-row" key={item.id}><div><span className="avatar">{item.name.slice(0, 1)}</span><span><strong>{item.name}</strong><small>{item.email}</small></span></div><span>{item.qualification || "Not supplied"}</span><span>{item.cohort || "To be assigned"}</span><span className={`review-status ${item.status.toLowerCase()}`}>{item.status.toLowerCase()}{item.paid ? " · paid" : " · unpaid"}</span><span className="certificate-action">{item.status === "PENDING" && <span className="review-actions"><button className="approve" onClick={() => updateStatus(item.id, "approved")} title="Approve"><Check size={15} /></button><button className="reject" onClick={() => updateStatus(item.id, "rejected")} title="Reject"><X size={15} /></button></span>}{item.status === "APPROVED" && <>{item.certificateReady && <span className="certificate-uploaded"><Check size={13} /> Ready</span>}<label className="certificate-upload-button"><Upload size={14} /> {item.certificateReady ? "Replace" : "Upload"}<input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(event) => { const file = event.target.files?.[0]; if (file) uploadCertificate(item.id, file); }} /></label></>}</span></div>)}</div>}</section>
    <section className="admin-panel" id="settings"><div className="section-heading"><div><span className="portal-kicker">Programme operations</span><h2>Available cohorts</h2></div><button className="small-action" onClick={addCohort}><Plus size={15} /> Add cohort</button></div><div className="cohort-editor">{cohorts.map((cohort, index) => <div className="cohort-edit-row" key={cohort.id}><span className="cohort-number">0{index + 1}</span><label><small>Training</small><input value={cohort.training} onChange={(event) => setCohorts(cohorts.map((item) => item.id === cohort.id ? { ...item, training: event.target.value, label: event.target.value } : item))} /></label><label><small>Assessment</small><input value={cohort.assessment} onChange={(event) => setCohorts(cohorts.map((item) => item.id === cohort.id ? { ...item, assessment: event.target.value } : item))} /></label></div>)}</div><button className="button button-dark save-button" onClick={saveCohorts}><Save size={16} /> Save available dates</button></section>
    <section className="admin-panel" id="materials"><div className="section-heading"><div><span className="portal-kicker">Content studio</span><h2>Portal content</h2></div></div><form className="content-editor" onSubmit={saveContent}><label className="field"><span>Programme title</span><input value={content.programmeTitle} onChange={(event) => setContent({ ...content, programmeTitle: event.target.value })} /></label><label className="field"><span>Programme description</span><textarea value={content.programmeDescription} onChange={(event) => setContent({ ...content, programmeDescription: event.target.value })} /></label><label className="field"><span>Student welcome message</span><textarea value={content.welcomeMessage} onChange={(event) => setContent({ ...content, welcomeMessage: event.target.value })} /></label><button className="button button-dark save-button" type="submit"><Save size={16} /> Publish portal updates</button></form></section>{saved && <div className="save-toast"><Check size={16} /> {saved}</div>}
  </PortalShell>;
}
