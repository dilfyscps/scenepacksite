import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageHero from "../components/PageHero";
import SocialsSection from "../components/SocialsSection";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_META } from "../config/pages";
import "../App.css";

const meta = PAGE_META.socials;

export default function Socials() {
  usePageTitle(meta.title);

  return (
    <div className="app-container">
      <Header />

      <main className="socials-page">
        <PageHero
          label={meta.label}
          title={meta.heading}
          highlight={meta.highlight}
          subtitle={meta.subtitle}
        />

        <SocialsSection showHeader={false} />
      </main>

      <Footer />
    </div>
  );
}
