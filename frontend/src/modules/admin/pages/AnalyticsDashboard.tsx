import React, { useState, useEffect } from "react";
import { ArrowUpIcon, MagnifyingGlassIcon, ArrowDownIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { FirebaseAnalytics } from "@/config/firebase";
import axiosInstance from "@/axios.config";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface EventData {
  name: string;
  count: number;
  users: number;
  countChange?: number;
  userChange?: number;
}

interface UserActivityData {
  thirtyDays: { data: any[]; total: string };
  sevenDays: { data: any[]; total: string };
  oneDay: { data: any[]; total: string };
}

const AnalyticsDashboard: React.FC = () => {
  const [isKeyEvent, setIsKeyEvent] = useState<Record<string, boolean>>({});
  const [eventsData, setEventsData] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityData, setActivityData] = useState<any>(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch analytics data
      const [eventsRes, activityRes] = await Promise.all([
        axiosInstance.get('/analytics/events'),
        FirebaseAnalytics.getUserActivityData()
      ]);

      setEventsData(eventsRes.data.data);
      setActivityData(activityRes);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setLoading(false);
    }
  };

  const handleKeyEventToggle = (eventName: string) => {
    setIsKeyEvent(prev => {
      const newState = {
        ...prev,
        [eventName]: !prev[eventName]
      };

      // Track event marking
      FirebaseAnalytics.trackEventInteraction({
        eventName,
        interactionType: 'key_event_toggle',
        count: 1
      });

      return newState;
    });
  };

  const chartData = {
    labels: activityData?.thirtyDays?.data.map((item: any) => 
      new Date(item.timestamp).toLocaleDateString()
    ) || [],
    datasets: [
      {
        label: '30 Days',
        data: activityData?.thirtyDays?.data.map((item: any) => item.count) || [],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      },
      {
        label: '7 Days',
        data: activityData?.sevenDays?.data.map((item: any) => item.count) || [],
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4
      },
      {
        label: '24 Hours',
        data: activityData?.oneDay?.data.map((item: any) => item.count) || [],
        borderColor: '#EC4899',
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(75, 85, 99, 0.1)'
        },
        ticks: {
          color: '#9CA3AF'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#9CA3AF'
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#9CA3AF'
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Activity Chart */}
      <div className="bg-gray-900 rounded-lg overflow-hidden shadow p-4">
        <h2 className="text-lg font-medium text-white mb-4">User Activity</h2>
        <div className="h-96">
          <Line data={chartData} options={chartOptions} />
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-sm text-gray-400">30 Days Active</h3>
            <p className="text-2xl text-white">{activityData?.thirtyDays?.total || 0}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-sm text-gray-400">7 Days Active</h3>
            <p className="text-2xl text-white">{activityData?.sevenDays?.total || 0}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-sm text-gray-400">24 Hours Active</h3>
            <p className="text-2xl text-white">{activityData?.oneDay?.total || 0}</p>
          </div>
        </div>
      </div>

      {/* Events Table Section */}
      <div className="bg-gray-900 rounded-lg overflow-hidden shadow">
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <h2 className="text-lg font-medium text-white">Event Analytics</h2>
          <div className="flex space-x-2">
            <button 
              onClick={() => {
                FirebaseAnalytics.trackUserActivity({
                  activityType: 'refresh_analytics',
                  page: 'analytics'
                });
                fetchData();
              }}
              className="text-gray-400 hover:text-white"
            >
              <ArrowPathIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-900">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Event Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Total Count
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Change %
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Unique Users
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Key Event
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-800">
              {eventsData.map((event) => (
                <tr key={event.name} className="hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {event.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {event.count.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`flex items-center text-sm ${
                      (event.countChange === undefined || event.countChange === 0) ? 'text-gray-300' :
                      event.countChange > 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {event.countChange !== undefined && (
                        event.countChange > 0 ? (
                          <ArrowUpIcon className="h-4 w-4 mr-1" />
                        ) : event.countChange < 0 ? (
                          <ArrowDownIcon className="h-4 w-4 mr-1" />
                        ) : null
                      )}
                      {event.countChange !== undefined ? `${Math.abs(event.countChange)}%` : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {event.users.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={!!isKeyEvent[event.name]}
                        onChange={() => handleKeyEventToggle(event.name)}
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </td>
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