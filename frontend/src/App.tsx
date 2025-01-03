import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./modules/users/pages/HomePage";
import AboutPage from "./modules/users/pages/AboutPage";
import NotFoundPage from "./components/NotFoundPage";
import GamesPage from "./modules/users/pages/GamesPage";
import SettingsPage from "./modules/admin/pages/SettingsPage";
import DashboardPage from "./modules/admin/pages/DashboardPage";
import { ScrollToTop } from "./utils/scrollToTop.util";
import AdminLayout from "./modules/admin/layout/AdminLayout";
import AdminGamesPage from "./modules/admin/pages/AdminGamesPage";
import AdminPackagePage from "./modules/admin/pages/AdminPackagePage";
import PackagesPage from "./modules/users/pages/PackagesPage";



function App() {
  try {
    return (
      <>
        <ScrollToTop />
        <Routes>
          {/* User Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/packages" element={<PackagesPage />} />
          <Route path="/about" element={<AboutPage />} />
          {/* Keep the catch-all route at the end */}
          <Route path="*" element={<NotFoundPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="games" element={<AdminGamesPage />} />
            <Route path="packages" element={<AdminPackagePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </>
    );
  } catch (error) {
    console.error("App component error:", error);
    return (
      <div className="p-4 bg-red-500 text-white">
        App Component Error: {error instanceof Error ? error.message : "Unknown error"}
      </div>
    );
  }
}

export default App;
