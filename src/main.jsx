import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SiteLayout from "./components/SiteLayout";
import { PacksProvider } from "./context/PacksContext";
import Home from "./pages/Home";
import Packs from "./pages/Packs";
import PackPage from "./pages/PackPage";
import TvShows from "./pages/TvShows";
import Movies from "./pages/Movies";
import RequestPack from "./pages/RequestPack";
import Guide from "./pages/Guide";
import Socials from "./pages/Socials";
import Profiles from "./pages/Profiles";
import ProfilePage from "./pages/ProfilePage";
import CreateProfile from "./pages/CreateProfile";
import EditProfile from "./pages/EditProfile";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPacks from "./pages/admin/AdminPacks";
import AdminAddPack from "./pages/admin/AdminAddPack";
import AdminEditPack from "./pages/admin/AdminEditPack";
import AdminRequests from "./pages/admin/AdminRequests";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminRoute from "./components/AdminRoute";
import NotFound from "./pages/NotFound";
import "./index.css";
import "./App.css";
import "./responsive.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <PacksProvider>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/packs" element={<Packs />} />
            <Route path="/pack/:slug" element={<PackPage />} />
            <Route path="/tv-shows" element={<TvShows />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/request" element={<RequestPack />} />
            <Route path="/updates" element={<Navigate to="/request" replace />} />
            <Route path="/guide" element={<Guide />} />
            <Route path="/socials" element={<Socials />} />
            <Route path="/profiles/new" element={<CreateProfile />} />
            <Route path="/profiles/edit" element={<EditProfile />} />
            <Route path="/profiles/:username" element={<ProfilePage />} />
            <Route path="/profiles" element={<Profiles />} />
          </Route>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/packs/add"
            element={
              <AdminRoute>
                <AdminAddPack />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/packs/:slug/edit"
            element={
              <AdminRoute>
                <AdminEditPack />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/packs"
            element={
              <AdminRoute>
                <AdminPacks />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/requests"
            element={
              <AdminRoute>
                <AdminRequests />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <AdminRoute>
                <AdminSettings />
              </AdminRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </PacksProvider>
    </BrowserRouter>
  </React.StrictMode>
);
