import React, { useCallback, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { deleteAdminRequest, fetchAdminRequests, updateAdminRequestStatus } from "../../utils/adminApi";
import { usePageTitle } from "../../hooks/usePageTitle";
import { PAGE_META } from "../../config/pages";
import "../../admin.css";

const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "planned", label: "Planned" },
  { value: "done", label: "Done" },
  { value: "declined", label: "Declined" },
];

export default function AdminRequests() {
  usePageTitle(`${PAGE_META.admin.title} · Requests`);
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAdminRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.message === "Unauthorized") {
        navigate("/admin/login");
        return;
      }
      setError(err.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatusChange = async (request, status) => {
    setUpdatingId(request.id);
    setError("");
    try {
      const updated = await updateAdminRequestStatus(request.id, status);
      setRequests((current) =>
        current.map((entry) => (entry.id === request.id ? updated : entry))
      );
    } catch (err) {
      if (err.message === "Unauthorized") {
        navigate("/admin/login");
        return;
      }
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (request) => {
    if (!confirm(`Remove request for "${request.title}"?`)) return;
    try {
      await deleteAdminRequest(request.id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AdminLayout title="Requests">
      <div className="admin-page-head">
        <div>
          <span className="section-label">Community</span>
          <h1>Pack requests</h1>
          <p>Suggestions submitted from the public request form.</p>
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
            <h2>Open requests</h2>
            <p>{loading ? "Loading..." : `${requests.length} total`}</p>
          </div>
        </div>

        <div className="admin-request-list">
          {requests.length === 0 && !loading ? (
            <p className="admin-empty-note">No requests yet.</p>
          ) : (
            requests.map((request) => (
              <article key={request.id} className="admin-request-row">
                <div>
                  <strong>{request.title}</strong>
                  <span className="admin-table-slug">
                    {request.category || "Any category"} ·{" "}
                    {new Date(request.createdAt).toLocaleString()}
                  </span>
                  {request.note && <p className="admin-request-note">{request.note}</p>}
                </div>
                <div className="admin-request-actions">
                  <label className="admin-request-status">
                    <span>Status</span>
                    <select
                      value={request.status || "open"}
                      disabled={updatingId === request.id}
                      onChange={(e) => handleStatusChange(request, e.target.value)}
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    className="admin-btn admin-btn--sm admin-btn--danger"
                    onClick={() => handleDelete(request)}
                  >
                    <Trash2 size={14} aria-hidden="true" />
                    Remove
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
