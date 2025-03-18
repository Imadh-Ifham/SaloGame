import { useMemo, useEffect, useRef } from 'react';
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
import { Line } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface RevenueData {
  date: string;
  revenue: number;
}

interface RevenueChartProps {
  data: RevenueData[];
  isLoading?: boolean;
  error?: string | null;
}

export function RevenueChart({ data, isLoading, error }: RevenueChartProps) {
  const chartRef = useRef<ChartJS<"line">>(null);

  // Check if the document has a dark mode class or attribute
  const isDarkMode = () => {
    return document.documentElement.classList.contains('dark') || 
           document.querySelector('html[class*="dark"]') !== null;
  };

  // Update chart colors when theme changes
  useEffect(() => {
    const updateChartColors = () => {
      const chart = chartRef.current;
      if (chart) {
        const isDark = isDarkMode();
        chart.data.datasets[0].borderColor = isDark ? '#34d399' : '#10b981'; // Emerald-400 : Emerald-500 (gamer green)
        chart.data.datasets[0].backgroundColor = isDark ? 'rgba(52, 211, 153, 0.1)' : 'rgba(16, 185, 129, 0.1)'; // Emerald with opacity
        chart.options.scales!.x!.ticks!.color = isDark ? '#9ca3af' : '#4b5563'; // gray-400 : gray-600
        chart.options.scales!.y!.ticks!.color = isDark ? '#9ca3af' : '#4b5563'; // gray-400 : gray-600
        chart.options.scales!.y!.grid!.color = isDark ? 'rgba(75, 85, 99, 0.1)' : 'rgba(229, 231, 235, 1)'; // gray-600 at 10% : gray-200
        chart.update();
      }
    };

    // Create a MutationObserver to watch for class changes on html element
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          updateChartColors();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    
    // Initial update
    updateChartColors();

    return () => {
      observer.disconnect();
    };
  }, []);

  const chartData = useMemo(() => {
    const isDark = isDarkMode();
    return {
      labels: data.map((item) => item.date),
      datasets: [
        {
          label: 'Revenue',
          data: data.map((item) => item.revenue),
          borderColor: isDark ? '#34d399' : '#10b981', // Emerald-400 : Emerald-500 (gamer green)
          backgroundColor: isDark ? 'rgba(52, 211, 153, 0.1)' : 'rgba(16, 185, 129, 0.1)', // Emerald with opacity
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: isDark ? '#34d399' : '#10b981', // Emerald-400 : Emerald-500 (gamer green)
          pointBorderColor: isDark ? '#1f2937' : '#ffffff', // gray-800 : white
          pointHoverRadius: 6,
          pointHoverBackgroundColor: isDark ? '#34d399' : '#10b981', // Emerald-400 : Emerald-500 (gamer green)
          pointHoverBorderColor: isDark ? '#1f2937' : '#ffffff', // gray-800 : white
          pointHoverBorderWidth: 2,
        },
      ],
    };
  }, [data]);

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDarkMode() ? '#1f2937' : '#ffffff', // gray-800 : white
        titleColor: isDarkMode() ? '#e5e7eb' : '#374151', // gray-200 : gray-700
        bodyColor: isDarkMode() ? '#f9fafb' : '#111827', // gray-50 : gray-900
        borderColor: isDarkMode() ? '#374151' : '#e5e7eb', // gray-700 : gray-200
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => {
            return `$${context.parsed.y.toLocaleString()}`;
          },
        },
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
          color: isDarkMode() ? '#9ca3af' : '#4b5563', // gray-400 : gray-600
          font: {
            size: 12,
          },
        },
      },
      y: {
        grid: {
          color: isDarkMode() ? 'rgba(75, 85, 99, 0.1)' : 'rgba(229, 231, 235, 1)', // gray-600 at 10% : gray-200
        },
        border: {
          display: false,
        },
        ticks: {
          color: isDarkMode() ? '#9ca3af' : '#4b5563', // gray-400 : gray-600
          font: {
            size: 12,
          },
          callback: (value) => `$${value.toLocaleString()}`,
        },
      },
    },
  };

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-gray-900 dark:text-white text-lg font-semibold">Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <div className="animate-pulse flex space-x-4">
            <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-gray-900 dark:text-white text-lg font-semibold">Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <p className="text-red-600 dark:text-red-400">Error loading revenue data: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-gray-900 dark:text-white text-lg font-semibold">Revenue Trend</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px]">
        <Line ref={chartRef} data={chartData} options={options} />
      </CardContent>
    </Card>
  );
} 