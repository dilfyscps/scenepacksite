import React from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { usePageTitle } from "../hooks/usePageTitle";

export default function NotFound() {
  usePageTitle("Page not found");

  return (
    <div className="app-container">
      <Header />
      <main className="featured-packs">
        <div className="empty-state">
          <h3>Page not found</h3>
          <p>That link doesn&apos;t go anywhere. Head back to the catalog or home.</p>
          <Link to="/packs" className="hero-cta primary">
            Browse packs
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
