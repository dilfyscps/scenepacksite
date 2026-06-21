import React from "react";
import { Link } from "react-router-dom";
import { useAdminAccess } from "../hooks/useAdminAccess";

const footerSections = [
  {
    title: "Browse",
    links: [
      { to: "/packs", label: "All Packs" },
      { to: "/tv-shows", label: "TV Shows" },
      { to: "/movies", label: "Movies" },
    ],
  },
  {
    title: "Resources",
    links: [
      { to: "/request", label: "Request a Pack" },
      { to: "/guide", label: "Download Guide" },
      { to: "/socials", label: "Socials" },
    ],
  },
];

export default function Footer() {
  const { adminPath, adminLabel } = useAdminAccess();

  const resourceLinks = [...footerSections[1].links, { to: adminPath, label: adminLabel }];
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand-col">
          <Link to="/" className="footer-logo">
            <span className="logo-mark">DS</span>
            <span>DILFYSCPS</span>
          </Link>
          <p className="footer-tagline">
            Curated movie and TV scenepacks for editors and content creators.
          </p>
        </div>

        {footerSections.map(({ title, links }) => (
          <div key={title} className="footer-col">
            <h3>{title}</h3>
            <ul>
              {(title === "Resources" ? resourceLinks : links).map(({ to, label }) => (
                <li key={to}>
                  <Link to={to}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="footer-bottom">
        <p className="footer-copy">© {new Date().getFullYear()} DILFYSCPS</p>
      </div>
    </footer>
  );
}
