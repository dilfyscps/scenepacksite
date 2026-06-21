import React from "react";

export default function PackPreviewGallery({ images, title }) {
  if (!images?.length) return null;

  return (
    <section className="pack-preview-gallery">
      <h2>Preview</h2>
      <div className="pack-preview-grid">
        {images.map((src) => (
          <a key={src} href={src} target="_blank" rel="noopener noreferrer" className="pack-preview-item">
            <img src={src} alt={`${title} preview`} loading="lazy" />
          </a>
        ))}
      </div>
    </section>
  );
}
