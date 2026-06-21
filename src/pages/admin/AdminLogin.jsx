import React, { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Package, Sparkles, TrendingUp } from "lucide-react";
import { adminLogin, getRememberLogin, getSavedAdminUsername } from "../../utils/adminApi";
import { isStatsApiOnline } from "../../utils/downloadStats";
import { useAdminAccess } from "../../hooks/useAdminAccess";
import { usePageTitle } from "../../hooks/usePageTitle";
import { PAGE_META } from "../../config/pages";
import "../../admin.css";

const meta = PAGE_META.adminLogin;

export default function AdminLogin() {
  usePageTitle(meta.title);
  const navigate = useNavigate();
  const { loggedIn } = useAdminAccess();
  const [username, setUsername] = useState(() => getSavedAdminUsername());
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(() => getRememberLogin());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiOnline, setApiOnline] = useState(null);

  useEffect(() => {
    isStatsApiOnline().then(setApiOnline);
  }, []);

  if (loggedIn) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await adminLogin(username, password, { remember });
      navigate("/admin");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-glow admin-page-glow--1" aria-hidden="true" />
      <div className="admin-page-glow admin-page-glow--2" aria-hidden="true" />

      <div className="admin-login-shell">
        <section className="admin-login-showcase">
          <Link to="/" className="admin-back-link">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to site
          </Link>

          <div className="admin-login-showcase-content">
            <span className="admin-login-label">
              <Sparkles size={12} aria-hidden="true" />
              {meta.label}
            </span>
            <h1>
              Manage your
              <span className="admin-login-highlight"> scenepack catalog</span>
            </h1>
            <p>Track downloads, add packs with movie/TV lookup, and keep the site updated from one place.</p>

            <ul className="admin-login-features">
              <li>
                <TrendingUp size={16} aria-hidden="true" />
                Live download stats
              </li>
              <li>
                <Package size={16} aria-hidden="true" />
                TMDB-powered pack import
              </li>
              <li>
                <Lock size={16} aria-hidden="true" />
                Secure admin access
              </li>
            </ul>
          </div>
        </section>

        <div className="admin-login-card">
          <div className="admin-login-header">
            <span className="admin-login-icon">
              <Lock size={22} aria-hidden="true" />
            </span>
            <h2>Sign in</h2>
            <p>{meta.subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="admin-login-form">
            <label className="admin-field" htmlFor="admin-username">
              <span>Username</span>
              <input
                id="admin-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                autoComplete="username"
                required
              />
            </label>

            <label className="admin-field" htmlFor="admin-password">
              <span>Password</span>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                autoComplete="current-password"
                required
              />
            </label>

            <label className="admin-field admin-field--checkbox admin-field--wide">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Keep me signed in on this device</span>
            </label>

            {error && <p className="admin-error">{error}</p>}

            {import.meta.env.DEV && apiOnline === false && (
              <p className="admin-login-footnote admin-login-footnote--warn">
                Stats API looks offline. Run <code>npm run dev</code> from the project folder (starts
                both the site and API). If it was already running, restart it after changing{" "}
                <code>worker/.dev.vars</code>.
              </p>
            )}

            <button type="submit" className="admin-btn admin-btn--primary admin-btn--lg admin-submit" disabled={loading}>
              {loading ? "Signing in…" : "Sign in to admin"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
