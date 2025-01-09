import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import HomePage from "./modules/users/pages/HomePage";
import AboutPage from "./modules/users/pages/AboutPage";
import NotFoundPage from "./components/NotFoundPage";
import GamesPage from "./modules/users/pages/GamesPage";
import BookingPage from "./modules/users/pages/BookingPage";
import SettingsPage from "./modules/admin/pages/SettingsPage";
import DashboardPage from "./modules/admin/pages/DashboardPage";
import { ScrollToTop } from "./utils/scrollToTop.util";
import AdminLayout from "./modules/admin/layout/AdminLayout";
import AdminGamesPage from "./modules/admin/pages/AdminGamesPage";
import OffersPage from "./modules/users/pages/OffersPage";
import AdminOfferPage from "./modules/admin/pages/AdminOfferPage";
import BlueprintManager from "./modules/admin/pages/BlueprintManager";
import MembershipPage from "./modules/users/pages/MembershipPage";
import AdminMembershipPage from "./modules/admin/pages/AdminMembershipPage";
import AdminPackagePage from "./modules/admin/pages/AdminPackagePage";
import PackagesPage from "./modules/users/pages/PackagesPage";
import AdminBookingPage from "./modules/admin/pages/AdminBookingPage";
import AdminViewAllBookingsPage from "./modules/admin/pages/AdminViewAllBookingsPage";
import AuthPage from "./modules/users/pages/AuthPage";
const App: React.FC = () => {
  useEffect(() => {
    // Always set dark mode as default
    document.documentElement.classList.add("dark");
  }, []);
  return (
    <Router>
      <ScrollToTop /> {/* utillity to always scroll to top on URL change */}
      <Routes>
        {/* User Routes */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={role === "user" ? <HomePage /> : <Navigate to="/admin" />} />
        <Route path="/admin" element={role === "admin" ? <AdminDashboard /> : <Navigate to="/" />} />
        
        <Route path="/games" element={<GamesPage />} />
        <Route path="/bookings" element={<BookingPage />} />
        <Route path="/packages" element={<PackagesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/offers" element={<OffersPage />} />
        <Route path="/memberships" element={<MembershipPage />} />
        <Route path="*" element={<NotFoundPage />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="games" element={<AdminGamesPage />} />
          <Route path="offers" element={<AdminOfferPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="layout-manager" element={<BlueprintManager />} />
          <Route path="memberships" element={<AdminMembershipPage />} />
          <Route path="booking" element={<AdminBookingPage />} />
          <Route path="packages" element={<AdminPackagePage />} />
          <Route path="bookings/all" element={<AdminViewAllBookingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
