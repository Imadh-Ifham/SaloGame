import React, { useEffect, useState } from 'react';
import { FiUsers, FiUserCheck, FiUserX, FiUserPlus, FiDownload } from 'react-icons/fi';
import { motion } from 'framer-motion';
import axiosInstance from '@/axios.config';
import { PDFViewer } from '@react-pdf/renderer';
import UserStatsPDF from './UserStatsPDF';

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  usersByRole: {
    owner: number;
    manager: number;
    user: number;
  };
  newUsersThisMonth: number;
}

const UserAccountSummary = () => {
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    usersByRole: {
      owner: 0,
      manager: 0,
      user: 0
    },
    newUsersThisMonth: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPDF, setShowPDF] = useState(false);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const response = await axiosInstance.get('/stats');
        if (response.data.success) {
          setStats(response.data.data); // Access .data property from response
        } else {
          setError(response.data.message || 'Failed to fetch user statistics');
        }
      } catch (err) {
        setError('Failed to fetch user statistics');
        console.error('Error fetching user stats:', err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchUserStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">User Statistics</h2>
        <button
          onClick={() => setShowPDF(!showPDF)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <FiDownload size={16} />
          <span>{showPDF ? 'Hide Report' : 'Generate Report'}</span>
        </button>
      </div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Users
              </p>
              <h3 className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">
                {stats.totalUsers}
              </h3>
            </div>
            <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/20">
              <FiUsers className="text-blue-500" size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Users
              </p>
              <h3 className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">
                {stats.activeUsers}
              </h3>
            </div>
            <div className="p-3 rounded-full bg-green-50 dark:bg-green-900/20">
              <FiUserCheck className="text-green-500" size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Inactive Users
              </p>
              <h3 className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">
                {stats.inactiveUsers}
              </h3>
            </div>
            <div className="p-3 rounded-full bg-red-50 dark:bg-red-900/20">
              <FiUserX className="text-red-500" size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                New Users This Month
              </p>
              <h3 className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">
                {stats.newUsersThisMonth}
              </h3>
            </div>
            <div className="p-3 rounded-full bg-purple-50 dark:bg-purple-900/20">
              <FiUserPlus className="text-purple-500" size={24} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Users by Role */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Users by Role
        </h3>
        <div className="space-y-4">
          {Object.entries(stats.usersByRole).map(([role, count]) => (
            <div key={role} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="capitalize text-gray-700 dark:text-gray-300">
                  {role}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-600 dark:text-gray-400">{count} users</span>
                <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{
                      width: `${(count / stats.totalUsers) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
      {/* PDF Viewer */}
      {showPDF && (
        <div className="mt-6 h-screen">
          <PDFViewer style={{ width: '100%', height: '100%' }}>
            <UserStatsPDF stats={stats} />
          </PDFViewer>
        </div>
      )}
    </div>
  );
};

export default UserAccountSummary;