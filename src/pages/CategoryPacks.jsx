import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageHero from "../components/PageHero";
import PackBrowser from "../components/PackBrowser";
import { PackGridSkeleton } from "../components/LoadingSkeleton";
import { usePacks } from "../context/PacksContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { getPacksByCategory } from "../utils/packUtils";
import "../App.css";

export default function CategoryPacks({ pageTitle, label, title, highlight, subtitle, category }) {
  const { packs, loading } = usePacks();
  const categoryPacks = getPacksByCategory(packs, category);

  usePageTitle(pageTitle);

  return (
    <div className="app-container">
      <Header />

      <PageHero
        label={label}
        title={title}
        highlight={highlight}
        subtitle={subtitle}
        meta={
          loading
            ? "Loading catalog..."
            : `${categoryPacks.length} ${categoryPacks.length === 1 ? "pack" : "packs"} available`
        }
      />

      {loading ? (
        <PackGridSkeleton />
      ) : categoryPacks.length > 0 ? (
        <PackBrowser packs={categoryPacks} hideCategoryFilter />
      ) : (
        <section className="featured-packs">
          <div className="empty-state">
            <h3>No packs here yet</h3>
            <p>Check back soon — new {category.toLowerCase()} packs are added regularly.</p>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
