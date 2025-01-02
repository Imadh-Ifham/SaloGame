import React from "react";
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

import SettingsPage from "./modules/admin/pages/SettingsPage";
import DashboardPage from "./modules/admin/pages/DashboardPage";
import { ScrollToTop } from "./utils/scrollToTop.util";
import AdminLayout from "./modules/admin/layout/AdminLayout";
import AdminGamesPage from "./modules/admin/pages/AdminGamesPage";
import BlueprintManager from "./modules/admin/pages/BlueprintManager";
import EventManagerPage from "./modules/admin/pages/EventManager";
import EventPage from "./modules/users/pages/EventPages/EventPage";
import TeamRegistration from "./modules/users/pages/EventPages/TeamRegistration";

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop /> {/* utillity to always scroll to top on URL change */}
      <Routes>
        {/* User Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/games" element={<GamesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/events" element={<EventPage/>} />
        <Route path="/team-registration/:eventId" element={<TeamRegistration userId="64a32f3b6f10b5a10b34d672" />} />


        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="games" element={<AdminGamesPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="layout-manager" element={<BlueprintManager />} />
          <Route path="events" element={<EventManagerPage/>}/>
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
