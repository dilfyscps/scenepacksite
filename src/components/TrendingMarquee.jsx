import React, { useMemo } from "react";
import PackCardLink from "./PackCardLink";

export default function TrendingMarquee({ packs }) {
  const loopPacks = useMemo(() => [...packs, ...packs], [packs]);

  if (!packs.length) return null;

  return (
    <section className="trending-marquee-section" aria-label="Trending scenepacks">
      <div className="trending-marquee-header">
        <div className="section-label">Trending</div>
        <h2>Trending Scenepacks</h2>
        <p>Popular picks from the catalog — hover to pause.</p>
      </div>

      <div className="trending-marquee-wrap">
        <div className="trending-marquee-track">
          {loopPacks.map((pack, index) => (
            <PackCardLink
              key={`${pack.slug}-${index}`}
              pack={pack}
              className="trending-marquee-item"
              downloads={pack.downloads}
              featured
            />
          ))}
        </div>

        <div className="trending-marquee-static">
          {packs.map((pack) => (
            <PackCardLink
              key={pack.slug}
              pack={pack}
              className="trending-marquee-item"
              downloads={pack.downloads}
              featured
            />
          ))}
        </div>
      </div>
    </section>
  );
}
