import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard } from "lucide-react";
import { useAdminAccess } from "../hooks/useAdminAccess";

export default function AdminQuickAccess() {
  const { pathname } = useLocation();
  const { loggedIn, adminPath } = useAdminAccess();

  if (!loggedIn || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <Link to={adminPath} className="admin-quick-access" aria-label="Open admin dashboard">
      <LayoutDashboard size={16} aria-hidden="true" />
      <span>Admin</span>
    </Link>
  );
}
