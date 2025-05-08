import React, { useEffect, useState } from 'react';

interface TopCountry {
  dimension: string;
  metrics: number[];
}

interface RealtimeData {
  currentActiveUsers: number;
  topCountries: TopCountry[];
}

const RealtimeUsers: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [realtimeData, setRealtimeData] = useState<RealtimeData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/analytics/active-users-realtime');
        const result = await response.json();
        
        if (result.success) {
          setRealtimeData({
            currentActiveUsers: result.currentActiveUsers,
            topCountries: result.topCountries
          });
        } else {
          setError('Failed to load realtime data');
        }
      } catch (err) {
        setError('Error connecting to analytics service');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh every minute
    const interval = setInterval(fetchData, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading realtime data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="bg-gray-900 rounded-lg p-4 text-white h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium">ACTIVE USERS IN LAST 30 MINUTES</h2>
        <div className="flex items-center">
          <div className="bg-green-500 rounded-full p-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        </div>
      </div>

      <div className="text-center mb-8">
        <h3 className="text-5xl font-bold">{realtimeData?.currentActiveUsers || 0}</h3>
      </div>

      <div className="mb-8">
        <h3 className="text-gray-400 mb-2">ACTIVE USERS PER MINUTE</h3>
        {/* This would be a minute-by-minute chart in a real implementation */}
      </div>

      <div>
        <div className="flex justify-between mb-2">
          <h3 className="text-gray-400">TOP COUNTRIES</h3>
          <h3 className="text-gray-400">ACTIVE USERS</h3>
        </div>
        
        {realtimeData?.topCountries && realtimeData.topCountries.length > 0 ? (
          realtimeData.topCountries.map((country, index) => (
            <div key={index} className="flex justify-between py-1">
              <span>{country.dimension}</span>
              <span>{country.metrics[0]}</span>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">No data available</div>
        )}
      </div>

      <div className="mt-6 text-right">
        <a href="/analytics/realtime" className="text-blue-400 flex items-center justify-end">
          View realtime
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </a>
      </div>
    </div>
  );
};

export default RealtimeUsers;