import React, { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { resolveProfileImageUrl } from "../utils/profileImages";
import { AVATAR_ACCEPT, validateProfileImageFile } from "../utils/profileImageUpload";

export default function ProfileAvatarField({
  previewUrl,
  username = "",
  onFileSelect,
  onClear,
  onUrlChange,
  showUrlInput = false,
  uploading = false,
  error: externalError = "",
}) {
  const inputRef = useRef(null);
  const [useUrl, setUseUrl] = useState(false);
  const [urlValue, setUrlValue] = useState("");
  const [localError, setLocalError] = useState("");
  const resolvedPreview = resolveProfileImageUrl(previewUrl);
  const error = externalError || localError;
  const handle = username ? `@${username.replace(/^@/, "")}` : "";

  useEffect(() => {
    if (previewUrl && /^https?:\/\//.test(previewUrl)) {
      setUrlValue(previewUrl);
    }
  }, [previewUrl]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateProfileImageFile(file);
    if (validationError) {
      setLocalError(validationError);
      event.target.value = "";
      return;
    }

    setLocalError("");
    onFileSelect?.(file);
    event.target.value = "";
  };

  const handleUrlApply = () => {
    onUrlChange?.(urlValue.trim());
  };

  return (
    <div className="ig-avatar-row">
      <button
        type="button"
        className="ig-avatar-ring"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        aria-label={resolvedPreview ? "Change profile photo" : "Add profile photo"}
      >
        {resolvedPreview ? (
          <img src={resolvedPreview} alt="" className="ig-avatar-ring-img" />
        ) : (
          <span className="ig-avatar-ring-empty">
            <Camera size={28} strokeWidth={1.5} />
          </span>
        )}
      </button>

      <div className="ig-avatar-meta">
        {handle ? (
          <strong className="ig-avatar-handle">{handle}</strong>
        ) : (
          <strong className="ig-avatar-handle">Add a profile photo</strong>
        )}

        <div className="ig-avatar-actions">
          <button
            type="button"
            className="ig-text-btn"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : resolvedPreview ? "Change photo" : "Upload photo"}
          </button>

          {resolvedPreview && (
            <button
              type="button"
              className="ig-text-btn ig-text-btn--muted"
              onClick={onClear}
              disabled={uploading}
            >
              Remove
            </button>
          )}
        </div>

        <p className="ig-avatar-hint">JPEG, PNG, WebP, or GIF · GIFs up to 2 MB</p>

        {!showUrlInput && (
          <button
            type="button"
            className="ig-text-btn ig-text-btn--subtle"
            onClick={() => setUseUrl((current) => !current)}
          >
            {useUrl ? "Hide URL option" : "Use image URL instead"}
          </button>
        )}

        {(showUrlInput || useUrl) && (
          <div className="ig-avatar-url">
            <input
              type="url"
              className="ig-input ig-input--compact"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              placeholder="https://..."
            />
            <button type="button" className="ig-text-btn" onClick={handleUrlApply}>
              Apply URL
            </button>
          </div>
        )}

        {error && <p className="ig-form-error">{error}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={AVATAR_ACCEPT}
        hidden
        onChange={handleFileChange}
      />
    </div>
  );
}
