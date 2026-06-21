import React from "react";
import { Link } from "react-router-dom";
import { Download, FolderOpen, Monitor, ArrowRight } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageHero from "../components/PageHero";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_META } from "../config/pages";
import "../App.css";

const meta = PAGE_META.guide;

const steps = [
  {
    icon: Download,
    title: "Download the pack",
    text: "Click Download on any pack to open its Mega folder. Mega is free — create an account if you don't have one, then download the full folder or individual files.",
  },
  {
    icon: FolderOpen,
    title: "Extract and organize",
    text: "Unzip the download if needed and keep clips in a dedicated folder. Most packs include video clips (.mp4, .mov) and still images (.jpg, .png) sorted by scene or episode.",
  },
  {
    icon: Monitor,
    title: "Import into your editor",
    text: "Drag files directly into Premiere Pro, DaVinci Resolve, CapCut, After Effects, or any editor that supports standard video and image formats. No special plugins required.",
  },
];

const faqs = [
  {
    q: "What's inside a scenepack?",
    a: "Each pack contains curated clips and stills from a specific show or movie — organized for editors making fan edits, compilations, or creative projects.",
  },
  {
    q: "Do I need Mega premium?",
    a: "No. Free Mega accounts work fine. Large packs may take longer to download on the free tier due to bandwidth limits.",
  },
  {
    q: "Why won't my download start?",
    a: "Mega links open in a new tab. If a link fails, try a different browser or disable popup blockers for mega.nz.",
  },
  {
    q: "Can I request a pack?",
    a: "New packs are added based on demand. Use the Request page to suggest what you'd like next.",
  },
];

export default function Guide() {
  usePageTitle(meta.title);

  return (
    <div className="app-container">
      <Header />

      <main className="guide-page">
        <PageHero
          label={meta.label}
          title={meta.heading}
          highlight={meta.highlight}
          subtitle={meta.subtitle}
        />

        <section className="guide-steps">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <div key={title} className="guide-step">
              <div className="guide-step-number">{i + 1}</div>
              <div className="guide-step-icon">
                <Icon size={22} aria-hidden="true" />
              </div>
              <div>
                <h2>{title}</h2>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="guide-faq">
          <h2>Frequently asked questions</h2>
          <div className="guide-faq-list">
            {faqs.map(({ q, a }) => (
              <details key={q} className="guide-faq-item">
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="guide-cta">
          <h2>Ready to browse?</h2>
          <p>Pick a pack and start downloading.</p>
          <div className="guide-cta-links">
            <Link to="/packs" className="hero-cta primary">
              Browse All Packs
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link to="/request" className="hero-cta secondary">
              Request a pack
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
