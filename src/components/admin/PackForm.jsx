import React from "react";
import MediaLookup from "./MediaLookup";
import { PACK_CATEGORIES, PACK_CREATORS } from "../../utils/packUtils";

export default function PackForm({
  form,
  editingSlug,
  saving,
  duplicateWarning,
  onFieldChange,
  onMediaApply,
  onSubmit,
  onCancel,
}) {
  return (
    <div className="admin-panel admin-panel--form">
      <div className="admin-panel-header">
        <div>
          <h2>{editingSlug ? "Edit pack" : "New pack"}</h2>
          <p>
            {editingSlug
              ? `Editing slug "${editingSlug}" — changing the title updates the URL.`
              : "Search a title to auto-fill details, then paste your Mega download link."}
          </p>
        </div>
        {onCancel && (
          <button type="button" className="admin-btn admin-btn--sm" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>

      <form className="admin-form" onSubmit={onSubmit}>
        <MediaLookup onApply={onMediaApply} />

        {duplicateWarning && (
          <p className="admin-duplicate-warning">
            Possible duplicate: <strong>{duplicateWarning.title}</strong> already exists in the catalog.
          </p>
        )}

        <div className="admin-form-grid">
          <label className="admin-field admin-field--wide">
            <span>Title</span>
            <input
              type="text"
              value={form.title}
              onChange={(e) => onFieldChange("title", e.target.value)}
              required
              placeholder="PEACEMAKER"
            />
          </label>

          <label className="admin-field admin-field--wide">
            <span>Poster image</span>
            <input
              type="text"
              value={form.img}
              onChange={(e) => onFieldChange("img", e.target.value)}
              required
              placeholder="Filled by lookup, or paste /dilfjpgs/... or a URL"
            />
          </label>

          <label className="admin-field">
            <span>Category</span>
            <select value={form.category} onChange={(e) => onFieldChange("category", e.target.value)}>
              {PACK_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="admin-field">
            <span>Creator</span>
            <select value={form.creator} onChange={(e) => onFieldChange("creator", e.target.value)}>
              {PACK_CREATORS.map((creator) => (
                <option key={creator} value={creator}>
                  {creator}
                </option>
              ))}
            </select>
          </label>

          <label className="admin-field">
            <span>Year added</span>
            <input
              type="number"
              min="1900"
              max="2100"
              value={form.date}
              onChange={(e) => onFieldChange("date", e.target.value)}
              required
            />
          </label>

          <label className="admin-field admin-field--checkbox admin-field--wide">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => onFieldChange("published", e.target.checked)}
            />
            <span>Published (uncheck to save as draft — hidden from the site)</span>
          </label>

          <label className="admin-field">
            <span>File size</span>
            <input
              type="text"
              value={form.fileSize}
              onChange={(e) => onFieldChange("fileSize", e.target.value)}
              placeholder="4.2 GB"
            />
          </label>

          <label className="admin-field">
            <span>Clip count</span>
            <input
              type="number"
              min="0"
              value={form.clipCount}
              onChange={(e) => onFieldChange("clipCount", e.target.value)}
              placeholder="120"
            />
          </label>

          <label className="admin-field admin-field--wide">
            <span>Mega download link</span>
            <input
              type="url"
              value={form.download}
              onChange={(e) => onFieldChange("download", e.target.value)}
              required={form.published}
              placeholder="https://mega.nz/folder/... — optional for drafts"
            />
          </label>

          <label className="admin-field admin-field--wide">
            <span>Preview image URLs (one per line)</span>
            <textarea
              rows={3}
              value={form.previewImages}
              onChange={(e) => onFieldChange("previewImages", e.target.value)}
              placeholder="https://example.com/preview1.jpg"
            />
          </label>

          <label className="admin-field admin-field--wide">
            <span>Description</span>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => onFieldChange("description", e.target.value)}
              required
              placeholder="Short blurb shown on pack cards and detail pages."
            />
          </label>
        </div>

        {form.img && (
          <div className="admin-form-preview">
            <img src={form.img} alt="" />
          </div>
        )}

        <div className="admin-form-actions">
          <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
            {saving ? "Saving..." : editingSlug ? "Save changes" : "Create pack"}
          </button>
        </div>
      </form>
    </div>
  );
}
