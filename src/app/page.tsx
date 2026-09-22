"use client";

import { FormEvent, useState } from "react";
import { ArrowUpRight, Check, ChevronDown, FileText, Mail, MapPin, Menu, MessageCircle, ShieldCheck, Sparkles, Sun, Users, X } from "lucide-react";

const cohorts = [
  "5-9 October 2026 (Training) and 12-13 October 2026 (Assessment)",
  "26-30 October 2026 (Training) and 2-3 November 2026 (Assessment)",
  "16-20 November 2026 (Training) and 23-24 November (Assessment)",
];
const navItems = ["About HERC", "The programme", "Why PV GreenCard", "The venue"];

function Field({ label, name, type = "text" }: { label: string; name: string; type?: string }) {
  return <label className="field"><span>{label} <b>*</b></span><input name={name} type={type} required /></label>;
}

function RegistrationForm({ onSubmit }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <form onSubmit={onSubmit}>
    <div className="form-grid">
      <Field label="Full names and surname" name="full-name" />
      <Field label="Email address" name="email" type="email" />
      <Field label="Phone number" name="phone" type="tel" />
      <Field label="Residential address" name="address" />
      <Field label="Qualification" name="qualification" />
    </div>
    <fieldset><legend>Are you aware of the R12,550 all-inclusive cost? *</legend><label><input type="radio" name="cost-aware" value="Yes" required /> Yes</label><label><input type="radio" name="cost-aware" value="No" /> No</label></fieldset>
    <fieldset><legend>How would you prefer to receive the invoice? *</legend><label><input type="radio" name="invoice" value="Email" required /> Email</label><label><input type="radio" name="invoice" value="WhatsApp" /> WhatsApp</label><label><input type="radio" name="invoice" value="Either" /> Either is fine</label></fieldset>
    <label className="field"><span>Preferred training date *</span><select name="cohort" defaultValue="" required><option value="" disabled>Select an available cohort</option>{cohorts.map((cohort) => <option key={cohort}>{cohort}</option>)}</select><ChevronDown className="select-icon" size={17} /></label>
    <fieldset><legend>Can you attend at Sekhukhune Skills Centre in Aquaville? *</legend><label><input type="radio" name="venue" value="Yes" required /> Yes</label><label><input type="radio" name="venue" value="No" /> No</label></fieldset>
    <p className="form-note"><ShieldCheck size={16} /> Candidates provide their own PPE. Travel and accommodation are for the candidate&apos;s own account.</p>
    <div className="upload-grid">
      <label className="upload"><FileText size={20} /><span>Curriculum Vitae <small>PDF or image · up to 5 files</small></span><input type="file" name="cv" accept=".pdf,image/*" multiple /></label>
      <label className="upload"><FileText size={20} /><span>Qualifications <small>PDF, document or image · up to 5</small></span><input type="file" name="qualifications" accept=".pdf,.doc,.docx,image/*" multiple /></label>
      <label className="upload"><FileText size={20} /><span>ID Copy <small>PDF, document or image · up to 5 files</small></span><input type="file" name="id-copy" accept=".pdf,.doc,.docx,image/*" multiple /></label>
    </div>
    <button className="button button-dark submit-button" type="submit">Submit registration <ArrowUpRight size={17} /></button>
  </form>;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const openForm = () => { setFormOpen(true); setSubmitted(false); };
  const submitForm = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSubmitted(true); };

  return <main>
    <header className="site-header">
      <a className="brand" href="#top"><span className="brand-mark"><Sun size={22} strokeWidth={2.5} /></span><span>HERC <small>Hulisani Education<br />Resources Centre</small></span></a>
      <nav className={menuOpen ? "nav-links nav-open" : "nav-links"}>{navItems.map((item) => <a key={item} href={`#${item.toLowerCase().replaceAll(" ", "-")}`} onClick={() => setMenuOpen(false)}>{item}</a>)}<a className="mobile-portal" href="#portal">Student portal <ArrowUpRight size={15} /></a></nav>
      <a className="portal-link" href="#portal">Student portal <ArrowUpRight size={16} /></a>
      <button className="icon-button menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">{menuOpen ? <X /> : <Menu />}</button>
    </header>

    <section className="hero" id="top"><div className="hero-grid" /><div className="sun-disc" /><div className="hero-content"><p className="eyebrow"><span /> Education for a powered future</p><h1>Build a career<br />that <em>moves</em> energy.</h1><p className="hero-copy">HERC equips ambitious people with practical, accredited skills for South Africa&apos;s renewable energy future.</p><div className="hero-actions"><button className="button button-light" onClick={openForm}>Register for PV GreenCard <ArrowUpRight size={17} /></button><a className="text-link light-link" href="#the-programme">Explore the programme <span>↓</span></a></div></div><div className="hero-note"><span className="note-line" /><span>Now enrolling</span><strong>PV GreenCard · 2026</strong></div><div className="hero-stamp"><Sun size={20} /><span>Energy<br />starts<br />here</span></div></section>

    <section className="intro section-pad" id="about-herc"><div className="section-kicker">01 <span>About HERC</span></div><div className="intro-layout"><h2>Skills with a<br /><i>real-world</i> charge.</h2><div className="intro-body"><p>Hulisani Education Resources Centre is a practical learning hub for people who want to do meaningful work in a changing world.</p><p>We make technical education feel possible, personal and connected to opportunity. Starting with solar, we&apos;re building the people who will power what comes next.</p><a className="text-link dark-link" href="#the-programme">Our approach <ArrowUpRight size={16} /></a></div></div><div className="stats-row"><div><strong>01</strong><span>Purpose-built<br />learning centre</span></div><div><strong>SAPVIA</strong><span>Accredited<br />PV GreenCard</span></div><div><strong>100%</strong><span>Practical, career-<br />ready training</span></div></div></section>

    <section className="programme section-pad" id="the-programme"><div className="section-kicker light-kicker">02 <span>The programme</span></div><div className="programme-heading"><h2>Get certified.<br /><i>Get moving.</i></h2><p>A complete five-day training and two-day assessment experience, designed to take you from curious to capable.</p></div><div className="programme-cards"><article className="programme-card featured"><div className="card-top"><span>01 / Learn</span><Sun size={26} /></div><h3>PV GreenCard<br />Training</h3><p>Build a foundation in photovoltaic systems, installation principles, safety and best practice.</p><strong>5 days <small>of practical learning</small></strong></article><article className="programme-card"><div className="card-top"><span>02 / Prove</span><ShieldCheck size={26} /></div><h3>PV GreenCard<br />Assessment</h3><p>Put your knowledge into practice and earn an industry-recognised certificate accredited with SAPVIA.</p><strong>2 days <small>to show your skill</small></strong></article><article className="programme-card"><div className="card-top"><span>03 / Belong</span><Users size={26} /></div><h3>Join the energy<br />community</h3><p>Leave with a credential, a network and a clearer path into South Africa&apos;s solar economy.</p><strong>1 future <small>wide open</small></strong></article></div></section>

    <section className="quote-section"><div className="quote-mark">“</div><blockquote>There is no future in waiting<br /><i>for the future.</i></blockquote><p>HERC exists to help you meet it prepared.</p></section>

    <section className="details section-pad" id="why-pv-greencard"><div className="section-kicker">03 <span>Make your move</span></div><div className="details-layout"><div><h2>A qualification<br />that <i>travels.</i></h2><p className="large-copy">The PV GreenCard is more than a certificate. It&apos;s a signal that you have the knowledge, discipline and practical grounding to work with solar systems safely.</p><button className="button button-dark" onClick={openForm}>Start your application <ArrowUpRight size={17} /></button></div><div className="detail-list"><div><span>01</span><div><h3>Industry recognised</h3><p>Accredited with SAPVIA, South Africa&apos;s voice for solar PV.</p></div></div><div><span>02</span><div><h3>All-inclusive investment</h3><p>Five days training and two days assessment for R12,550.</p></div></div><div><span>03</span><div><h3>Small enough to be personal</h3><p>Learn in a focused environment at Sekhukhune Skills Centre.</p></div></div></div></div></section>

    <section className="venue" id="the-venue"><div className="venue-content"><div className="section-kicker light-kicker">04 <span>Find us</span></div><h2>Learn where<br /><i>things grow.</i></h2><p>Sekhukhune Skills Centre<br />Aquaville, Groblersdal<br />Limpopo, South Africa</p><a className="button button-light" href="https://www.google.com/maps/search/?api=1&query=Sekhukhune+Skills+Centre+Aquaville+Groblersdal" target="_blank" rel="noreferrer">Get directions <MapPin size={17} /></a></div><div className="map-art"><div className="map-grid" /><div className="map-road road-one" /><div className="map-road road-two" /><div className="map-pin"><MapPin size={23} fill="currentColor" /></div><span className="map-label">Sekhukhune<br />Skills Centre</span><span className="map-compass">N<br /><b>+</b></span></div></section>

    <section className="cta section-pad" id="portal"><div><p className="eyebrow"><Sparkles size={16} /> Coming next</p><h2>Your learning.<br /><i>Your portal.</i></h2><p>Registered students will soon have a home for course materials, assessment updates and downloadable certificates.</p></div><a className="portal-coming" href="mailto:info@herc.org.za?subject=HERC student portal access">Student portal <ArrowUpRight size={18} /></a></section>

    <footer><div className="footer-brand"><a className="brand" href="#top"><span className="brand-mark"><Sun size={22} strokeWidth={2.5} /></span><span>HERC <small>Hulisani Education<br />Resources Centre</small></span></a><p>Practical education for a<br />powered future.</p></div><div className="footer-contact"><span>Connect with HERC</span><a href="mailto:info@herc.org.za"><Mail size={15} /> info@herc.org.za</a><a href="https://wa.me/27724931995" target="_blank" rel="noreferrer"><MessageCircle size={15} /> 072 493 1995 <small>WhatsApp</small></a></div><div className="footer-social"><span>HERC · 2026</span><span className="footer-credit">Website built by <a href="https://www.drmcgi.co.za" target="_blank" rel="noreferrer">DrMcGi</a><small>DrMcGi&apos;s SaaS Atelier (Pty) Ltd.</small></span></div></footer>

    {formOpen && <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="PV GreenCard registration"><div className="form-modal"><button className="close-modal" onClick={() => setFormOpen(false)} aria-label="Close registration form"><X /></button>{submitted ? <div className="success-state"><span className="success-icon"><Check /></span><p className="eyebrow">Application received</p><h2>You&apos;re on<br /><i>the move.</i></h2><p>Thank you for registering your interest in the PV GreenCard programme. The HERC team will be in touch with next steps.</p><button className="button button-dark" onClick={() => setFormOpen(false)}>Back to HERC <ArrowUpRight size={17} /></button></div> : <><p className="eyebrow">PV GreenCard · 2026 intake</p><h2>Start your<br /><i>application.</i></h2><p className="form-intro">Complete the form below and our team will follow up with your next steps.</p><RegistrationForm onSubmit={submitForm} /></>}</div></div>}
  </main>;
}
