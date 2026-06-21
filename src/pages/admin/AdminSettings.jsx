import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Megaphone, Save } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import { fetchAdminAnnouncement, saveAdminAnnouncement } from "../../utils/adminApi";
import { usePageTitle } from "../../hooks/usePageTitle";
import { PAGE_META } from "../../config/pages";
import "../../admin.css";

export default function AdminSettings() {
  usePageTitle(`${PAGE_META.admin.title} · Settings`);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    enabled: false,
    message: "",
    link: "",
    linkLabel: "Learn more",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchAdminAnnouncement()
      .then((data) => setForm({
        enabled: Boolean(data.enabled),
        message: data.message || "",
        link: data.link || "",
        linkLabel: data.linkLabel || "Learn more",
      }))
      .catch((err) => {
        if (err.message === "Unauthorized") {
          navigate("/admin/login");
          return;
        }
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      await saveAdminAnnouncement(form);
      setSaved(true);
    } catch (err) {
      if (err.message === "Unauthorized") {
        navigate("/admin/login");
        return;
      }
      setError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Settings">
      <div className="admin-page-head">
        <div>
          <span className="section-label">Site</span>
          <h1>Announcement bar</h1>
          <p>Show a banner at the top of the site for new drops or news.</p>
        </div>
      </div>

      {error && (
        <div className="admin-error admin-error--banner">
          <p>{error}</p>
        </div>
      )}

      {saved && (
        <div className="admin-success-banner">
          <p>Announcement saved.</p>
        </div>
      )}

      <div className="admin-panel admin-panel--form">
        <div className="admin-panel-header">
          <div>
            <h2>
              <Megaphone size={18} aria-hidden="true" /> Banner settings
            </h2>
            <p>Leave message empty to hide even when enabled is on.</p>
          </div>
        </div>

        <form className="admin-form" onSubmit={handleSubmit}>
          <label className="admin-field admin-field--checkbox admin-field--wide">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(e) => setForm((current) => ({ ...current, enabled: e.target.checked }))}
            />
            <span>Show announcement bar on the site</span>
          </label>

          <label className="admin-field admin-field--wide">
            <span>Message</span>
            <input
              type="text"
              value={form.message}
              onChange={(e) => setForm((current) => ({ ...current, message: e.target.value }))}
              placeholder="New Peacemaker pack is live!"
              maxLength={200}
            />
          </label>

          <label className="admin-field">
            <span>Link (optional)</span>
            <input
              type="text"
              value={form.link}
              onChange={(e) => setForm((current) => ({ ...current, link: e.target.value }))}
              placeholder="/pack/peacemaker or https://..."
            />
          </label>

          <label className="admin-field">
            <span>Link label</span>
            <input
              type="text"
              value={form.linkLabel}
              onChange={(e) => setForm((current) => ({ ...current, linkLabel: e.target.value }))}
              placeholder="View pack"
            />
          </label>

          <div className="admin-form-actions">
            <button type="submit" className="admin-btn admin-btn--primary" disabled={loading || saving}>
              <Save size={16} aria-hidden="true" />
              {saving ? "Saving..." : "Save announcement"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
