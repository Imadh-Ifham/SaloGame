import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import axiosInstance from '@/axios.config';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface VisitData {
  _id: number | string;
  count: number;
}

type ViewType = 'hourly' | 'weekly';

const VisitsChart = () => {
  const [visitData, setVisitData] = useState<VisitData[]>([]);
  const [viewType, setViewType] = useState<ViewType>('hourly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Check if dark mode is active
  const isDarkMode = () => {
    return document.documentElement.classList.contains('dark');
  };

  useEffect(() => {
    const recordVisit = async () => {
      try {
        await axiosInstance.post('/visits/record');
      } catch (error) {
        console.error('Error recording visit:', error);
      }
    };

    const fetchVisits = async () => {
      try {
        setLoading(true);
        const endpoint = viewType === 'hourly' ? '/visits/hourly' : '/visits/weekly';
        const response = await axiosInstance.get(endpoint);

        if (response.data && response.data.success) {
          const data = viewType === 'hourly' ? response.data.data : response.data.data;
          setVisitData(Array.isArray(data) ? data : []);
        } else {
          setError('Failed to load visit data');
        }
      } catch (error: any) {
        setError(error.message || 'Failed to load visit data');
      } finally {
        setLoading(false);
      }
    };

    recordVisit();
    fetchVisits();
  }, [viewType]);

  const formatLabel = (value: number | string) => {
    if (viewType === 'hourly') {
      const hour = Number(value);
      return `${hour % 12 || 12}${hour < 12 ? 'AM' : 'PM'}`;
    } else {
      const date = new Date(value.toString());
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
  };

  const chartData = {
    labels: visitData.map(d => formatLabel(d._id)),
    datasets: [
      {
        label: viewType === 'hourly' ? 'Hourly Visits' : 'Daily Visits',
        data: visitData.map(d => d.count),
        fill: true,
        borderColor: isDarkMode() ? '#34d399' : '#10b981',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, isDarkMode() ? 'rgba(52, 211, 153, 0.1)' : 'rgba(16, 185, 129, 0.1)');
          gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
          return gradient;
        },
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: isDarkMode() ? '#34d399' : '#10b981',
        pointBorderColor: isDarkMode() ? '#1f2937' : '#ffffff',
        pointHoverRadius: 6,
        pointHoverBackgroundColor: isDarkMode() ? '#34d399' : '#10b981',
        pointHoverBorderColor: isDarkMode() ? '#1f2937' : '#ffffff',
        pointHoverBorderWidth: 2,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDarkMode() ? '#1f2937' : '#ffffff',
        titleColor: isDarkMode() ? '#e5e7eb' : '#374151',
        bodyColor: isDarkMode() ? '#f9fafb' : '#111827',
        borderColor: isDarkMode() ? '#374151' : '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
      }
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
        beginAtZero: true,
      },
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Visit Activity</h3>
        
        {/* View Type Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <span>{viewType === 'hourly' ? 'Last 24 Hours' : 'Last 7 Days'}</span>
            <ChevronDownIcon className="h-4 w-4" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
              <button
                onClick={() => {
                  setViewType('hourly');
                  setIsDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Last 24 Hours
              </button>
              <button
                onClick={() => {
                  setViewType('weekly');
                  setIsDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Last 7 Days
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="h-[300px]">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default VisitsChart;