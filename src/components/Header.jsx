import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import { LayoutDashboard, Menu, Sparkles, X } from "lucide-react";
import { useAdminAccess } from "../hooks/useAdminAccess";

const navItems = [
  { to: "/packs", label: "Packs" },
  { to: "/profiles", label: "Profiles" },
  { to: "/request", label: "Request" },
  { to: "/guide", label: "Guide" },
  { to: "/socials", label: "Socials" },
];

export default function Header() {
  const { pathname } = useLocation();
  const { adminPath, adminLabel, loggedIn } = useAdminAccess();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const isActive = (to) => {
    if (to === "/") return pathname === "/";
    return pathname.startsWith(to);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`header${scrolled ? " header--scrolled" : ""}`}>
      <div className="header-accent-line" aria-hidden="true" />

      <div className="header-inner">
        <Link to="/" className="logo-link" onClick={closeMenu}>
          <span className="logo-mark">
            <Sparkles size={16} aria-hidden="true" />
          </span>
          <span className="logo-text">
            <span className="logo-name">DILFYSCPS</span>
            <span className="logo-tagline">Scenepacks</span>
          </span>
        </Link>

        {isMobile ? (
          <>
            <button
              type="button"
              className={`mobile-menu-btn${menuOpen ? " mobile-menu-btn--open" : ""}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {menuOpen && (
              <>
                <div className="mobile-nav-backdrop" onClick={closeMenu} />
                <nav className="mobile-nav" aria-label="Main">
                  <ul className="mobile-nav-list">
                    <li>
                      <Link
                        to="/"
                        className={`mobile-nav-link${pathname === "/" ? " active" : ""}`}
                        onClick={closeMenu}
                      >
                        Home
                      </Link>
                    </li>
                    {navItems.map(({ to, label }) => (
                      <li key={to}>
                        <Link
                          to={to}
                          className={`mobile-nav-link${isActive(to) ? " active" : ""}`}
                          onClick={closeMenu}
                        >
                          {label}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <Link
                        to={adminPath}
                        className={`mobile-nav-link mobile-nav-link--admin${pathname.startsWith("/admin") ? " active" : ""}`}
                        onClick={closeMenu}
                      >
                        {adminLabel}
                      </Link>
                    </li>
                  </ul>
                </nav>
              </>
            )}
          </>
        ) : (
          <div className="header-center">
            <nav className="nav nav-pill" aria-label="Main">
              <ul className="nav-list">
                {navItems.map(({ to, label }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className={`nav-link${isActive(to) ? " active" : ""}`}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        )}

        {!isMobile && (
          <div className="header-spacer">
            <Link
              to={adminPath}
              className={`header-admin-link${loggedIn ? " header-admin-link--active" : ""}`}
              aria-label={loggedIn ? "Open admin dashboard" : "Admin sign in"}
            >
              <LayoutDashboard size={16} aria-hidden="true" />
              <span>{adminLabel}</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
