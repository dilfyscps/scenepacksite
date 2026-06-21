import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageHero from "../components/PageHero";
import PackBrowser from "../components/PackBrowser";
import { PackGridSkeleton } from "../components/LoadingSkeleton";
import { usePacks } from "../context/PacksContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_META } from "../config/pages";
import "../App.css";

const meta = PAGE_META.packs;

export default function Packs() {
  usePageTitle(meta.title);
  const { packs, loading } = usePacks();

  return (
    <div className="app-container">
      <Header />

      <PageHero
        label={meta.label}
        title={meta.heading}
        highlight={meta.highlight}
        subtitle={meta.subtitle}
        meta={loading ? "Loading catalog..." : `${packs.length} packs available`}
      />

      {loading ? <PackGridSkeleton /> : <PackBrowser packs={packs} />}

      <Footer />
    </div>
  );
}
