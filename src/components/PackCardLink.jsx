import React from "react";
import { Link } from "react-router-dom";
import ScenepackCard from "./ScenepackCard";

export default function PackCardLink({ pack, className = "", featured, downloads, children }) {
  return (
    <Link
      to={`/pack/${pack.slug}`}
      className={["pack-card-btn", className].filter(Boolean).join(" ")}
    >
      {children || (
        <ScenepackCard
          title={pack.title}
          img={pack.img}
          description={pack.description}
          category={pack.category}
          downloads={downloads ?? pack.downloads}
          featured={featured}
          pack={pack}
        />
      )}
    </Link>
  );
}
