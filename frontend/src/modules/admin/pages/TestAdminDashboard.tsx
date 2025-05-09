import { useState, useEffect } from "react";
import {
  FiUsers,
  FiDollarSign,
  FiRefreshCw,
  FiAlertCircle,
} from "react-icons/fi";
import axiosInstance from "@/axios.config";
import SubscriptionGrowthChart from "../components/AdminMembership-page/SubscriptionGrowthChart";
import RecentActivityFeed from "../components/AdminMembership-page/RecentActivityFeed";
import MembershipPlansTable from "../components/AdminMembership-page/MembershipPlansTable";
import UserSubscriptionsTable from "../components/AdminMembership-page/UserSubscriptionsTable";
import InvoiceManagementTable from "../components/AdminMembership-page/InvoiceManagementTable";
import FailedRenewalsTable from "../components/AdminMembership-page/FailedRenewalsTable";

export default function AdminMembershipPage() {
  const [stats, setStats] = useState({
    totalActiveMembers: 0,
    totalRevenue: 0,
    autoRenewalUsers: 0,
    failedPayments: 0,
  });
  const [growthData, setGrowthData] = useState<
    { month: string; count: number }[]
  >([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [statsResponse, growthResponse, activitiesResponse] =
          await Promise.all([
            axiosInstance.get("/subscriptions/stats"),
            axiosInstance.get("/subscriptions/growth"),
            axiosInstance.get("/subscriptions/recentActivities"),
          ]);
        setStats(statsResponse.data);
        setGrowthData(growthResponse.data.data);
        setRecentActivities(activitiesResponse.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Format currency
  const formatCurrency = (amount: number): string => {
    return `LKR ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8 py-6">
        <div className="p-6 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-lg">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-gray-50 dark:bg-gray-900">
      <div className="px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Membership & Subscription Management
          </h1>
        </div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-all border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Active Members
                </p>
                <h3 className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">
                  {stats.totalActiveMembers}
                </h3>
              </div>
              <div className="p-3 rounded-full bg-gray-50 dark:bg-gray-700">
                <FiUsers className="text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-all border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Revenue
                </p>
                <h3 className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">
                  {formatCurrency(stats.totalRevenue)}
                </h3>
              </div>
              <div className="p-3 rounded-full bg-gray-50 dark:bg-gray-700">
                <FiDollarSign className="text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-all border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Auto-Renewal Users
                </p>
                <h3 className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">
                  {stats.autoRenewalUsers}
                </h3>
              </div>
              <div className="p-3 rounded-full bg-gray-50 dark:bg-gray-700">
                <FiRefreshCw className="text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-all border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Failed Payments
                </p>
                <h3 className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">
                  {stats.failedPayments}
                </h3>
              </div>
              <div className="p-3 rounded-full bg-gray-50 dark:bg-gray-700">
                <FiAlertCircle className="text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Subscription Growth (Last 6 Months)
            </h2>
            <SubscriptionGrowthChart data={growthData} />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h2>
            <RecentActivityFeed activities={recentActivities} />
          </div>
        </div>

        {/* Membership Management Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Membership Plans
            </h2>
            <MembershipPlansTable />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              User Subscriptions
            </h2>
            <UserSubscriptionsTable />
          </div>
        </div>

        {/* Invoice Management Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Invoice Management
          </h2>
          <InvoiceManagementTable />
        </div>

        {/* Auto-Renewal Status Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Failed Auto-Renewals Management
          </h2>
          <FailedRenewalsTable />
        </div>
      </div>
    </div>
  );
}
