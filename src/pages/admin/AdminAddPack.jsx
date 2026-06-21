import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import PackForm from "../../components/admin/PackForm";
import { usePacks } from "../../context/PacksContext";
import { createPack, fetchAdminPacks } from "../../utils/adminApi";
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

export default function AdminAddPack() {
  usePageTitle(`${meta.title} · Add pack`);
  const navigate = useNavigate();
  const { refreshPacks } = usePacks();
  const [catalog, setCatalog] = useState([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(getEmptyPackForm);

  useEffect(() => {
    fetchAdminPacks()
      .then((data) => setCatalog(Array.isArray(data) ? data : []))
      .catch((err) => {
        if (err.message === "Unauthorized") {
          navigate("/admin/login");
          return;
        }
        setError(err.message || "Failed to load catalog");
      })
      .finally(() => setLoadingCatalog(false));
  }, [navigate]);

  const duplicateWarning = useMemo(() => {
    if (!form.title.trim()) return null;
    return findDuplicateInCatalog(catalog, {
      title: form.title,
      slug: slugify(form.title),
    });
  }, [catalog, form.title]);

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
      await createPack(payload);
      await refreshPacks();
      navigate("/admin/packs");
    } catch (err) {
      if (err.message === "Unauthorized") {
        navigate("/admin/login");
        return;
      }
      setError(err.message || "Failed to create pack");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Add pack">
      <div className="admin-page-head">
        <div>
          <Link to="/admin/packs" className="admin-back-inline">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to manage packs
          </Link>
          <span className="section-label">New</span>
          <h1>Add a scenepack</h1>
          <p>Look up a title, paste your Mega link, and publish when ready.</p>
        </div>
      </div>

      {error && (
        <div className="admin-error admin-error--banner">
          <p>{error}</p>
        </div>
      )}

      {!loadingCatalog && (
        <PackForm
          form={form}
          saving={saving}
          duplicateWarning={duplicateWarning}
          onFieldChange={handleFieldChange}
          onMediaApply={handleMediaApply}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/admin/packs")}
        />
      )}
    </AdminLayout>
  );
}
