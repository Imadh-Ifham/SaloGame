import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { motion } from 'framer-motion';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ActiveUser {
  date: string;
  activeUsers: string;
}

interface PageView {
  pagePath: string;
  pageViews: string;
}

interface EventCount {
  date: string;
  eventCount: string;
}

interface EventType {
  eventName: string;
  count: string;
}

interface EngagementMetrics {
  userEngagementDuration: string;
  engagementRate: string;
  sessionsPerUser: string;
}

const AnalyticsDashboard: React.FC = () => {
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [pageViews, setPageViews] = useState<PageView[]>([]);
  const [eventCounts, setEventCounts] = useState<EventCount[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [engagement, setEngagement] = useState<EngagementMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const chartRef = useRef<ChartJS<"line">>(null);

  const isDarkMode = () => {
    return document.documentElement.classList.contains('dark');
  };

  // Common chart options
  const commonChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart',
    },
    plugins: {
      legend: {
        display: true,
        labels: {
          color: isDarkMode() ? '#9ca3af' : '#4b5563',
          font: {
            family: "'Poppins', sans-serif",
          }
        },
      },
      tooltip: {
        backgroundColor: isDarkMode() ? '#1f2937' : '#ffffff',
        titleColor: isDarkMode() ? '#e5e7eb' : '#374151',
        bodyColor: isDarkMode() ? '#f9fafb' : '#111827',
        borderColor: isDarkMode() ? '#374151' : '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: isDarkMode() ? '#9ca3af' : '#4b5563',
          font: {
            size: 12,
          },
        },
      },
      y: {
        grid: {
          color: isDarkMode() ? 'rgba(75, 85, 99, 0.1)' : 'rgba(229, 231, 235, 1)',
        },
        border: {
          display: false,
        },
        ticks: {
          color: isDarkMode() ? '#9ca3af' : '#4b5563',
          font: {
            size: 12,
          },
        },
      },
    },
  };

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        const [activeUsersRes, pageViewsRes, engagementRes, eventCountRes, eventTypesRes] = await Promise.all([
          axios.get('/api/analytics/active-users'),
          axios.get('/api/analytics/page-views'),
          axios.get('/api/analytics/user-engagement'),
          axios.get('/api/analytics/event-count'),
          axios.get('/api/analytics/event-types')
        ]);

        setActiveUsers(Array.isArray(activeUsersRes.data) ? activeUsersRes.data : []);
        setPageViews(Array.isArray(pageViewsRes.data) ? pageViewsRes.data : []);
        setEngagement(engagementRes.data);
        setEventCounts(eventCountRes.data.dailyData || []);
        setEventTypes(Array.isArray(eventTypesRes.data) ? eventTypesRes.data : []);
        setError(null);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h1 
        className="text-3xl font-bold mb-8 text-gray-900 dark:text-white"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Analytics Dashboard
      </motion.h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Active Users Chart */}
          <motion.div
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
            variants={itemVariants}
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Active Users (Last 7 Days)
            </h2>
            <div className="h-80">
              <Line
                data={{
                  labels: activeUsers.map(item => formatDate(item.date)),
                  datasets: [{
                    label: 'Active Users',
                    data: activeUsers.map(item => parseInt(item.activeUsers)),
                    borderColor: isDarkMode() ? '#34d399' : '#10b981',
                    backgroundColor: isDarkMode() ? 'rgba(52, 211, 153, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true,
                  }]
                }}
                options={commonChartOptions}
              />
            </div>
          </motion.div>

          {/* Page Views Chart */}
          <motion.div
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
            variants={itemVariants}
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Top Pages
            </h2>
            <div className="h-80">
              <Line
                data={{
                  labels: pageViews.map(item => item.pagePath),
                  datasets: [{
                    label: 'Page Views',
                    data: pageViews.map(item => parseInt(item.pageViews)),
                    borderColor: isDarkMode() ? '#8b5cf6' : '#6d28d9',
                    backgroundColor: isDarkMode() ? 'rgba(139, 92, 246, 0.1)' : 'rgba(109, 40, 217, 0.1)',
                    tension: 0.4,
                    fill: true,
                  }]
                }}
                options={commonChartOptions}
              />
            </div>
          </motion.div>

          {/* Event Counts Chart */}
          <motion.div
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
            variants={itemVariants}
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Event Counts (Last 7 Days)
            </h2>
            <div className="h-80">
              <Line
                data={{
                  labels: eventCounts.map(item => formatDate(item.date)),
                  datasets: [{
                    label: 'Events',
                    data: eventCounts.map(item => parseInt(item.eventCount)),
                    borderColor: isDarkMode() ? '#ec4899' : '#db2777',
                    backgroundColor: isDarkMode() ? 'rgba(236, 72, 153, 0.1)' : 'rgba(219, 39, 119, 0.1)',
                    tension: 0.4,
                    fill: true,
                  }]
                }}
                options={commonChartOptions}
              />
            </div>
          </motion.div>

          {/* Event Types Chart */}
          <motion.div
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
            variants={itemVariants}
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Event Types Distribution
            </h2>
            <div className="h-80">
              <Line
                data={{
                  labels: eventTypes.map(item => item.eventName),
                  datasets: [{
                    label: 'Event Count',
                    data: eventTypes.map(item => parseInt(item.count)),
                    borderColor: isDarkMode() ? '#f59e0b' : '#d97706',
                    backgroundColor: isDarkMode() ? 'rgba(245, 158, 11, 0.1)' : 'rgba(217, 119, 6, 0.1)',
                    tension: 0.4,
                    fill: true,
                  }]
                }}
                options={commonChartOptions}
              />
            </div>
          </motion.div>

          {/* Engagement Metrics */}
          <motion.div
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg lg:col-span-2"
            variants={itemVariants}
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              User Engagement Metrics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200">
                  Engagement Duration
                </h3>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-300 mt-2">
                  {engagement?.userEngagementDuration || '0'}s
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-green-800 dark:text-green-200">
                  Engagement Rate
                </h3>
                <p className="text-3xl font-bold text-green-600 dark:text-green-300 mt-2">
                  {engagement ? (parseFloat(engagement.engagementRate) * 100).toFixed(1) + '%' : '0%'}
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-purple-800 dark:text-purple-200">
                  Sessions Per User
                </h3>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-300 mt-2">
                  {engagement?.sessionsPerUser || '0'}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;