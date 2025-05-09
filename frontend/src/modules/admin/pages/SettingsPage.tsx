import React, { useState } from "react";
import ManagerPanel from "../components/ManagerPanel";
import { Tab } from "@headlessui/react";
import {
  UsersIcon,
  ShieldCheckIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

import { useAuth } from "../../../hooks/useAuth";
import { Navigate, useNavigate } from "react-router-dom";
import AnalyticsDashboard from "./AnalyticsDashboard";
import DashboardPage from "./DashboardPage";
import UserAccountSummary from "../components/UserAnalytics/userStats";

const SettingsPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const { user, loading } = useAuth();

  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/');
  };

  // Handle loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if user is authorized (owner only)
  if (!user || user.role !== "owner") {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="h-screen overflow-y-auto container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-primary dark:text-white mb-8">
        System Settings
      </h1>

      <Tab.Group
        selectedIndex={selectedTab}
        onChange={setSelectedTab}
        className="space-y-6"
      >
        <Tab.List className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
          <Tab
            className={({ selected }) =>
              `px-4 py-2 font-medium text-sm focus:outline-none ${
                selected
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`
            }
          >
            <div className="flex items-center space-x-2">
              <UsersIcon className="w-5 h-5" />
              <span>Manager Management</span>
            </div>
          </Tab>
          <Tab
            className={({ selected }) =>
              `px-4 py-2 font-medium text-sm focus:outline-none ${
                selected
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`
            }
          >
            <div className="flex items-center space-x-2">
              <ChartBarIcon className="w-5 h-5" />
              <span>User Analytics</span>
            </div>
          </Tab>
          <Tab
            className={({ selected }) =>
              `px-4 py-2 font-medium text-sm focus:outline-none ${
                selected
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`
            }
          >
            <div className="flex items-center space-x-2">
              <ClipboardDocumentListIcon className="w-5 h-5" />
              <span>Activity Logs</span>
            </div>
          </Tab>
          <Tab
            className={({ selected }) =>
              `px-4 py-2 font-medium text-sm focus:outline-none ${
                selected
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`
            }
          >
            <div className="flex items-center space-x-2">
              <ClipboardDocumentListIcon className="w-5 h-5" />
              <span>User Logs</span>
            </div>
          </Tab>
        </Tab.List>

        <Tab.Panels>
          {/* Manager Management Panel */}
          <Tab.Panel>
            <ManagerPanel />
          </Tab.Panel>
        {/* Security Panel with UserStats */}
        <Tab.Panel>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-6">
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">User Statistics</h2>
              <UserAccountSummary />
            </div>
          </div>
        </Tab.Panel>
          {/* Activity Logs Panel */}
          <Tab.Panel>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">
                System Activity Logs
              </h2>
              
              {/* Analytics Dashboard  */}
              <div className="mb-6">
                <AnalyticsDashboard />
              </div>
              
              <div className="space-y-4">
                {/*  activity log table  */}
                
              </div>
            </div>
          </Tab.Panel>
          <Tab.Panel>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">
                User Logs
              </h2>
              <div className="space-y-4">
                {/* User Logs */}
                <DashboardPage />
              </div>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      <div className="flex justify-center mt-4">
      <button
        onClick={handleClick}
        className="px-6 py-2 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition duration-300"
      >
        View Customer Site
      </button>
    </div>
    </div>
  );
};

export default SettingsPage;