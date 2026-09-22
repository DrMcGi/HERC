"use client";

import { FormEvent, ReactNode, useState } from "react";
import { BookOpen, Check, ChevronRight, Download, FileText, LogOut, Plus, Save, Settings2, ShieldCheck, Sun, Upload, Users, X } from "lucide-react";
import Link from "next/link";
import { CERTIFICATES_KEY, Certificate, CONTENT_KEY, Cohort, getCertificates, getContent, getCohorts, getRegistrations, Registration, REGISTRATIONS_KEY, writeStorage } from "../lib/demo-auth";
import { useRouter } from "next/navigation";

type Session = { email: string; name: string; role: "student" | "admin"; status?: string };
const materials = [
  { title: "PV GreenCard learner guide", type: "PDF · 4.8 MB", status: "Available" },
  { title: "Installation safety checklist", type: "PDF · 1.2 MB", status: "Available" },
  { title: "Pre-assessment preparation", type: "PDF · 2.1 MB", status: "Unlocks soon" },
];

export default function PortalPage() {
  const [session] = useState<Session | null>(() => {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem("herc-session");
    return saved ? JSON.parse(saved) : null;
  });
  if (!session) return <main className="portal-gate"><Sun className="portal-gate-sun" size={52} /><h1>Your HERC workspace<br /><i>is waiting.</i></h1><p>Please log in to continue.</p><Link className="button button-dark" href="/auth">Go to login</Link></main>;
  return session.role === "admin" ? <AdminPortal session={session} /> : <StudentPortal session={session} />;
}

function PortalShell({ session, children, active, onLogout }: { session: Session; children: ReactNode; active: string; onLogout: () => void }) {
  return <main className="portal-shell"><aside className="portal-sidebar"><Link className="brand portal-brand" href="/"><span className="brand-mark"><Sun size={22} /></span><span>HERC <small>Learning network</small></span></Link><div className="portal-user"><span>{session.name.slice(0, 1).toUpperCase()}</span><div><strong>{session.name}</strong><small>{session.role === "admin" ? "Administrator" : "PV GreenCard student"}</small></div></div><nav className="portal-nav"><a className={active === "overview" ? "active" : ""} href="#overview"><BookOpen size={17} /> Overview</a>{session.role === "admin" && <a className={active === "registrations" ? "active" : ""} href="#registrations"><Users size={17} /> Registrations</a>}<a className={active === "materials" ? "active" : ""} href="#materials"><FileText size={17} /> Course materials</a><a className={active === "certificates" ? "active" : ""} href="#certificates"><ShieldCheck size={17} /> Certificates</a>{session.role === "admin" && <a className={active === "settings" ? "active" : ""} href="#settings"><Settings2 size={17} /> Admin controls</a>}</nav><button className="logout-button" onClick={onLogout}><LogOut size={16} /> Sign out</button></aside><section className="portal-main"><header className="portal-header"><div><span className="portal-kicker">HERC workspace / 2026</span><h2>{session.role === "admin" ? "Command centre" : "Your learning space"}</h2></div><Link className="portal-public-link" href="/">View public site <ChevronRight size={15} /></Link></header>{children}</section></main>;
}

function StudentPortal({ session }: { session: Session }) {
  const router = useRouter();
  const [content] = useState(getContent());
  const [cohorts] = useState(getCohorts());
  const registration = getRegistrations().find((item) => item.email === session.email);
  const [certificate] = useState<Certificate | undefined>(() => getCertificates().find((item) => item.studentId === registration?.id));
  const logout = () => { localStorage.removeItem("herc-session"); router.push("/auth"); };
  return <PortalShell session={session} active="overview" onLogout={logout}>
    <div className="portal-welcome" id="overview"><div><p className="eyebrow"><span /> Student dashboard</p><h1>{content.welcomeMessage}</h1><p>Your PV GreenCard journey, organised in one calm place.</p></div><div className="portal-sun"><Sun size={38} /></div></div>
    <div className="portal-grid"><article className="portal-card progress-card"><div className="card-heading"><span>Programme progress</span><span className={`status-pill ${registration?.status === "approved" ? "approved-pill" : ""}`}>{registration?.status || "Pending review"}</span></div><h3>{content.programmeTitle}</h3><div className="progress-track"><span /></div><div className="progress-meta"><span>Application status</span><strong>{registration?.status || "pending"}</strong></div><p>{content.programmeDescription}</p></article><article className="portal-card next-card"><div className="card-heading"><span>Next available intake</span><Sun size={20} /></div><h3>{cohorts[0]?.training}</h3><p>Training</p><strong>Assessment · {cohorts[0]?.assessment}</strong><a href="#materials">View preparation materials <ChevronRight size={15} /></a></article></div>
    <section className="portal-section" id="materials"><div className="section-heading"><div><span className="portal-kicker">Your resources</span><h2>Course materials</h2></div><span className="count-label">{materials.length} resources</span></div><div className="material-list">{materials.map((material) => <div className="material-row" key={material.title}><span className="file-icon"><FileText size={19} /></span><div><strong>{material.title}</strong><small>{material.type}</small></div><span className={material.status === "Available" ? "material-status available" : "material-status"}>{material.status}</span><button aria-label={`Open ${material.title}`}><ChevronRight size={17} /></button></div>)}</div></section>
    <section className="portal-section certificate-section" id="certificates"><div className="section-heading"><div><span className="portal-kicker">Your achievements</span><h2>Certificates</h2></div></div>{certificate ? <div className="certificate-ready"><span className="certificate-seal"><ShieldCheck size={27} /></span><div><h3>PV GreenCard certificate</h3><p>Issued by HERC · {new Date(certificate.uploadedAt).toLocaleDateString()}</p></div><a className="button button-dark certificate-download" href={certificate.dataUrl} download={certificate.fileName}><Download size={16} /> Download certificate</a></div> : <div className="empty-certificate"><ShieldCheck size={28} /><div><h3>Your certificate will appear here</h3><p>Once HERC approves and uploads your certificate, it will be available here for download.</p></div></div>}</section>
  </PortalShell>;
}

function AdminPortal({ session }: { session: Session }) {
  const router = useRouter();
  const [active, setActive] = useState("overview");
  const [registrations, setRegistrations] = useState<Registration[]>(getRegistrations());
  const [cohorts, setCohorts] = useState<Cohort[]>(getCohorts());
  const [content, setContent] = useState(getContent());
  const [certificates, setCertificates] = useState<Certificate[]>(getCertificates());
  const [saved, setSaved] = useState("");
  const pending = registrations.filter((item) => item.status === "pending");
  const approved = registrations.filter((item) => item.status === "approved");
  const logout = () => { localStorage.removeItem("herc-session"); router.push("/auth"); };
  function updateStatus(id: string, status: "approved" | "rejected") { const next = registrations.map((item) => item.id === id ? { ...item, status } : item); setRegistrations(next); writeStorage(REGISTRATIONS_KEY, next); }
  function saveCohorts() { writeStorage("herc-cohorts", cohorts); flash("Cohorts updated"); }
  function saveContent(event: FormEvent) { event.preventDefault(); writeStorage(CONTENT_KEY, content); flash("Portal content updated"); }
  function flash(message: string) { setSaved(message); setTimeout(() => setSaved(""), 2200); }
  function addCohort() { setCohorts([...cohorts, { id: crypto.randomUUID(), label: "New cohort", training: "New training dates", assessment: "New assessment dates" }]); }
  function uploadCertificate(studentId: string, file: File) { const reader = new FileReader(); reader.onload = () => { const record: Certificate = { studentId, fileName: file.name, fileType: file.type, dataUrl: String(reader.result), uploadedAt: new Date().toISOString() }; const next = [...certificates.filter((item) => item.studentId !== studentId), record]; setCertificates(next); writeStorage(CERTIFICATES_KEY, next); flash("Certificate made available to the student"); }; reader.readAsDataURL(file); }
  return <PortalShell session={session} active={active} onLogout={logout}>
    <div className="admin-overview" id="overview"><div><p className="eyebrow"><span /> Administrator access</p><h1>Shape the<br /><i>learning journey.</i></h1><p>Every application, resource and cohort is within reach from here.</p></div><div className="admin-signal"><span>Live system</span><strong>●</strong></div></div>
    <div className="admin-stats"><button onClick={() => setActive("registrations")}><span>Pending registrations</span><strong>{pending.length}</strong><small>Review queue <ChevronRight size={14} /></small></button><button><span>Approved students</span><strong>{approved.length}</strong><small>Certificate workflow <ChevronRight size={14} /></small></button><button onClick={() => setActive("materials")}><span>Published resources</span><strong>03</strong><small>Manage library <ChevronRight size={14} /></small></button></div>
    <section className="admin-panel" id="registrations"><div className="section-heading"><div><span className="portal-kicker">Admissions desk</span><h2>Registration review</h2></div><span className="count-label">{registrations.length} total applications</span></div>{registrations.length === 0 ? <div className="admin-empty"><Users size={28} /><p>No registrations yet. New programme applications will appear here.</p></div> : <div className="registration-table"><div className="table-head"><span>Candidate</span><span>Qualification</span><span>Preferred cohort</span><span>Status</span><span>Certificate</span></div>{registrations.map((item) => { const certificate = certificates.find((entry) => entry.studentId === item.id); return <div className="table-row" key={item.id}><div><span className="avatar">{item.name.slice(0, 1)}</span><span><strong>{item.name}</strong><small>{item.email}</small></span></div><span>{item.qualification || "Not supplied"}</span><span>{item.cohort || "To be assigned"}</span><span className={`review-status ${item.status}`}>{item.status}</span><span className="certificate-action">{item.status === "pending" && <span className="review-actions"><button className="approve" onClick={() => updateStatus(item.id, "approved")} title="Approve"><Check size={15} /></button><button className="reject" onClick={() => updateStatus(item.id, "rejected")} title="Reject"><X size={15} /></button></span>}{item.status === "approved" && <>{certificate && <span className="certificate-uploaded"><Check size={13} /> Ready</span>}<label className="certificate-upload-button"><Upload size={14} /> {certificate ? "Replace" : "Upload"}<input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(event) => { const file = event.target.files?.[0]; if (file) uploadCertificate(item.id, file); }} /></label></>}</span></div>; })}</div>}</section>
    <section className="admin-panel" id="settings"><div className="section-heading"><div><span className="portal-kicker">Programme operations</span><h2>Available cohorts</h2></div><button className="small-action" onClick={addCohort}><Plus size={15} /> Add cohort</button></div><div className="cohort-editor">{cohorts.map((cohort, index) => <div className="cohort-edit-row" key={cohort.id}><span className="cohort-number">0{index + 1}</span><label><small>Training</small><input value={cohort.training} onChange={(event) => setCohorts(cohorts.map((item) => item.id === cohort.id ? { ...item, training: event.target.value, label: event.target.value } : item))} /></label><label><small>Assessment</small><input value={cohort.assessment} onChange={(event) => setCohorts(cohorts.map((item) => item.id === cohort.id ? { ...item, assessment: event.target.value } : item))} /></label></div>)}</div><button className="button button-dark save-button" onClick={saveCohorts}><Save size={16} /> Save available dates</button></section>
    <section className="admin-panel" id="materials"><div className="section-heading"><div><span className="portal-kicker">Content studio</span><h2>Portal content</h2></div></div><form className="content-editor" onSubmit={saveContent}><label className="field"><span>Programme title</span><input value={content.programmeTitle} onChange={(event) => setContent({ ...content, programmeTitle: event.target.value })} /></label><label className="field"><span>Programme description</span><textarea value={content.programmeDescription} onChange={(event) => setContent({ ...content, programmeDescription: event.target.value })} /></label><label className="field"><span>Student welcome message</span><textarea value={content.welcomeMessage} onChange={(event) => setContent({ ...content, welcomeMessage: event.target.value })} /></label><button className="button button-dark save-button" type="submit"><Save size={16} /> Publish portal updates</button></form></section>{saved && <div className="save-toast"><Check size={16} /> {saved}</div>}
  </PortalShell>;
}
