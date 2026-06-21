import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProfileAvatarField from "../components/ProfileAvatarField";
import {
  fetchProfile,
  getProfileSession,
  removeProfileSession,
  updateProfile,
  uploadProfileAvatar,
} from "../utils/profilesApi";
import { linksToTextarea, normalizeProfileLinks, parseLinkLines } from "../utils/profileLinks";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_META } from "../config/pages";
import "../App.css";

const BIO_MAX = 280;

export default function EditProfile() {
  usePageTitle(PAGE_META.profileEdit.title);
  const session = getProfileSession();
  const username = session?.username || "";
  const [form, setForm] = useState({
    displayName: "",
    bio: "",
    avatar: "",
    websites: "",
    discords: "",
    tiktoks: "",
  });
  const [loading, setLoading] = useState(Boolean(username));
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    setError("");
    fetchProfile(username)
      .then((profile) => {
        const normalized = normalizeProfileLinks(profile);
        setForm({
          displayName: normalized.displayName || "",
          bio: normalized.bio || "",
          avatar: normalized.avatar || "",
          websites: linksToTextarea(normalized.websites),
          discords: linksToTextarea(normalized.discords),
          tiktoks: linksToTextarea(normalized.tiktoks),
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [username]);

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleFileSelect = async (file) => {
    if (!username || !session?.editToken) return;

    setAvatarUploading(true);
    setAvatarError("");
    setSuccess("");

    try {
      const updated = await uploadProfileAvatar(username, file, session.editToken);
      setForm((current) => ({ ...current, avatar: updated.avatar || "" }));
      setSuccess("Photo updated.");
    } catch (err) {
      if (err.message === "Invalid edit token") {
        removeProfileSession();
        setError("Edit access expired on this device.");
      } else {
        setAvatarError(err.message || "Failed to upload photo");
      }
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleAvatarClear = async () => {
    if (!username || !session?.editToken) return;

    setAvatarUploading(true);
    setAvatarError("");
    setSuccess("");

    try {
      await updateProfile(username, { avatar: "" }, session.editToken);
      setForm((current) => ({ ...current, avatar: "" }));
      setSuccess("Photo removed.");
    } catch (err) {
      setAvatarError(err.message || "Failed to remove photo");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleAvatarUrl = async (url) => {
    if (!username || !session?.editToken) return;

    setAvatarUploading(true);
    setAvatarError("");
    setSuccess("");

    try {
      const updated = await updateProfile(username, { avatar: url }, session.editToken);
      setForm((current) => ({ ...current, avatar: updated.avatar || url }));
      setSuccess("Photo updated.");
    } catch (err) {
      setAvatarError(err.message || "Failed to update photo URL");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!username || !session?.editToken) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await updateProfile(
        username,
        {
          displayName: form.displayName,
          bio: form.bio,
          avatar: form.avatar,
          tiktoks: parseLinkLines(form.tiktoks),
          websites: parseLinkLines(form.websites),
          discords: parseLinkLines(form.discords),
        },
        session.editToken,
      );
      setSuccess("Profile updated.");
    } catch (err) {
      if (err.message === "Invalid edit token") {
        removeProfileSession();
        setError("Edit access expired on this device.");
      } else {
        setError(err.message || "Failed to update profile");
      }
    } finally {
      setSaving(false);
    }
  };

  if (!session) {
    return (
      <div className="app-container ig-page">
        <Header />
        <main className="ig-profile-shell">
          <div className="ig-profile-card ig-profile-card--empty">
            <div className="empty-state">
              <h3>No profile on this device</h3>
              <p>Sign up once — then add all your social accounts to that single profile.</p>
              <Link to="/profiles/new" className="ig-btn ig-btn--primary">Sign up</Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="app-container ig-page">
      <Header />

      <main className="ig-profile-shell ig-profile-shell--wide">
        <div className="ig-profile-card">
          <div className="ig-profile-card-brand ig-profile-card-brand--row">
            <div>
              <span className="ig-profile-card-logo">Edit profile</span>
              <h1>@{username}</h1>
              <p>Add every TikTok, Discord, or website you use — all on this one profile.</p>
            </div>
            <Link to={`/profiles/${username}`} className="ig-btn ig-btn--outline">
              View profile
            </Link>
          </div>

          {loading && <p className="ig-loading">Loading profile...</p>}

          {!loading && (
            <form className="ig-profile-form" onSubmit={handleSubmit}>
              <ProfileAvatarField
                previewUrl={form.avatar}
                username={username}
                onFileSelect={handleFileSelect}
                onClear={handleAvatarClear}
                onUrlChange={handleAvatarUrl}
                uploading={avatarUploading}
                error={avatarError}
              />

              <div className="ig-form-divider" aria-hidden="true" />

              <label className="ig-field">
                <span className="ig-field-label">Name</span>
                <input
                  className="ig-input"
                  value={form.displayName}
                  onChange={(e) => handleChange("displayName", e.target.value)}
                  required
                />
              </label>

              <label className="ig-field ig-field--top">
                <span className="ig-field-label">Bio</span>
                <div className="ig-field-stack">
                  <textarea
                    className="ig-input ig-textarea"
                    rows={3}
                    maxLength={BIO_MAX}
                    value={form.bio}
                    onChange={(e) => handleChange("bio", e.target.value)}
                    placeholder="Tell people about your editing style..."
                  />
                  <span className="ig-char-count">{form.bio.length}/{BIO_MAX}</span>
                </div>
              </label>

              <label className="ig-field ig-field--top">
                <span className="ig-field-label">Websites</span>
                <div className="ig-field-stack">
                  <textarea
                    className="ig-input ig-textarea"
                    rows={3}
                    value={form.websites}
                    onChange={(e) => handleChange("websites", e.target.value)}
                    placeholder={"https://your-site.com\nhttps://linktr.ee/you"}
                  />
                  <span className="ig-field-note">One URL per line · up to 5</span>
                </div>
              </label>

              <label className="ig-field ig-field--top">
                <span className="ig-field-label">TikTok</span>
                <div className="ig-field-stack">
                  <textarea
                    className="ig-input ig-textarea"
                    rows={3}
                    value={form.tiktoks}
                    onChange={(e) => handleChange("tiktoks", e.target.value)}
                    placeholder={"@mainaccount\n@secondaccount"}
                  />
                  <span className="ig-field-note">One handle per line · up to 5</span>
                </div>
              </label>

              <label className="ig-field ig-field--top">
                <span className="ig-field-label">Discord</span>
                <div className="ig-field-stack">
                  <textarea
                    className="ig-input ig-textarea"
                    rows={3}
                    value={form.discords}
                    onChange={(e) => handleChange("discords", e.target.value)}
                    placeholder={"username\nalt_username"}
                  />
                  <span className="ig-field-note">One username per line · up to 5</span>
                </div>
              </label>

              {error && <p className="ig-form-error">{error}</p>}
              {success && <p className="ig-form-success">{success}</p>}

              <button
                type="submit"
                className="ig-btn ig-btn--primary ig-btn--block"
                disabled={saving || avatarUploading}
              >
                {saving ? "Submitting..." : "Submit"}
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
