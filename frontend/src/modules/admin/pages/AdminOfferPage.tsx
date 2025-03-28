import React from "react";
import { FiGift } from "react-icons/fi";
import DashboardSummary from "../components/AdminOffer-page/DashboardSummary";
import QuickActions from "../components/AdminOffer-page/QuickActions";
import OfferManagement from "../components/AdminOffer-page/OfferManagement/OfferManagement";

const AdminOfferPage: React.FC = () => {
  return (
    <div className="h-full w-full bg-gray-50 dark:bg-gray-900">
      <div className="px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Offers Management
          </h1>
        </div>

        {/* Stats Cards Row */}
        <DashboardSummary />

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <QuickActions />
        </div>

        {/* Offers Management Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            All Offers
          </h2>
          <OfferManagement />
        </div>
      </div>
    </div>
  );
};

export default AdminOfferPage;
