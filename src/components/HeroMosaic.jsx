import React, { useEffect, useMemo, useState } from "react";

const SLOT_COUNT = 3;
const ROTATE_MS = 5000;

function pickInitialIndices(count) {
  if (count === 0) return [];
  return Array.from({ length: Math.min(SLOT_COUNT, count) }, (_, i) => i % count);
}

function nextUniqueIndex(current, others, count) {
  if (count <= 1) return 0;

  for (let step = 1; step <= count; step += 1) {
    const candidate = (current + step) % count;
    if (!others.includes(candidate)) return candidate;
  }

  return (current + 1) % count;
}

export default function HeroMosaic({ packs }) {
  const pool = useMemo(() => (packs.length ? packs : []), [packs]);
  const [indices, setIndices] = useState(() => pickInitialIndices(pool.length));
  const [activeSlot, setActiveSlot] = useState(0);

  useEffect(() => {
    setIndices(pickInitialIndices(pool.length));
    setActiveSlot(0);
  }, [pool.length]);

  useEffect(() => {
    if (pool.length <= 1) return undefined;

    const slotCount = Math.min(SLOT_COUNT, pool.length);
    let slot = 0;

    const interval = setInterval(() => {
      setActiveSlot(slot);
      setIndices((current) => {
        const next = [...current];
        const others = next.filter((_, i) => i !== slot);
        next[slot] = nextUniqueIndex(next[slot], others, pool.length);
        return next;
      });
      slot = (slot + 1) % slotCount;
    }, ROTATE_MS);

    return () => clearInterval(interval);
  }, [pool.length]);

  if (!pool.length) return null;

  const slots = indices.slice(0, Math.min(SLOT_COUNT, pool.length));

  return (
    <div className="hero-mosaic" aria-hidden="true">
      {slots.map((packIndex, slot) => {
        const pack = pool[packIndex];
        if (!pack) return null;

        return (
          <div
            key={slot}
            className={`hero-mosaic-slot hero-mosaic-slot--${slot + 1}${
              activeSlot === slot ? " hero-mosaic-slot--changing" : ""
            }`}
          >
            <img
              key={pack.slug}
              src={pack.img}
              alt=""
              className="hero-mosaic-img"
              loading="eager"
            />
          </div>
        );
      })}
    </div>
  );
}
