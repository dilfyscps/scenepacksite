import React from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  LayoutDashboard,
  LogOut,
  Megaphone,
  MessageSquarePlus,
  Package,
  Plus,
  Sparkles,
} from "lucide-react";
import { adminLogout } from "../../utils/adminApi";

const NAV_ITEMS = [
  {
    to: "/admin",
    end: true,
    icon: BarChart3,
    label: "Stats",
    desc: "Downloads & analytics",
    isActive: (pathname) => pathname === "/admin",
  },
  {
    to: "/admin/packs/add",
    icon: Plus,
    label: "Add pack",
    desc: "Create a new scenepack",
    isActive: (pathname) => pathname === "/admin/packs/add",
  },
  {
    to: "/admin/packs",
    end: true,
    icon: Package,
    label: "Manage packs",
    desc: "Edit & remove catalog",
    isActive: (pathname) =>
      pathname === "/admin/packs" || /^\/admin\/packs\/[^/]+\/edit$/.test(pathname),
  },
  {
    to: "/admin/requests",
    icon: MessageSquarePlus,
    label: "Requests",
    desc: "Community suggestions",
    isActive: (pathname) => pathname.startsWith("/admin/requests"),
  },
  {
    to: "/admin/settings",
    icon: Megaphone,
    label: "Settings",
    desc: "Announcement bar",
    isActive: (pathname) => pathname.startsWith("/admin/settings"),
  },
];

export default function AdminLayout({ children, title = "Dashboard" }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = async () => {
    await adminLogout();
    navigate("/admin/login");
  };

  return (
    <div className="admin-shell">
      <div className="admin-shell-glow admin-shell-glow--1" aria-hidden="true" />
      <div className="admin-shell-glow admin-shell-glow--2" aria-hidden="true" />

      <aside className="admin-sidebar">
        <Link to="/admin" className="admin-sidebar-brand">
          <span className="admin-sidebar-mark">
            <Sparkles size={16} aria-hidden="true" />
          </span>
          <span>
            <strong>DILFYSCPS</strong>
            <span>Admin console</span>
          </span>
        </Link>

        <nav className="admin-sidebar-nav" aria-label="Admin sections">
          {NAV_ITEMS.map(({ to, end, icon: Icon, label, desc, isActive }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={() =>
                `admin-sidebar-link${isActive(pathname) ? " admin-sidebar-link--active" : ""}`
              }
            >
              <span className="admin-sidebar-link-icon">
                <Icon size={18} aria-hidden="true" />
              </span>
              <span className="admin-sidebar-link-text">
                <strong>{label}</strong>
                <span>{desc}</span>
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-sidebar-action">
            <ArrowLeft size={16} aria-hidden="true" />
            View site
          </Link>
          <button type="button" className="admin-sidebar-action admin-sidebar-action--danger" onClick={handleLogout}>
            <LogOut size={16} aria-hidden="true" />
            Log out
          </button>
        </div>
      </aside>

      <div className="admin-shell-body">
        <header className="admin-topbar">
          <div className="admin-topbar-title">
            <LayoutDashboard size={18} aria-hidden="true" />
            <span>{title}</span>
          </div>
          <nav className="admin-topbar-nav" aria-label="Admin sections mobile">
            {NAV_ITEMS.map(({ to, end, icon: Icon, label, isActive }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={() =>
                  `admin-topbar-link${isActive(pathname) ? " admin-topbar-link--active" : ""}`
                }
              >
                <Icon size={15} aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="admin-shell-main">{children}</main>
      </div>
    </div>
  );
}
