import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Globe, Link2 } from "lucide-react";
import { getTikTokLabel } from "../utils/profileSocials";
import { resolveProfileImageUrl } from "../utils/profileImages";
import { countProfileLinks, normalizeProfileLinks } from "../utils/profileLinks";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { fetchProfile, getProfileSession, hasProfileSession } from "../utils/profilesApi";
import { usePageTitle } from "../hooks/usePageTitle";
import { SITE_NAME } from "../config/pages";
import "../App.css";

export default function ProfilePage() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const session = getProfileSession();
  const canEdit = session?.username === username;
  const ownsProfile = hasProfileSession();

  usePageTitle(profile ? `${profile.displayName} · ${SITE_NAME}` : "Profile");

  useEffect(() => {
    fetchProfile(username)
      .then((data) => setProfile(normalizeProfileLinks(data)))
      .catch((err) => setError(err.message || "Profile not found"))
      .finally(() => setLoading(false));
  }, [username]);

  const linkCount = countProfileLinks(profile);
  const primaryWebsite = profile?.websites?.[0];

  return (
    <div className="app-container ig-page">
      <Header />

      <main className="ig-profile-view">
        {loading && <p className="ig-loading">Loading profile...</p>}

        {error && !loading && (
          <div className="ig-profile-card ig-profile-card--empty">
            <div className="empty-state">
              <h3>This account doesn&apos;t exist</h3>
              <p>@{username} hasn&apos;t signed up yet.</p>
              {!ownsProfile && (
                <Link to="/profiles/new" className="ig-btn ig-btn--primary">Sign up</Link>
              )}
            </div>
          </div>
        )}

        {profile && (
          <>
            <header className="ig-profile-header">
              <div className="ig-profile-header-avatar">
                {profile.avatar ? (
                  <img src={resolveProfileImageUrl(profile.avatar)} alt="" />
                ) : (
                  <span className="ig-profile-header-avatar-fallback">
                    {profile.displayName?.charAt(0) || "?"}
                  </span>
                )}
              </div>

              <div className="ig-profile-header-info">
                <div className="ig-profile-header-top">
                  <h1 className="ig-profile-handle">{profile.username}</h1>
                  {canEdit ? (
                    <Link to="/profiles/edit" className="ig-btn ig-btn--outline">
                      Edit profile
                    </Link>
                  ) : !ownsProfile ? (
                    <Link to="/profiles/new" className="ig-btn ig-btn--outline">
                      Sign up
                    </Link>
                  ) : null}
                </div>

                <div className="ig-profile-stats">
                  <div className="ig-profile-stat">
                    <strong>{linkCount}</strong>
                    <span>{linkCount === 1 ? "link" : "links"}</span>
                  </div>
                  <div className="ig-profile-stat">
                    <strong>Editor</strong>
                    <span>profile</span>
                  </div>
                </div>

                <p className="ig-profile-name">{profile.displayName}</p>
                {profile.bio && <p className="ig-profile-bio">{profile.bio}</p>}

                {primaryWebsite && (
                  <a
                    href={primaryWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ig-profile-website"
                  >
                    <Link2 size={14} aria-hidden="true" />
                    {primaryWebsite.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                    {profile.websites.length > 1 ? ` +${profile.websites.length - 1} more` : ""}
                  </a>
                )}
              </div>
            </header>

            <div className="ig-profile-tabs" role="tablist" aria-label="Profile sections">
              <span className="ig-profile-tab ig-profile-tab--active" role="tab" aria-selected="true">
                <Link2 size={12} aria-hidden="true" />
                Links
              </span>
            </div>

            <section className="ig-profile-links-grid" aria-label="Social links">
              {profile.tiktoks?.map((tiktok) => (
                <a
                  key={tiktok}
                  href={tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ig-profile-link-tile ig-profile-link-tile--tiktok"
                >
                  <span className="ig-profile-link-label">TikTok</span>
                  <span className="ig-profile-link-value">{getTikTokLabel(tiktok)}</span>
                </a>
              ))}

              {profile.websites?.map((website) => (
                <a
                  key={website}
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ig-profile-link-tile"
                >
                  <span className="ig-profile-link-label">
                    <Globe size={14} aria-hidden="true" />
                    Website
                  </span>
                  <span className="ig-profile-link-value">
                    {website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  </span>
                </a>
              ))}

              {profile.discords?.map((discord) => (
                <div key={discord} className="ig-profile-link-tile ig-profile-link-tile--static">
                  <span className="ig-profile-link-label">Discord</span>
                  <span className="ig-profile-link-value">{discord}</span>
                </div>
              ))}

              {linkCount === 0 && (
                <div className="ig-profile-empty-links">
                  <p>No links added yet.</p>
                  {canEdit && (
                    <Link to="/profiles/edit" className="ig-text-btn">
                      Add your accounts
                    </Link>
                  )}
                </div>
              )}
            </section>

            <p className="ig-profile-view-foot">
              <Link to="/profiles">← Back to all profiles</Link>
            </p>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
