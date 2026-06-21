import React, { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, MessageSquarePlus } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageHero from "../components/PageHero";
import { submitPackRequest } from "../utils/siteApi";
import { PACK_CATEGORIES } from "../utils/packUtils";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_META } from "../config/pages";
import "../App.css";

const meta = PAGE_META.request;

export default function RequestPack() {
  usePageTitle(meta.title);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await submitPackRequest({ title, note, category: category || undefined });
      setSubmitted(true);
      setTitle("");
      setNote("");
      setCategory("");
    } catch (err) {
      setError(err.message || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Header />

      <PageHero
        label={meta.label}
        title={meta.heading}
        highlight={meta.highlight}
        subtitle={meta.subtitle}
      />

      <section className="request-section">
        {submitted ? (
          <div className="request-success">
            <CheckCircle2 size={40} aria-hidden="true" />
            <h2>Request sent</h2>
            <p>Thanks — we&apos;ll review your suggestion and add it if we can.</p>
            <Link to="/packs" className="hero-cta primary">
              Browse packs
            </Link>
          </div>
        ) : (
          <form className="request-form" onSubmit={handleSubmit}>
            <div className="request-form-head">
              <MessageSquarePlus size={20} aria-hidden="true" />
              <div>
                <h2>Suggest a scenepack</h2>
                <p>Tell us what show or movie you want — no account needed.</p>
              </div>
            </div>

            <label className="request-field">
              <span>Title</span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. The Bear, Challengers..."
                required
                minLength={2}
                maxLength={120}
              />
            </label>

            <label className="request-field">
              <span>Category (optional)</span>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Not sure</option>
                {PACK_CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="request-field">
              <span>Note (optional)</span>
              <textarea
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Specific seasons, scenes, or why you want this pack..."
                maxLength={500}
              />
            </label>

            {error && <p className="request-error">{error}</p>}

            <button type="submit" className="hero-cta primary" disabled={loading}>
              {loading ? "Sending..." : "Submit request"}
            </button>
          </form>
        )}
      </section>

      <Footer />
    </div>
  );
}
