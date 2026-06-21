import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ExternalLink, Pencil, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { usePacks } from "../../context/PacksContext";
import { deletePack, fetchAdminPacks, updatePack } from "../../utils/adminApi";
import { CATEGORY_OPTIONS } from "../../utils/packUtils";
import { usePageTitle } from "../../hooks/usePageTitle";
import { PAGE_META } from "../../config/pages";
import "../../admin.css";

const meta = PAGE_META.admin;

export default function AdminPacks() {
  usePageTitle(`${meta.title} · Manage packs`);
  const navigate = useNavigate();
  const { refreshPacks } = usePacks();
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [actionSlug, setActionSlug] = useState(null);
  const [selected, setSelected] = useState(() => new Set());
  const [bulkWorking, setBulkWorking] = useState(false);

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAdminPacks();
      setCatalog(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load packs");
      if (err.message === "Unauthorized") {
        navigate("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return catalog
      .filter((pack) => {
        if (!query) return true;
        return (
          pack.title.toLowerCase().includes(query) ||
          pack.slug.includes(query) ||
          pack.category.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [catalog, search]);

  const allVisibleSelected = rows.length > 0 && rows.every((pack) => selected.has(pack.slug));

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(rows.map((pack) => pack.slug)));
    }
  };

  const toggleSelect = (slug) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const runBulk = async (action) => {
    const slugs = [...selected];
    if (!slugs.length) return;

    const label =
      action === "delete"
        ? `Delete ${slugs.length} pack(s)?`
        : `${action === "publish" ? "Publish" : "Unpublish"} ${slugs.length} pack(s)?`;
    if (!confirm(label)) return;

    setBulkWorking(true);
    setError("");
    try {
      const targets = catalog.filter((pack) => slugs.includes(pack.slug));
      if (action === "delete") {
        await Promise.all(targets.map((pack) => deletePack(pack.slug)));
      } else {
        const published = action === "publish";
        await Promise.all(
          targets.map((pack) => updatePack(pack.slug, { ...pack, published }))
        );
      }
      setSelected(new Set());
      await loadCatalog();
      await refreshPacks();
    } catch (err) {
      setError(err.message || "Bulk action failed");
    } finally {
      setBulkWorking(false);
    }
  };

  const handleDelete = async (pack) => {
    if (!confirm(`Delete "${pack.title}"? This removes the pack from the site.`)) return;

    setActionSlug(pack.slug);
    setError("");
    try {
      await deletePack(pack.slug);
      await loadCatalog();
      await refreshPacks();
    } catch (err) {
      setError(err.message || "Failed to delete pack");
    } finally {
      setActionSlug(null);
    }
  };

  return (
    <AdminLayout title="Manage packs">
      <div className="admin-page-head">
        <div>
          <span className="section-label">Catalog</span>
          <h1>Manage scenepacks</h1>
          <p>Search, edit, or remove packs from the live catalog.</p>
        </div>
        <div className="admin-page-head-actions">
          <button type="button" className="admin-btn" onClick={loadCatalog} disabled={loading}>
            <RefreshCw size={16} className={loading ? "admin-spin" : ""} aria-hidden="true" />
            Refresh
          </button>
          <Link to="/admin/packs/add" className="admin-btn admin-btn--primary">
            <Plus size={16} aria-hidden="true" />
            Add pack
          </Link>
        </div>
      </div>

      {error && (
        <div className="admin-error admin-error--banner">
          <p>{error}</p>
        </div>
      )}

      <div className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>All packs</h2>
            <p>
              {loading ? "Loading..." : `${rows.length} in catalog`} · categories:{" "}
              {CATEGORY_OPTIONS.filter((c) => c !== "All").join(", ")}
            </p>
          </div>
        </div>

        {selected.size > 0 && (
          <div className="admin-bulk-bar">
            <span>{selected.size} selected</span>
            <button type="button" className="admin-btn admin-btn--sm" disabled={bulkWorking} onClick={() => runBulk("publish")}>
              Publish
            </button>
            <button type="button" className="admin-btn admin-btn--sm" disabled={bulkWorking} onClick={() => runBulk("unpublish")}>
              Unpublish
            </button>
            <button type="button" className="admin-btn admin-btn--sm admin-btn--danger" disabled={bulkWorking} onClick={() => runBulk("delete")}>
              Delete
            </button>
            <button type="button" className="admin-btn admin-btn--sm" onClick={() => setSelected(new Set())}>
              Clear
            </button>
          </div>
        )}

        <div className="admin-search">
          <Search size={18} className="admin-search-icon" aria-hidden="true" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search packs..."
            className="admin-search-input"
            aria-label="Search packs in admin catalog"
          />
        </div>

        {!loading && rows.length === 0 ? (
          <p className="admin-empty-note">
            No packs yet.{" "}
            <Link to="/admin/packs/add">Add your first pack</Link>.
          </p>
        ) : (
          <>
            <div className="admin-table-wrap admin-table-wrap--desktop">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th className="admin-table-check">
                      <input
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={toggleSelectAll}
                        aria-label="Select all visible packs"
                      />
                    </th>
                    <th>Pack</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((pack) => (
                    <tr key={pack.slug}>
                      <td className="admin-table-check">
                        <input
                          type="checkbox"
                          checked={selected.has(pack.slug)}
                          onChange={() => toggleSelect(pack.slug)}
                          aria-label={`Select ${pack.title}`}
                        />
                      </td>
                      <td>
                        <div className="admin-pack-cell">
                          <img src={pack.img} alt="" className="admin-pack-thumb" />
                          <div>
                            <strong>{pack.title}</strong>
                            <span className="admin-table-slug">{pack.slug}</span>
                          </div>
                        </div>
                      </td>
                      <td>{pack.category}</td>
                      <td>
                        <span className={`admin-chip${pack.published === false ? " admin-chip--draft" : ""}`}>
                          {pack.published === false ? "Draft" : "Live"}
                        </span>
                      </td>
                      <td className="admin-table-actions">
                        {pack.published !== false && (
                          <Link
                            to={`/pack/${pack.slug}`}
                            className="admin-btn admin-btn--sm"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink size={14} aria-hidden="true" />
                            View
                          </Link>
                        )}
                        <Link
                          to={`/admin/packs/${pack.slug}/edit`}
                          className="admin-btn admin-btn--sm"
                        >
                          <Pencil size={14} aria-hidden="true" />
                          Edit
                        </Link>
                        <button
                          type="button"
                          className="admin-btn admin-btn--sm admin-btn--danger"
                          onClick={() => handleDelete(pack)}
                          disabled={actionSlug === pack.slug}
                        >
                          <Trash2 size={14} aria-hidden="true" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="admin-pack-list admin-pack-list--mobile">
              {rows.map((pack) => (
                <article key={pack.slug} className="admin-pack-row">
                  <div className="admin-pack-row-top">
                    <img src={pack.img} alt="" className="admin-pack-thumb" />
                    <div>
                      <strong>{pack.title}</strong>
                      <span className="admin-table-slug">{pack.slug}</span>
                    </div>
                  </div>
                  <div className="admin-pack-row-actions">
                    <span className="pack-badge">{pack.category}</span>
                    {pack.published !== false && (
                      <Link to={`/pack/${pack.slug}`} className="admin-btn admin-btn--sm">
                        View
                      </Link>
                    )}
                    <Link to={`/admin/packs/${pack.slug}/edit`} className="admin-btn admin-btn--sm">
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="admin-btn admin-btn--sm admin-btn--danger"
                      onClick={() => handleDelete(pack)}
                      disabled={actionSlug === pack.slug}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
