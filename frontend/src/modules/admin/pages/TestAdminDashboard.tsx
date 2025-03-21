import React, { useState } from "react";
import {
  FaUsers,
  FaDollarSign,
  FaSyncAlt,
  FaExclamationCircle,
  FaSun,
  FaMoon,
} from "react-icons/fa";
import axiosInstance from "@/axios.config";
import { useEffect } from "react";
import SubscriptionGrowthChart from "../components/AdminMembership-page/SubscriptionGrowthChart";
import RecentActivityFeed from "../components/AdminMembership-page/RecentActivityFeed";
import MembershipPlansTable from "../components/AdminMembership-page/MembershipPlansTable";
import UserSubscriptionsTable from "../components/AdminMembership-page/UserSubscriptionsTable";
import InvoiceManagementTable from "../components/AdminMembership-page/InvoiceManagementTable";

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
  const [darkMode, setDarkMode] = useState(true);

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

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  if (loading) {
    return <p className="text-center text-gray-400">Loading...</p>;
  }

  if (error) {
    return (
      <div className="text-center text-red-500 bg-gray-800 p-4 rounded-lg shadow">
        Error: {error}
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"
      } p-8 overflow-y-auto`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 bg-gray-800 p-4 rounded-lg shadow-lg border-l-4 border-purple-500">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            Membership & Invoice Management
          </h1>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            {darkMode ? (
              <FaSun className="text-yellow-400" />
            ) : (
              <FaMoon className="text-gray-300" />
            )}
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            className={`${
              darkMode ? "bg-gray-800" : "bg-white"
            } p-4 rounded-lg shadow`}
          >
            <FaUsers className="text-4xl text-blue-500 mb-2" />
            <h2 className="text-lg font-semibold">Total Active Members</h2>
            <p className="text-2xl font-bold">{stats.totalActiveMembers}</p>
          </div>
          <div
            className={`${
              darkMode ? "bg-gray-800" : "bg-white"
            } p-4 rounded-lg shadow`}
          >
            <FaDollarSign className="text-4xl text-green-500 mb-2" />
            <h2 className="text-lg font-semibold">Total Revenue</h2>
            <p className="text-2xl font-bold">
              LKR {stats.totalRevenue.toLocaleString()}
            </p>
          </div>
          <div
            className={`${
              darkMode ? "bg-gray-800" : "bg-white"
            } p-4 rounded-lg shadow`}
          >
            <FaSyncAlt className="text-4xl text-yellow-500 mb-2" />
            <h2 className="text-lg font-semibold">Auto-Renewal Users</h2>
            <p className="text-2xl font-bold">{stats.autoRenewalUsers}</p>
          </div>
          <div
            className={`${
              darkMode ? "bg-gray-800" : "bg-white"
            } p-4 rounded-lg shadow`}
          >
            <FaExclamationCircle className="text-4xl text-red-500 mb-2" />
            <h2 className="text-lg font-semibold">Failed Payments</h2>
            <p className="text-2xl font-bold">{stats.failedPayments}</p>
          </div>
        </div>

        {/* Subscription Growth Chart */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-100">
              Subscription Growth (Last 6 Months)
            </h2>
            <SubscriptionGrowthChart data={growthData} />
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <RecentActivityFeed activities={recentActivities} />
          </div>
        </div>

        {/* Membership Plans Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="mt-8">
            <MembershipPlansTable />
          </div>

          <div className="mt-8">
            <UserSubscriptionsTable />
          </div>
        </div>

        {/* Invoice Management Table */}
        <div className="mt-8">
          <InvoiceManagementTable />
        </div>
      </div>
    </div>
  );
}
