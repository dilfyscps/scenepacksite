import React from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PackCardLink from "../components/PackCardLink";
import DownloadButton from "../components/DownloadButton";
import PackPreviewGallery from "../components/PackPreviewGallery";
import { PackPageSkeleton } from "../components/LoadingSkeleton";
import {
  getPackBySlug,
  getRelatedPacks,
  formatDownloads,
  formatPackSize,
  isNewPack,
} from "../utils/packUtils";
import { usePacks } from "../context/PacksContext";
import { useDownloadStats } from "../hooks/useDownloadStats";
import { usePageTitle } from "../hooks/usePageTitle";
import { getPackPageTitle, PAGE_META } from "../config/pages";
import "../App.css";

export default function PackPage() {
  const { slug } = useParams();
  const { packs, loading } = usePacks();
  const pack = getPackBySlug(packs, slug);
  const { stats, refetch } = useDownloadStats();

  usePageTitle(loading ? undefined : getPackPageTitle(pack?.title));

  if (loading) {
    return (
      <div className="app-container">
        <Header />
        <PackPageSkeleton />
        <Footer />
      </div>
    );
  }

  if (!pack) {
    return (
      <div className="app-container">
        <Header />
        <main className="pack-page">
          <Link to="/packs" className="back-link">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to all packs
          </Link>
          <div className="empty-state">
            <h3>{PAGE_META.pack.notFound}</h3>
            <p>That pack isn&apos;t in the catalog — it may have been removed or the link is wrong.</p>
            <Link to="/packs" className="hero-cta primary">
              Browse all packs
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const related = getRelatedPacks(packs, pack);
  const downloadCount = stats[pack.slug] || 0;
  const downloadLabel = formatDownloads(downloadCount);
  const sizeLabel = formatPackSize(pack);
  const showNew = isNewPack(pack);
  const hasDownload = Boolean(pack.download?.trim());

  return (
    <div className="app-container">
      <Header />

      <main className="pack-page">
        <Link to="/packs" className="back-link">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to all packs
        </Link>

        <div className="pack-page-layout">
          <div className="pack-page-poster">
            <img src={pack.img} alt={pack.title} />
          </div>

          <div className="pack-page-details">
            <div className="pack-modal-badges">
              {showNew && (
                <span className="pack-badge pack-badge-new">
                  <Sparkles size={12} aria-hidden="true" />
                  New
                </span>
              )}
              <span className="pack-badge">{pack.category}</span>
              <span className="pack-badge pack-badge-muted">{pack.creator}</span>
              {sizeLabel && <span className="pack-badge pack-badge-muted">{sizeLabel}</span>}
              {downloadLabel && (
                <span className="pack-badge pack-badge-muted">{downloadLabel} downloads</span>
              )}
            </div>

            <h1>{pack.title}</h1>
            <p className="pack-page-desc">{pack.description}</p>

            <div className="pack-modal-meta pack-page-meta">
              {pack.date && <span>Added {pack.date}</span>}
            </div>

            {hasDownload ? (
              <DownloadButton
                pack={pack}
                className="download-btn pack-page-download"
                onTracked={() => refetch()}
              />
            ) : (
              <p className="pack-page-desc">Download link coming soon.</p>
            )}
          </div>
        </div>

        <PackPreviewGallery images={pack.previewImages} title={pack.title} />

        {related.length > 0 && (
          <section className="related-packs">
            <h2>Related packs</h2>
            <div className="packs-grid">
              {related.map((relatedPack) => (
                <PackCardLink
                  key={relatedPack.slug}
                  pack={relatedPack}
                  downloads={stats[relatedPack.slug]}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
