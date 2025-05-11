import React, { useState, useEffect } from "react";
import { ArrowUpIcon, ArrowDownIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { FirebaseAnalytics } from "@/config/firebase";
import axiosInstance from "@/axios.config";
import { Line } from "react-chartjs-2";

// Add user activity chart component
const UserActivityChart: React.FC<{ data: any }> = ({ data }) => {
  const chartData = {
    labels: data?.last30Days?.map((d: any) => new Date(d.date).toLocaleDateString()) || [],
    datasets: [
      {
        label: 'User Activity',
        data: data?.last30Days?.map((d: any) => d.activeUsers) || [],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(75, 85, 99, 0.1)' },
        ticks: { color: '#9CA3AF' }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#9CA3AF' }
      }
    }
  };

  return (
    <div className="h-64">
      <Line data={chartData} options={options} />
    </div>
  );
};

const AnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [summaryRes, realtimeRes] = await Promise.all([
        axiosInstance.get('/analytics/summary'),
        axiosInstance.get('/analytics/realtime')
      ]);

      setAnalyticsData({
        summary: summaryRes.data.data,
        realtime: realtimeRes.data.data
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading analytics...</div>;

  return (
    <div className="space-y-6">
      {/* User Activity Over Time */}
      <div className="bg-gray-900 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-white">User activity over time</h2>
          <div className="flex space-x-2">
            <span className="text-sm text-gray-400">30 DAYS: {analyticsData?.summary?.totalUsers || 0}</span>
            <span className="text-sm text-gray-400">7 DAYS: {analyticsData?.summary?.activeUsers || 0}</span>
            <span className="text-sm text-gray-400">1 DAY: {analyticsData?.realtime?.activeUsers || 0}</span>
          </div>
        </div>
        <UserActivityChart data={analyticsData?.summary} />
      </div>

      {/* Active Users in Last 30 Minutes */}
      <div className="bg-gray-900 rounded-lg p-6">
        <h2 className="text-lg font-medium text-white mb-4">
          ACTIVE USERS IN LAST 30 MINUTES: {analyticsData?.realtime?.activeUsers || 0}
        </h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm text-gray-400 mb-2">ACTIVE USERS PER MINUTE</h3>
            <div className="h-32">
              <Line 
                data={{
                  labels: analyticsData?.realtime?.minuteByMinute?.map((m: any) => m.minute) || [],
                  datasets: [{
                    label: 'Users per minute',
                    data: analyticsData?.realtime?.minuteByMinute?.map((m: any) => m.users) || [],
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: { beginAtZero: true }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-gray-900 rounded-lg p-6">
        <h2 className="text-lg font-medium text-white mb-4">Events</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="text-left text-gray-400">Event name</th>
                <th className="text-left text-gray-400">Count</th>
                <th className="text-left text-gray-400">Users</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData?.summary?.events?.map((event: any) => (
                <tr key={event.name}>
                  <td className="py-2 text-gray-300">{event.name}</td>
                  <td className="py-2 text-gray-300">{event.count}</td>
                  <td className="py-2 text-gray-300">{event.users}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;