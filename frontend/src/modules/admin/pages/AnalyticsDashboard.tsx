import React, { useState, useEffect } from "react";
import { ArrowUpIcon, MagnifyingGlassIcon, ArrowDownIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { FirebaseAnalytics } from "@/config/firebase";
import axiosInstance from "@/axios.config";

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
  const [activeUsers, setActiveUsers] = useState<number>(0);
  const [userActivity, setUserActivity] = useState<UserActivityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Track page view when dashboard loads
    FirebaseAnalytics.trackPageView('AnalyticsDashboard', {
      userType: 'admin'
    });

    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Track user activity
      FirebaseAnalytics.trackUserActivity({
        activityType: 'dashboard_view',
        page: 'analytics'
      });

      // Fetch events data
      const eventsRes = await axiosInstance.get('/analytics/events');
      setEventsData(eventsRes.data.data);

      // Track event interaction for each event
      eventsRes.data.data.forEach((event: EventData) => {
        FirebaseAnalytics.trackEventInteraction({
          eventName: event.name,
          interactionType: 'view',
          count: event.count
        });
      });

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
                      event.countChange && event.countChange > 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {event.countChange && event.countChange > 0 ? (
                        <ArrowUpIcon className="h-4 w-4 mr-1" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4 mr-1" />
                      )}
                      {Math.abs(event.countChange || 0)}%
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
                        checked={isKeyEvent[event.name]}
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