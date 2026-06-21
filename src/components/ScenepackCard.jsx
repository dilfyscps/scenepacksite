import React from "react";
import { Download, Sparkles } from "lucide-react";
import { formatDownloads, formatPackSize, isNewPack } from "../utils/packUtils";
import "./ScenepackCard.css";

export default function ScenepackCard({
  title,
  img,
  description,
  category,
  downloads,
  featured,
  pack,
}) {
  const downloadLabel = formatDownloads(downloads);
  const sizeLabel = pack ? formatPackSize(pack) : "";
  const showNew = pack ? isNewPack(pack) : false;

  return (
    <article className={`scenepack-card${featured ? " scenepack-card--featured" : ""}`}>
      <div className="image-wrapper">
        <img src={img} alt={title} loading="lazy" />
        {showNew && (
          <span className="card-new-badge">
            <Sparkles size={11} aria-hidden="true" />
            New
          </span>
        )}
        {category && <span className="card-category-badge">{category}</span>}
        {downloadLabel && (
          <span className="card-downloads-badge">
            <Download size={11} aria-hidden="true" />
            {downloadLabel}
          </span>
        )}
        <div className="overlay">
          <h3>{title}</h3>
          <p>{description}</p>
          {sizeLabel && <span className="card-size-label">{sizeLabel}</span>}
        </div>
      </div>
      <div className="card-title-bar">
        <h3>{title}</h3>
        {sizeLabel && <span className="card-title-meta">{sizeLabel}</span>}
      </div>
    </article>
  );
}
