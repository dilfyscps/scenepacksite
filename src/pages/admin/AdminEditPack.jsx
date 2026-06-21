import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import PackForm from "../../components/admin/PackForm";
import { packToForm } from "../../components/admin/packFormUtils";
import { usePacks } from "../../context/PacksContext";
import { fetchAdminPacks, updatePack } from "../../utils/adminApi";
import {
  findDuplicateInCatalog,
  getEmptyPackForm,
  parsePreviewImagesInput,
  slugify,
} from "../../utils/packUtils";
import { usePageTitle } from "../../hooks/usePageTitle";
import { PAGE_META } from "../../config/pages";
import "../../admin.css";

const meta = PAGE_META.admin;

export default function AdminEditPack() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { refreshPacks } = usePacks();
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(getEmptyPackForm);

  const pack = useMemo(
    () => catalog.find((entry) => entry.slug === slug),
    [catalog, slug]
  );

  usePageTitle(`${meta.title} · ${pack?.title || "Edit pack"}`);

  useEffect(() => {
    fetchAdminPacks()
      .then((data) => setCatalog(Array.isArray(data) ? data : []))
      .catch((err) => {
        if (err.message === "Unauthorized") {
          navigate("/admin/login");
          return;
        }
        setError(err.message || "Failed to load pack");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  useEffect(() => {
    if (!loading && catalog.length && !pack) {
      navigate("/admin/packs", { replace: true });
    }
  }, [loading, catalog.length, pack, navigate]);

  useEffect(() => {
    if (pack) {
      setForm(packToForm(pack));
    }
  }, [pack]);

  const duplicateWarning = useMemo(() => {
    if (!form.title.trim()) return null;
    return findDuplicateInCatalog(catalog, {
      title: form.title,
      slug: slugify(form.title),
      excludeSlug: slug,
    });
  }, [catalog, form.title, slug]);

  const handleFieldChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleMediaApply = (fields) => {
    setForm((current) => ({ ...current, ...fields }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      date: Number(form.date),
      clipCount: form.clipCount === "" ? null : Number(form.clipCount),
      previewImages: parsePreviewImagesInput(form.previewImages),
    };

    try {
      await updatePack(slug, payload);
      await refreshPacks();
      navigate("/admin/packs");
    } catch (err) {
      if (err.message === "Unauthorized") {
        navigate("/admin/login");
        return;
      }
      setError(err.message || "Failed to save pack");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !pack) {
    return (
      <AdminLayout title="Edit pack">
        <p className="admin-meta-line">Loading pack...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit pack">
      <div className="admin-page-head">
        <div>
          <Link to="/admin/packs" className="admin-back-inline">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to manage packs
          </Link>
          <span className="section-label">Edit</span>
          <h1>{pack.title}</h1>
          <p>Update details, draft status, or download link for this pack.</p>
        </div>
      </div>

      {error && (
        <div className="admin-error admin-error--banner">
          <p>{error}</p>
        </div>
      )}

      <PackForm
        form={form}
        editingSlug={slug}
        saving={saving}
        duplicateWarning={duplicateWarning}
        onFieldChange={handleFieldChange}
        onMediaApply={handleMediaApply}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/admin/packs")}
      />
    </AdminLayout>
  );
}
