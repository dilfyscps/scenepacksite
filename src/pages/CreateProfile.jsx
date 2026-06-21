import React, { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProfileAvatarField from "../components/ProfileAvatarField";
import {
  createProfile,
  getProfileSession,
  hasProfileSession,
  saveProfileSession,
  uploadProfileAvatar,
} from "../utils/profilesApi";
import { parseLinkLines } from "../utils/profileLinks";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_META } from "../config/pages";
import "../App.css";

const BIO_MAX = 280;

const emptyForm = {
  username: "",
  displayName: "",
  bio: "",
  avatar: "",
  websites: "",
  discords: "",
  tiktoks: "",
};

export default function CreateProfile() {
  usePageTitle(PAGE_META.profileCreate.title);
  const navigate = useNavigate();
  const existingSession = getProfileSession();
  const [form, setForm] = useState(emptyForm);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return () => {
      if (avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  if (existingSession) {
    return <Navigate to="/profiles/edit" replace />;
  }

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleFileSelect = (file) => {
    setAvatarError("");
    setAvatarFile(file);
    setForm((current) => ({ ...current, avatar: "" }));
    setAvatarPreview((current) => {
      if (current.startsWith("blob:")) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
  };

  const handleAvatarClear = () => {
    setAvatarFile(null);
    setForm((current) => ({ ...current, avatar: "" }));
    setAvatarPreview((current) => {
      if (current.startsWith("blob:")) URL.revokeObjectURL(current);
      return "";
    });
  };

  const handleAvatarUrl = (url) => {
    setAvatarFile(null);
    setAvatarPreview((current) => {
      if (current.startsWith("blob:")) URL.revokeObjectURL(current);
      return url;
    });
    handleChange("avatar", url);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setAvatarError("");

    try {
      const result = await createProfile({
        username: form.username.trim().toLowerCase(),
        displayName: form.displayName,
        bio: form.bio,
        avatar: avatarFile ? "" : form.avatar,
        tiktoks: parseLinkLines(form.tiktoks),
        websites: parseLinkLines(form.websites),
        discords: parseLinkLines(form.discords),
      });
      saveProfileSession(result.profile.username, result.editToken);

      if (avatarFile) {
        try {
          await uploadProfileAvatar(result.profile.username, avatarFile, result.editToken);
        } catch (err) {
          setAvatarError(err.message || "Profile created, but photo upload failed");
          navigate(`/profiles/${result.profile.username}`);
          return;
        }
      }

      navigate(`/profiles/${result.profile.username}`);
    } catch (err) {
      if (err.existingUsername) {
        setError(`${err.message} Use Edit profile to add more accounts.`);
      } else {
        setError(err.message || "Failed to create profile");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-container ig-page">
      <Header />

      <main className="ig-profile-shell">
        <div className="ig-profile-card">
          <div className="ig-profile-card-brand">
            <span className="ig-profile-card-logo">DILFYSCPS</span>
            <h1>Sign up to show your edits.</h1>
            <p>One profile per person. Add all your TikTok, Discord, and website links here.</p>
          </div>

          <form className="ig-profile-form" onSubmit={handleSubmit}>
            <ProfileAvatarField
              previewUrl={avatarPreview || form.avatar}
              username={form.username}
              onFileSelect={handleFileSelect}
              onClear={handleAvatarClear}
              onUrlChange={handleAvatarUrl}
              error={avatarError}
            />

            <div className="ig-form-divider" aria-hidden="true" />

            <label className="ig-field">
              <span className="ig-field-label">Username</span>
              <input
                className="ig-input"
                value={form.username}
                onChange={(e) => handleChange("username", e.target.value)}
                placeholder="your_name"
                pattern="[a-z0-9_]{3,20}"
                autoComplete="username"
                required
              />
            </label>

            <label className="ig-field">
              <span className="ig-field-label">Name</span>
              <input
                className="ig-input"
                value={form.displayName}
                onChange={(e) => handleChange("displayName", e.target.value)}
                placeholder="Display name"
                autoComplete="name"
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
                  placeholder="Write a little about your editing style..."
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

            <button type="submit" className="ig-btn ig-btn--primary ig-btn--block" disabled={saving}>
              {saving ? "Creating..." : "Sign up"}
            </button>
          </form>

          <p className="ig-profile-card-foot">
            {hasProfileSession() ? (
              <Link to="/profiles/edit">Edit your profile</Link>
            ) : (
              <>
                Already signed up on this device?{" "}
                <Link to="/profiles/edit">Edit profile</Link>
              </>
            )}
            {" · "}
            <Link to="/profiles">Browse editors</Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
