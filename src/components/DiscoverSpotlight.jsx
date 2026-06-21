import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Shuffle } from "lucide-react";
import { usePacks } from "../context/PacksContext";
import { getRandomPack } from "../utils/packUtils";

export default function DiscoverSpotlight() {
  const { packs } = usePacks();
  const [pack, setPack] = useState(null);

  useEffect(() => {
    if (packs.length) {
      setPack(getRandomPack(packs));
    }
  }, [packs]);

  const shuffle = useCallback(() => {
    setPack((current) => getRandomPack(packs, current?.slug));
  }, [packs]);

  if (!pack) return null;

  return (
    <section className="discover-section">
      <div className="discover-section-header">
        <div className="section-label">Discover</div>
        <h2>Not sure where to start?</h2>
        <p>Hit shuffle and we&apos;ll surface a pack from the catalog.</p>
      </div>

      <div className="discover-spotlight">
        <Link to={`/pack/${pack.slug}`} className="discover-spotlight-poster">
          <img src={pack.img} alt={pack.title} loading="lazy" />
          <span className="discover-spotlight-poster-label">View pack</span>
        </Link>

        <div className="discover-spotlight-body">
          <div className="discover-spotlight-badges">
            <span className="pack-badge">{pack.category}</span>
            <span className="pack-badge pack-badge-muted">{pack.creator}</span>
          </div>

          <h3>{pack.title}</h3>
          <p>{pack.description}</p>

          {pack.date && (
            <span className="discover-spotlight-meta">Added {pack.date}</span>
          )}

          <div className="discover-spotlight-actions">
            <Link to={`/pack/${pack.slug}`} className="hero-cta primary">
              Open pack
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <button type="button" className="hero-cta secondary" onClick={shuffle}>
              <Shuffle size={16} aria-hidden="true" />
              Shuffle
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
