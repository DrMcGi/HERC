"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Check, Mail, MapPin, Menu, MessageCircle, ShieldCheck, Sparkles, Sun, Users, X } from "lucide-react";
import Image from "next/image";
import RegistrationForm from "./components/student-registration-form";

const navItems = ["About HERC", "The programme", "Why PV GreenCard", "The venue"];
const heroSlides = ["/hero/hero1.jpg", "/hero/hero2.jpg", "/hero/hero3.jpg"];

type Cohort = { training: string; assessment: string };

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [cohorts, setCohorts] = useState<string[]>([]);
  useEffect(() => {
    fetch("/api/cohorts").then((response) => response.json()).then((data) => {
      setCohorts((data.cohorts as Cohort[]).map((cohort) => `${cohort.training} (Training) and ${cohort.assessment} (Assessment)`));
    }).catch(() => setCohorts([]));
  }, []);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setActiveSlide((current) => (current + 1) % heroSlides.length), 6500);
    return () => window.clearInterval(timer);
  }, []);
  const openForm = () => { setFormOpen(true); setSubmitted(false); };
  const submitForm = () => setSubmitted(true);

  return <main>
    <header className="site-header">
      <a className="brand brand-logo" href="#top"><Image src="/herc_logo.svg" alt="Hulisani Education Resources Centre" width={155} height={65} priority /></a>
      <nav className={menuOpen ? "nav-links nav-open" : "nav-links"}>{navItems.map((item) => <a key={item} href={`#${item.toLowerCase().replaceAll(" ", "-")}`} onClick={() => setMenuOpen(false)}>{item}</a>)}<a className="mobile-portal" href="/auth">Student portal <ArrowUpRight size={15} /></a><a className="mobile-portal admin-nav-link" href="/auth">Admin login <ArrowUpRight size={15} /></a></nav>
      <div className="portal-links"><a className="portal-link" href="/auth">Student portal <ArrowUpRight size={16} /></a><a className="admin-link" href="/auth">Admin login</a></div>
      <button className="icon-button menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">{menuOpen ? <X /> : <Menu />}</button>
    </header>

    <section className="hero" id="top">
      <div className="hero-slides" aria-hidden="true">
        {heroSlides.map((src, index) => <div className={`hero-slide${activeSlide === index ? " is-active" : ""}`} key={src}>
          <Image src={src} alt="" fill sizes="100vw" priority={index === 0} loading="eager" />
        </div>)}
      </div>
      <div className="hero-shade" />
      <div className="hero-content"><p className="eyebrow"><span /> Education for a powered future</p><h1>Build a career<br />that <em>moves</em> energy.</h1><p className="hero-copy">HERC equips ambitious people with practical, accredited skills for South Africa&apos;s renewable energy future.</p><div className="hero-actions"><button className="button button-light" onClick={openForm}>Register for PV GreenCard <ArrowUpRight size={17} /></button><a className="text-link light-link" href="#the-programme">Explore the programme <span>↓</span></a></div></div>
      <div className="hero-note"><span className="note-line" /><span>Now enrolling</span><strong>PV GreenCard · 2026</strong></div>
      <div className="hero-pagination" aria-label="Choose hero image">{heroSlides.map((src, index) => <button key={src} type="button" className={activeSlide === index ? "is-active" : ""} onClick={() => setActiveSlide(index)} aria-label={`Show image ${index + 1}`} aria-pressed={activeSlide === index} />)}</div>
    </section>

    <section className="intro section-pad" id="about-herc"><div className="section-kicker">01 <span>About HERC</span></div><div className="intro-layout"><h2>Skills with a<br /><i>real-world</i> charge.</h2><div className="intro-body"><p>Hulisani Education Resources Centre is a practical learning hub for people who want to do meaningful work in a changing world.</p><p>We make technical education feel possible, personal and connected to opportunity. Starting with solar, we&apos;re building the people who will power what comes next.</p><a className="text-link dark-link" href="#the-programme">Our approach <ArrowUpRight size={16} /></a></div></div><div className="stats-row"><div><strong>01</strong><span>Purpose-built<br />learning centre</span></div><div><strong>SAPVIA</strong><span>Accredited<br />PV GreenCard</span></div><div><strong>100%</strong><span>Practical, career-<br />ready training</span></div></div></section>

    <section className="programme section-pad" id="the-programme"><div className="section-kicker light-kicker">02 <span>The programme</span></div><div className="programme-heading"><h2>Get certified.<br /><i>Get moving.</i></h2><p>A complete five-day training and two-day assessment experience, designed to take you from curious to capable.</p></div><div className="programme-cards"><article className="programme-card featured"><div className="card-top"><span>01 / Learn</span><Sun size={26} /></div><h3>PV GreenCard<br />Training</h3><p>Build a foundation in photovoltaic systems, installation principles, safety and best practice.</p><strong>5 days <small>of practical learning</small></strong></article><article className="programme-card"><div className="card-top"><span>02 / Prove</span><ShieldCheck size={26} /></div><h3>PV GreenCard<br />Assessment</h3><p>Put your knowledge into practice and earn an industry-recognised certificate accredited with SAPVIA.</p><strong>2 days <small>to show your skill</small></strong></article><article className="programme-card"><div className="card-top"><span>03 / Belong</span><Users size={26} /></div><h3>Join the energy<br />community</h3><p>Leave with a credential, a network and a clearer path into South Africa&apos;s solar economy.</p><strong>1 future <small>wide open</small></strong></article></div></section>

    <section className="quote-section"><div className="quote-mark">“</div><blockquote>There is no future in waiting<br /><i>for the future.</i></blockquote><p>HERC exists to help you meet it prepared.</p></section>

    <section className="details section-pad" id="why-pv-greencard"><div className="section-kicker">03 <span>Make your move</span></div><div className="details-layout"><div><h2>A qualification<br />that <i>travels.</i></h2><p className="large-copy">The PV GreenCard is more than a certificate. It&apos;s a signal that you have the knowledge, discipline and practical grounding to work with solar systems safely.</p><button className="button button-dark" onClick={openForm}>Start your application <ArrowUpRight size={17} /></button></div><div className="detail-list"><div><span>01</span><div><h3>Industry recognised</h3><p>Accredited with SAPVIA, South Africa&apos;s voice for solar PV.</p></div></div><div><span>02</span><div><h3>All-inclusive investment</h3><p>Five days training and two days assessment for R12,550.</p></div></div><div><span>03</span><div><h3>Small enough to be personal</h3><p>Learn in a focused environment at Sekhukhune Skills Centre.</p></div></div></div></div></section>

    <section className="venue" id="the-venue"><div className="venue-content"><div className="section-kicker light-kicker">04 <span>Find us</span></div><h2>Learn where<br /><i>things grow.</i></h2><p>Sekhukhune Skills Centre<br />Aquaville, Groblersdal<br />Limpopo, South Africa</p><a className="button button-light" href="https://www.google.com/maps/dir/?api=1&destination=Sekhukhune+TVET+College+Skills+Centre%2C+Aquaville&destination_place_id=ChIJ53MBKGQ1wB4RzDxiRzlO_ZA" target="_blank" rel="noopener noreferrer">Get directions <MapPin size={17} /></a></div><div className="venue-map"><iframe title="Explore Sekhukhune TVET College Skills Centre in Aquaville, Groblersdal on Google Maps" src="https://www.google.com/maps?q=-25.1657599%2C29.357412&ll=-25.1657599%2C29.357412&z=18&output=embed" loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" /></div></section>

    <section className="cta section-pad" id="portal"><div><p className="eyebrow"><Sparkles size={16} /> Your next chapter</p><h2>Your learning.<br /><i>Your portal.</i></h2><p>Registered students have a home for course materials, assessment updates and downloadable certificates. Admins can manage the whole experience.</p></div><a className="portal-coming" href="/auth">Enter the workspace <ArrowUpRight size={18} /></a></section>

    <footer><div className="footer-brand"><a className="brand brand-logo" href="#top"><Image src="/herc_logo.svg" alt="Hulisani Education Resources Centre" width={155} height={65} /></a><p>Practical education for a<br />powered future.</p></div><div className="footer-contact"><span>Connect with HERC</span><a href="mailto:info@herc.org.za"><Mail size={15} /> info@herc.org.za</a><a href="https://wa.me/27724931995" target="_blank" rel="noreferrer"><MessageCircle size={15} /> 072 493 1995 <small>WhatsApp</small></a></div><div className="footer-social"><span>HERC · 2026</span><span className="footer-credit">Website built by <a href="https://www.drmcgi.co.za" target="_blank" rel="noreferrer">DrMcGi</a><small>DrMcGi&apos;s SaaS Atelier (Pty) Ltd.</small></span></div></footer>

    {formOpen && <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="PV GreenCard registration"><div className="form-modal"><button className="close-modal" onClick={() => setFormOpen(false)} aria-label="Close registration form"><X /></button>{submitted ? <div className="success-state"><span className="success-icon"><Check /></span><p className="eyebrow">Application received</p><h2>You&apos;re on<br /><i>the move.</i></h2><p>Your student registration has been saved. The HERC team will review your application and follow up with next steps.</p><button className="button button-dark" onClick={() => setFormOpen(false)}>Back to HERC <ArrowUpRight size={17} /></button></div> : <><p className="eyebrow">PV GreenCard · 2026 intake</p><h2>Start your<br /><i>application.</i></h2><p className="form-intro">Complete the form below and our team will follow up with your next steps.</p><RegistrationForm cohorts={cohorts} onSubmit={submitForm} /></>}</div></div>}
  </main>;
}
