import React from "react";
import "./ScenepackCard.css";

export default function ScenepackCard({ title, img, description, lastUpdated }) {
  return (
    <div className="scenepack-card">
      <div className="image-wrapper">
        <img src={img} alt={title} />
        <div className="overlay">
          <h3>{title}</h3>
          <p>{description}</p>
          {lastUpdated && <span className="last-updated">Updated: {lastUpdated}</span>}
        </div>
      </div>
    </div>
  );
}