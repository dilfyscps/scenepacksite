import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ExternalLink, Download, Eye, Layers, Package, Plus, RefreshCw, Search, Trash2, TrendingUp } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import { usePacks } from "../../context/PacksContext";
import { formatDownloads } from "../../utils/packUtils";
import {
  fetchAdminStats,
  resetAllStats,
  resetPackStats,
} from "../../utils/adminApi";
import { usePageTitle } from "../../hooks/usePageTitle";
import { PAGE_META } from "../../config/pages";
import "../../admin.css";

const meta = PAGE_META.admin;

export default function AdminDashboard() {
  usePageTitle(meta.title);
  const navigate = useNavigate();
  const { packs } = usePacks();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionSlug, setActionSlug] = useState(null);
  const [search, setSearch] = useState("");
  const [lastRefresh, setLastRefresh] = useState(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAdminStats();
      setStats(data);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err.message || "Failed to load stats");
      if (err.message === "Unauthorized") {
        navigate("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const rows = useMemo(() => {
    const counts = stats?.counts || {};
    const query = search.trim().toLowerCase();

    return packs
      .map((pack) => ({
        ...pack,
        downloads: counts[pack.slug] || 0,
      }))
      .filter((pack) => {
        if (!query) return true;
        return (
          pack.title.toLowerCase().includes(query) ||
          pack.slug.includes(query) ||
          pack.category.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => b.downloads - a.downloads);
  }, [stats, search, packs]);

  const topPack = useMemo(() => {
    const counts = stats?.counts || {};
    return packs
      .map((pack) => ({ ...pack, downloads: counts[pack.slug] || 0 }))
      .sort((a, b) => b.downloads - a.downloads)[0];
  }, [stats, packs]);

  const handleResetPack = async (slug) => {
    if (!confirm(`Reset download count for "${slug}"?`)) return;
    setActionSlug(slug);
    try {
      await resetPackStats(slug);
      await loadStats();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionSlug(null);
    }
  };

  const handleResetAll = async () => {
    if (!confirm("Reset ALL download counts? This cannot be undone.")) return;
    setActionSlug("__all__");
    try {
      await resetAllStats();
      await loadStats();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionSlug(null);
    }
  };

  return (
    <AdminLayout title="Stats">
      <div className="admin-page-head">
        <div>
          <span className="section-label">Overview</span>
          <h1>Download stats</h1>
          <p>Live download counts from the stats API — reset per pack or wipe all.</p>
        </div>
        <button type="button" className="admin-btn" onClick={loadStats} disabled={loading}>
          <RefreshCw size={16} className={loading ? "admin-spin" : ""} aria-hidden="true" />
          Refresh
        </button>
      </div>

      <div className="admin-quick-actions">
        <Link to="/admin/packs/add" className="admin-btn admin-btn--primary">
          <Plus size={16} aria-hidden="true" />
          Add pack
        </Link>
        <Link to="/admin/packs" className="admin-btn">
          <Package size={16} aria-hidden="true" />
          Manage packs
        </Link>
        <Link to="/admin/requests" className="admin-btn">
          View requests
        </Link>
        <Link to="/admin/settings" className="admin-btn">
          Settings
        </Link>
      </div>

      {lastRefresh && !loading && (
        <p className="admin-meta-line">
          Last updated {lastRefresh.toLocaleTimeString()}
        </p>
      )}

      {error && (
        <div className="admin-error admin-error--banner">
          <p>{error}</p>
          {import.meta.env.DEV &&
          (error.includes("Admin not configured") || error.includes("Can't reach the stats API")) ? (
            <p className="admin-error-hint">
              Local: run <code>npm run dev</code> and set <code>ADMIN_USERNAME</code> and{" "}
              <code>ADMIN_PASSWORD</code> in <code>worker/.dev.vars</code>. Production: deploy the
              worker and run <code>wrangler secret put ADMIN_USERNAME</code> and{" "}
              <code>wrangler secret put ADMIN_PASSWORD</code>.
            </p>
          ) : null}
        </div>
      )}

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <span className="admin-stat-icon admin-stat-icon--violet">
            <Download size={18} aria-hidden="true" />
          </span>
          <span className="admin-stat-label">Total downloads</span>
          <span className="admin-stat-value">
            {loading ? "—" : formatDownloads(stats?.totalDownloads) || "0"}
          </span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-icon admin-stat-icon--pink">
            <TrendingUp size={18} aria-hidden="true" />
          </span>
          <span className="admin-stat-label">Packs with downloads</span>
          <span className="admin-stat-value">{loading ? "—" : stats?.packCount ?? 0}</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-icon admin-stat-icon--blue">
            <Package size={18} aria-hidden="true" />
          </span>
          <span className="admin-stat-label">Catalog size</span>
          <span className="admin-stat-value">{packs.length}</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-icon admin-stat-icon--teal">
            <Eye size={18} aria-hidden="true" />
          </span>
          <span className="admin-stat-label">Page views</span>
          <span className="admin-stat-value">
            {loading ? "—" : stats?.analytics?.totalViews ?? 0}
          </span>
        </div>
        <div className="admin-stat-card admin-stat-card--highlight">
          <span className="admin-stat-icon admin-stat-icon--gold">
            <Layers size={18} aria-hidden="true" />
          </span>
          <span className="admin-stat-label">Top pack</span>
          <span className="admin-stat-value admin-stat-value--sm">
            {loading ? "—" : topPack?.downloads ? topPack.title : "None yet"}
          </span>
          {!loading && topPack?.downloads > 0 && (
            <span className="admin-stat-sub">{formatDownloads(topPack.downloads)} downloads</span>
          )}
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>All packs</h2>
            <p>{rows.length} shown</p>
          </div>
          <button
            type="button"
            className="admin-btn admin-btn--danger"
            onClick={handleResetAll}
            disabled={loading || actionSlug === "__all__" || !stats?.totalDownloads}
          >
            <Trash2 size={16} aria-hidden="true" />
            Reset all
          </button>
        </div>

        <div className="admin-search">
          <Search size={18} className="admin-search-icon" aria-hidden="true" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search packs..."
            className="admin-search-input"
            aria-label="Search packs in admin table"
          />
        </div>

        <div className="admin-table-wrap admin-table-wrap--desktop">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Pack</th>
                <th>Category</th>
                <th>Downloads</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((pack, index) => (
                <tr key={pack.slug}>
                  <td>
                    <span className="admin-rank">{index + 1}</span>
                  </td>
                  <td>
                    <strong>{pack.title}</strong>
                    <span className="admin-table-slug">{pack.slug}</span>
                  </td>
                  <td>
                    <span className="admin-chip">{pack.category}</span>
                  </td>
                  <td>
                    <span className="admin-download-pill">{formatDownloads(pack.downloads) || "0"}</span>
                  </td>
                  <td className="admin-table-actions">
                    <Link to={`/pack/${pack.slug}`} className="admin-btn admin-btn--sm" target="_blank" rel="noopener noreferrer">
                      <ExternalLink size={14} aria-hidden="true" />
                      View
                    </Link>
                    <button
                      type="button"
                      className="admin-btn admin-btn--sm admin-btn--danger"
                      onClick={() => handleResetPack(pack.slug)}
                      disabled={pack.downloads === 0 || actionSlug === pack.slug}
                    >
                      Reset
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="admin-pack-list admin-pack-list--mobile">
          {rows.map((pack, index) => (
            <article key={pack.slug} className="admin-pack-row">
              <div className="admin-pack-row-top">
                <span className="admin-pack-rank">#{index + 1}</span>
                <div>
                  <strong>{pack.title}</strong>
                  <span className="admin-table-slug">{pack.slug}</span>
                </div>
                <span className="admin-pack-count">{formatDownloads(pack.downloads) || "0"}</span>
              </div>
              <div className="admin-pack-row-actions">
                <span className="pack-badge">{pack.category}</span>
                <Link to={`/pack/${pack.slug}`} className="admin-btn admin-btn--sm">
                  View
                </Link>
                <button
                  type="button"
                  className="admin-btn admin-btn--sm admin-btn--danger"
                  onClick={() => handleResetPack(pack.slug)}
                  disabled={pack.downloads === 0 || actionSlug === pack.slug}
                >
                  Reset
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
