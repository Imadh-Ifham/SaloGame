import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, trend }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-all border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <h3 className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">{value}</h3>
          {trend && (
            <div className="flex items-center mt-2">
              <span 
                className={`
                  text-sm flex items-center
                  ${trend.isPositive 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'}
                `}
              >
                <span className="mr-1">
                  {trend.isPositive ? '↑' : '↓'}
                </span>
                {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-400 ml-2">vs last month</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-full bg-gray-50 dark:bg-gray-700">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard; 