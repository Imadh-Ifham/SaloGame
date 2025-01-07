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
import EventManagerPage from "./modules/admin/pages/EventManager";
import EventPage from "./modules/users/pages/EventPages/EventPage";
import TeamRegistration from "./modules/users/pages/EventPages/TeamRegistration";
import TeamsManager from "./modules/admin/pages/TeamsManager";
import MembershipPage from "./modules/users/pages/MembershipPage";
import AdminMembershipPage from "./modules/admin/pages/AdminMembershipPage";
import AdminPackagePage from "./modules/admin/pages/AdminPackagePage";
import PackagesPage from "./modules/users/pages/PackagesPage";
import AdminBookingPage from "./modules/admin/pages/AdminBookingPage";
import AdminViewAllBookingsPage from "./modules/admin/pages/AdminViewAllBookingsPage";

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
        <Route path="/" element={<HomePage />} />
        <Route path="/games" element={<GamesPage />} />
        <Route path="/bookings" element={<BookingPage />} />
        <Route path="/packages" element={<PackagesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/offers" element={<OffersPage />} />
        <Route path="/memberships" element={<MembershipPage />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/events" element={<EventPage/>} />
        <Route path="/team-registration/:eventId" element={<TeamRegistration userId="64a32f3b6f10b5a10b34d672" />} />


        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="games" element={<AdminGamesPage />} />
          <Route path="offers" element={<AdminOfferPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="layout-manager" element={<BlueprintManager />} />
          <Route path="events" element={<EventManagerPage/>}/>
          <Route path="teams/:eventId" element={<TeamsManager />} /> {/* Add this route */}
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
