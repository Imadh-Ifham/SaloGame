import React, { useEffect, useState } from 'react';

interface EventData {
  eventName: string;
  count: number;
  countChange: number;
  users: number;
  userChange: number;
}

const EventsTable: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [eventsData, setEventsData] = useState<EventData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/analytics/events');
        const result = await response.json();
        
        if (result.success) {
          setEventsData(result.data);
        } else {
          setError('Failed to load events data');
        }
      } catch (err) {
        setError('Error connecting to analytics service');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh every hour
    const interval = setInterval(fetchData, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading events data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="bg-gray-900 rounded-lg p-4 text-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Existing events</h2>
        <div className="flex space-x-3">
          <button className="bg-blue-500 px-4 py-2 rounded">Modify event</button>
          <button className="bg-blue-500 px-4 py-2 rounded">Create event</button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="py-2 text-left">Event name</th>
              <th className="py-2 text-left">Count</th>
              <th className="py-2 text-left">% change</th>
              <th className="py-2 text-left">Users</th>
              <th className="py-2 text-left">% change</th>
              <th className="py-2 text-left">Mark as key event</th>
            </tr>
          </thead>
          <tbody>
            {eventsData.map((event, index) => (
              <tr key={index} className="border-b border-gray-800">
                <td className="py-3">{event.eventName}</td>
                <td className="py-3">{event.count.toLocaleString()}</td>
                <td className="py-3">
                  <div className="flex items-center">
                    {event.countChange > 0 ? (
                      <svg className="w-4 h-4 text-green-500 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12 7a1 1 0 01-1 1H9a1 1 0 01-1-1V6a1 1 0 011-1h2a1 1 0 011 1v1zm-6 6a1 1 0 001 1h2a1 1 0 001-1v-1a1 1 0 00-1-1H7a1 1 0 00-1 1v1zm8 0a1 1 0 001 1h2a1 1 0 001-1v-1a1 1 0 00-1-1h-2a1 1 0 00-1 1v1z" clipRule="evenodd" />
                      </svg>
                    ) : event.countChange < 0 ? (
                      <svg className="w-4 h-4 text-red-500 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12 13a1 1 0 01-1 1H9a1 1 0 01-1-1v-1a1 1 0 011-1h2a1 1 0 011 1v1zm-6-6a1 1 0 001 1h2a1 1 0 001-1V6a1 1 0 00-1-1H7a1 1 0 00-1 1v1zm8 0a1 1 0 001 1h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1z" clipRule="evenodd" />
                      </svg>
                    ) : null}
                    <span className={event.countChange > 0 ? 'text-green-500' : event.countChange < 0 ? 'text-red-500' : ''}>
                      {Math.abs(event.countChange).toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="py-3">{event.users}</td>
                <td className="py-3">
                  <div className="flex items-center">
                    {event.userChange > 0 ? (
                      <svg className="w-4 h-4 text-green-500 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12 7a1 1 0 01-1 1H9a1 1 0 01-1-1V6a1 1 0 011-1h2a1 1 0 011 1v1zm-6 6a1 1 0 001 1h2a1 1 0 001-1v-1a1 1 0 00-1-1H7a1 1 0 00-1 1v1zm8 0a1 1 0 001 1h2a1 1 0 001-1v-1a1 1 0 00-1-1h-2a1 1 0 00-1 1v1z" clipRule="evenodd" />
                      </svg>
                    ) : event.userChange < 0 ? (
                      <svg className="w-4 h-4 text-red-500 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12 13a1 1 0 01-1 1H9a1 1 0 01-1-1v-1a1 1 0 011-1h2a1 1 0 011 1v1zm-6-6a1 1 0 001 1h2a1 1 0 001-1V6a1 1 0 00-1-1H7a1 1 0 00-1 1v1zm8 0a1 1 0 001 1h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1z" clipRule="evenodd" />
                      </svg>
                    ) : null}
                    <span className={event.userChange > 0 ? 'text-green-500' : event.userChange < 0 ? 'text-red-500' : ''}>
                      {Math.abs(event.userChange).toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="py-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EventsTable;