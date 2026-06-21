import React from "react";
import { Link } from "react-router-dom";
import { Film, Tv, LayoutGrid, BookOpen, MessageSquarePlus, Share2 } from "lucide-react";

const tiles = [
  {
    to: "/packs",
    label: "All Packs",
    desc: "Browse everything",
    icon: LayoutGrid,
    accent: "violet",
  },
  {
    to: "/tv-shows",
    label: "TV Shows",
    desc: "Series scenepacks",
    icon: Tv,
    accent: "blue",
  },
  {
    to: "/movies",
    label: "Movies",
    desc: "Film scenepacks",
    icon: Film,
    accent: "rose",
  },
  {
    to: "/request",
    label: "Request a pack",
    desc: "Suggest a title",
    icon: MessageSquarePlus,
    accent: "amber",
  },
  {
    to: "/guide",
    label: "Guide",
    desc: "How to download",
    icon: BookOpen,
    accent: "teal",
  },
  {
    to: "/socials",
    label: "Socials",
    desc: "Follow us online",
    icon: Share2,
    accent: "violet",
  },
];

export default function CategoryTiles() {
  return (
    <section className="category-tiles">
      {tiles.map(({ to, label, desc, icon: Icon, accent }) => (
        <Link key={to} to={to} className={`category-tile category-tile--${accent}`}>
          <span className="category-tile-icon">
            <Icon size={20} aria-hidden="true" />
          </span>
          <span className="category-tile-text">
            <strong>{label}</strong>
            <span>{desc}</span>
          </span>
        </Link>
      ))}
    </section>
  );
}
