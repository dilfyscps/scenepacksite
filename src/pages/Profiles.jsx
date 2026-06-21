import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Link2, Sparkles, UserCircle, Users } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageHero from "../components/PageHero";
import { fetchProfiles, getProfileSession, hasProfileSession } from "../utils/profilesApi";
import { normalizeProfileLinks } from "../utils/profileLinks";
import { resolveProfileImageUrl } from "../utils/profileImages";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_META } from "../config/pages";
import "../App.css";

const meta = PAGE_META.profiles;

const features = [
  {
    icon: UserCircle,
    title: "One profile, all your links",
    text: "Drop in every TikTok, Discord, and website you use — no need for multiple pages.",
  },
  {
    icon: Link2,
    title: "Easy for fans to find you",
    text: "Your bio and socials live in one clean spot people can bookmark or share.",
  },
  {
    icon: Sparkles,
    title: "Takes two minutes",
    text: "Upload a photo, write a short bio, and you're on the community wall.",
  },
];

export default function Profiles() {
  usePageTitle(meta.title);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const session = getProfileSession();
  const ownsProfile = hasProfileSession();

  useEffect(() => {
    fetchProfiles()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setProfiles(list.map(normalizeProfileLinks));
      })
      .catch((err) => setError(err.message || "Failed to load profiles"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="app-container profiles-page">
      <div className="site-glow site-glow--1" aria-hidden="true" />
      <div className="site-glow site-glow--2" aria-hidden="true" />

      <Header />

      <PageHero
        label={meta.label}
        title={meta.heading}
        highlight={meta.highlight}
        subtitle={meta.subtitle}
        meta={loading ? "Loading community..." : `${profiles.length} editor${profiles.length === 1 ? "" : "s"} and counting`}
      >
        <div className="profiles-hero-actions">
          {ownsProfile ? (
            <>
              <Link to={`/profiles/${session.username}`} className="hero-cta primary">
                View your profile
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link to="/profiles/edit" className="hero-cta secondary">
                Edit profile
              </Link>
            </>
          ) : (
            <>
              <Link to="/profiles/new" className="hero-cta primary">
                Create your profile
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link to="/socials" className="hero-cta secondary">
                Community socials
              </Link>
            </>
          )}
        </div>
      </PageHero>

      <main className="profiles-main">
        {ownsProfile && session && (
          <aside className="profiles-welcome-back">
            <div className="profiles-welcome-back-text">
              <span className="profiles-welcome-back-label">Welcome back</span>
              <strong>@{session.username}</strong>
              <p>Your page is live — add new links anytime from edit profile.</p>
            </div>
            <Link to="/profiles/edit" className="ig-btn ig-btn--outline">
              Update profile
            </Link>
          </aside>
        )}

        {!ownsProfile && (
          <section className="profiles-features" aria-label="How editor profiles work">
            {features.map(({ icon: Icon, title, text }) => (
              <article key={title} className="profiles-feature-card">
                <span className="profiles-feature-icon" aria-hidden="true">
                  <Icon size={20} />
                </span>
                <h2>{title}</h2>
                <p>{text}</p>
              </article>
            ))}
          </section>
        )}

        {error && <p className="ig-form-error profiles-error-banner">{error}</p>}

        <section className="profiles-directory" aria-labelledby="profiles-directory-title">
          <div className="profiles-directory-head">
            <div>
              <h2 id="profiles-directory-title">
                <Users size={20} aria-hidden="true" />
                {profiles.length ? "Community wall" : "Be the first"}
              </h2>
              <p>
                {loading
                  ? "Gathering editors..."
                  : profiles.length
                    ? "Tap a profile to see their links and bio."
                    : "Nobody's on the wall yet — you could start the community."}
              </p>
            </div>
          </div>

          {loading && (
            <div className="profiles-grid profiles-grid--loading" aria-hidden="true">
              {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="profiles-card profiles-card--skeleton">
                  <span className="profiles-card-avatar-skeleton" />
                  <span className="profiles-card-line profiles-card-line--short" />
                  <span className="profiles-card-line" />
                </div>
              ))}
            </div>
          )}

          {!loading && profiles.length === 0 && (
            <div className="profiles-empty">
              <span className="profiles-empty-icon" aria-hidden="true">
                <Users size={36} />
              </span>
              <h3>It's quiet in here — for now</h3>
              <p>
                Editor profiles are a place to put a face and links behind your edits.
                Sign up once and share every account you use.
              </p>
              {!ownsProfile && (
                <Link to="/profiles/new" className="hero-cta primary">
                  Be the first editor
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              )}
            </div>
          )}

          {!loading && profiles.length > 0 && (
            <div className="profiles-grid">
              {profiles.map((profile) => (
                <Link
                  key={profile.username}
                  to={`/profiles/${profile.username}`}
                  className="profiles-card"
                >
                  <div className="profiles-card-avatar-ring">
                    {profile.avatar ? (
                      <img src={resolveProfileImageUrl(profile.avatar)} alt="" />
                    ) : (
                      <span>{profile.displayName?.charAt(0) || "?"}</span>
                    )}
                  </div>
                  <strong className="profiles-card-handle">@{profile.username}</strong>
                  <span className="profiles-card-name">{profile.displayName}</span>
                  {profile.bio ? (
                    <p className="profiles-card-bio">{profile.bio}</p>
                  ) : (
                    <p className="profiles-card-bio profiles-card-bio--muted">No bio yet</p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>

        {!ownsProfile && !loading && profiles.length > 0 && (
          <section className="profiles-cta-band">
            <div>
              <h2>Want your own spot on the wall?</h2>
              <p>One free profile per person — link every TikTok, Discord, and site you use.</p>
            </div>
            <Link to="/profiles/new" className="hero-cta primary">
              Create your profile
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
