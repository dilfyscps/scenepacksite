import React from "react";
import { Outlet } from "react-router-dom";
import AnnouncementBar from "./AnnouncementBar";
import ApiOfflineBanner from "./ApiOfflineBanner";
import AdminQuickAccess from "./AdminQuickAccess";
import ScrollToTop from "./ScrollToTop";
import { usePageAnalytics } from "../hooks/usePageAnalytics";

export default function SiteLayout() {
  usePageAnalytics();

  return (
    <>
      <ScrollToTop />
      <AnnouncementBar />
      <ApiOfflineBanner />
      <Outlet />
      <AdminQuickAccess />
    </>
  );
}
