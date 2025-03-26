import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
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
import OfferPage from "./modules/users/pages/OfferPage";
import TimeBased from "./modules/users/pages/OfferPages/TimeBased";
import MembershipBased from "./modules/users/pages/OfferPages/MembershipBased";
import General from "./modules/users/pages/OfferPages/General";
import EventPage from "./modules/users/pages/EventPage";
import VerifyEmail from "./modules/users/pages/EventPages/VerifyEmail";
import VerifyTeamMember from "./modules/users/pages/EventPages/VerifyTeamMember";

import AdminOfferPage from "./modules/admin/pages/AdminOfferPage";
import MembershipPage from "./modules/users/pages/MembershipPage";
//import AdminMembershipPage from "./modules/admin/pages/AdminMembershipPage";

import AdminMembershipPage from "./modules/admin/pages/TestAdminDashboard";
import AdminPackagePage from "./modules/admin/pages/AdminPackagePage";
import PackagesPage from "./modules/users/pages/PackagesPage";
import AuthPage from "./modules/users/pages/AuthPage";
import ForgotPassword from "./modules/users/pages/ForgotPassword";
import ProfilePage from "./modules/users/pages/ProfilePage";
import AdminBookingManager from "./modules/admin/pages/AdminBookingManager";
import AdminAuthPage from "./modules/admin/pages/AdminAuthPage";
import AdminEventPage from "./modules/admin/pages/AdminEventPage";
import OverviewPage from "./modules/admin/pages/OverviewPage";
import SingleBattle from "./modules/users/pages/EventPages/SingleBattle";
import TeamBattle from "./modules/users/pages/EventPages/TeamBattle";
const App: React.FC = () => {
  useEffect(() => {
    // Always set dark mode as default
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <Router>
      <ScrollToTop /> {/* utillity to always scroll to top on URL change */}
      <Toaster position="top-right" />
      <Routes>
        {/* User Routes */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/admin/auth" element={<AdminAuthPage />} />

        <Route path="/" element={<HomePage />} />
        <Route path="/games" element={<GamesPage />} />
        <Route path="/bookings" element={<BookingPage />} />
        <Route path="/packages" element={<PackagesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/offers" element={<OfferPage />} />
        <Route path="/memberships" element={<MembershipPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/events" element={<EventPage />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Offer Category Routes */}
        <Route path="/offers/time-based" element={<TimeBased />} />
        <Route path="/offers/membership-based" element={<MembershipBased />} />
        <Route path="/offers/general" element={<General />} />
        {/* Events Routes */}
        <Route path="/single-battle" element={<SingleBattle />} />
        <Route path="/team-battle" element={<TeamBattle />} />
        <Route path="/verify/:token" element={<VerifyEmail />} />
        <Route path="/verify-member/:token" element={<VerifyTeamMember />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="overview" />} />
          <Route path="overview" element={<OverviewPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="games" element={<AdminGamesPage />} />
          <Route path="offers" element={<AdminOfferPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="memberships" element={<AdminMembershipPage />} />
          <Route path="packages" element={<AdminPackagePage />} />
          <Route path="booking" element={<AdminBookingManager />} />
          <Route path="events" element={<AdminEventPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
};
export default App;
