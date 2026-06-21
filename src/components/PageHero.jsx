import React from "react";

export default function PageHero({ label, title, highlight, subtitle, meta, children }) {
  return (
    <section className="page-hero">
      <div className="page-hero-glow" aria-hidden="true" />
      <div className="page-hero-inner">
        {label && <span className="page-hero-label">{label}</span>}
        <h1>
          {title}
          {highlight && <span className="page-hero-highlight"> {highlight}</span>}
        </h1>
        {subtitle && <p className="page-hero-subtitle">{subtitle}</p>}
        {meta && <span className="page-hero-meta">{meta}</span>}
        {children}
      </div>
    </section>
  );
}
