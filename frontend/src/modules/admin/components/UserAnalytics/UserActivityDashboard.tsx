import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ActivityData {
  dimension: string | null;
  metrics: number[];
}

interface ActivityResponse {
  thirtyDays: {
    data: ActivityData[];
    total: number;
  };
  sevenDays: {
    data: ActivityData[];
    total: number;
  };
  oneDay: {
    data: ActivityData[];
    total: number;
  };
}

const UserActivityDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activityData, setActivityData] = useState<ActivityResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/analytics/user-activity');
        const result = await response.json();
        
        if (result.success) {
          setActivityData(result.data);
        } else {
          setError('Failed to load activity data');
        }
      } catch (err) {
        setError('Error connecting to analytics service');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Transform data for chart
  const prepareChartData = () => {
    if (!activityData) return [];
    
    // Get all dates from 30-day data
    const allDates = activityData.thirtyDays.data.map(item => item.dimension);
    
    // Create a map for easier lookup
    const thirtyDayMap = new Map(
      activityData.thirtyDays.data.map(item => [item.dimension, item.metrics[0]])
    );
    
    const sevenDayMap = new Map(
      activityData.sevenDays.data.map(item => [item.dimension, item.metrics[0]])
    );
    
    const oneDayMap = new Map(
      activityData.oneDay.data.map(item => [item.dimension, item.metrics[0]])
    );
    
    // Create chart data with all three series
    return allDates.map(date => {
      const formattedDate = date?.split('-').slice(1).join('/') || '';
      return {
        date: formattedDate,
        '30 days': thirtyDayMap.get(date!) || 0,
        '7 days': sevenDayMap.get(date!) || 0,
        '1 day': oneDayMap.get(date!) || 0
      };
    });
  };

  if (loading) return <div>Loading activity data...</div>;
  if (error) return <div>Error: {error}</div>;

  const chartData = prepareChartData();

  return (
    <div className="bg-gray-900 rounded-lg p-4 text-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">User activity over time</h2>
        <div className="flex items-center">
          <div className="bg-green-500 rounded-full p-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="date" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip contentStyle={{ backgroundColor: '#333', borderColor: '#555' }} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="30 days" 
              stroke="#3B82F6" 
              strokeWidth={2} 
              dot={{ r: 1 }} 
              activeDot={{ r: 6, strokeWidth: 2 }} 
            />
            <Line 
              type="monotone" 
              dataKey="7 days" 
              stroke="#8B5CF6" 
              strokeWidth={2} 
              dot={{ r: 1 }} 
              activeDot={{ r: 6, strokeWidth: 2 }} 
            />
            <Line 
              type="monotone" 
              dataKey="1 day" 
              stroke="#EC4899" 
              strokeWidth={2} 
              dot={{ r: 1 }} 
              activeDot={{ r: 6, strokeWidth: 2 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="flex flex-col">
          <span className="text-blue-400 font-medium">30 DAYS</span>
          <span className="text-2xl">{activityData?.thirtyDays.total || 0}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-purple-400 font-medium">7 DAYS</span>
          <span className="text-2xl">{activityData?.sevenDays.total || 0}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-pink-400 font-medium">1 DAY</span>
          <span className="text-2xl">{activityData?.oneDay.total || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default UserActivityDashboard;