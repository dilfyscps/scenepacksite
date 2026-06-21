import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Flame } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import TrendingMarquee from "../components/TrendingMarquee";
import DiscoverSpotlight from "../components/DiscoverSpotlight";
import CategoryTiles from "../components/CategoryTiles";
import HeroMosaic from "../components/HeroMosaic";
import HomeSearch from "../components/HomeSearch";
import { HeroSkeleton } from "../components/LoadingSkeleton";
import { getPackStats } from "../utils/packUtils";
import { usePacks } from "../context/PacksContext";
import { useDownloadStats } from "../hooks/useDownloadStats";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_META } from "../config/pages";
import "../App.css";

export default function Home() {
  usePageTitle(PAGE_META.home.title);
  const { stats } = useDownloadStats();
  const { packs, loading } = usePacks();
  const packStats = getPackStats(packs);

  const trendingPacks = useMemo(() => {
    const ranked = packs
      .map((pack) => ({ ...pack, downloads: stats[pack.slug] || 0 }))
      .sort((a, b) => b.downloads - a.downloads || b.date - a.date);

    return ranked.some((pack) => pack.downloads > 0)
      ? ranked
      : [...packs].sort((a, b) => b.date - a.date);
  }, [packs, stats]);

  return (
    <div className="app-container">
      <div className="site-glow site-glow--1" aria-hidden="true" />
      <div className="site-glow site-glow--2" aria-hidden="true" />

      <Header />

      <section className="hero-section hero-section--home">
        <HeroMosaic packs={trendingPacks.length ? trendingPacks : packs} />

        <div className="hero-content">
          {loading ? (
            <HeroSkeleton />
          ) : (
            <>
              <span className="hero-badge">
                <Flame size={14} aria-hidden="true" />
                Scenepack Collection
              </span>
              <h1>
                Curated packs
                <span className="hero-gradient-text"> for every edit</span>
              </h1>
              <p>
                High-quality movie and TV scenepacks — organized, searchable, and
                ready to drop into your timeline.
              </p>
              <HomeSearch />
              <div className="hero-actions">
                <Link to="/packs" className="hero-cta primary">
                  Browse All Packs
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <Link to="/request" className="hero-cta secondary">
                  Request a pack
                </Link>
              </div>
              <div className="hero-stats">
                <div className="hero-stat">
                  <span className="hero-stat-value">{packStats.total}</span>
                  <span className="hero-stat-label">Packs</span>
                </div>
                <div className="hero-stat-divider" />
                <div className="hero-stat">
                  <span className="hero-stat-value">{packStats.categories}</span>
                  <span className="hero-stat-label">Categories</span>
                </div>
                <div className="hero-stat-divider" />
                <div className="hero-stat">
                  <span className="hero-stat-value">{packStats.creators}</span>
                  <span className="hero-stat-label">Creators</span>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <div className="home-content">
        <CategoryTiles />
      </div>

      {!loading && <TrendingMarquee packs={trendingPacks} />}

      <div className="home-content">
        {!loading && <DiscoverSpotlight />}
      </div>

      <Footer />
    </div>
  );
}
