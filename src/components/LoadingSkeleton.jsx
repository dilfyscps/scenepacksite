import React from "react";

export function PageLoadingShell({ children }) {
  return <div className="page-loading-shell">{children}</div>;
}

export function PackGridSkeleton({ count = 8 }) {
  return (
    <div className="packs-grid skeleton-grid">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-block skeleton-block--poster" />
          <div className="skeleton-block skeleton-block--title" />
        </div>
      ))}
    </div>
  );
}

export function PackPageSkeleton() {
  return (
    <PageLoadingShell>
      <div className="skeleton-pack-page">
        <div className="skeleton-block skeleton-block--back" />
        <div className="skeleton-pack-layout">
          <div className="skeleton-block skeleton-block--pack-poster" />
          <div className="skeleton-pack-details">
            <div className="skeleton-block skeleton-block--badge" />
            <div className="skeleton-block skeleton-block--heading" />
            <div className="skeleton-block skeleton-block--line" />
            <div className="skeleton-block skeleton-block--line skeleton-block--short" />
            <div className="skeleton-block skeleton-block--button" />
          </div>
        </div>
      </div>
    </PageLoadingShell>
  );
}

export function HeroSkeleton() {
  return (
    <div className="skeleton-hero">
      <div className="skeleton-block skeleton-block--badge" />
      <div className="skeleton-block skeleton-block--hero-title" />
      <div className="skeleton-block skeleton-block--line" />
      <div className="skeleton-block skeleton-block--line skeleton-block--short" />
    </div>
  );
}
