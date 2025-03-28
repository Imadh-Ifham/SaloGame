import React, { useRef, useEffect, useMemo } from "react";
import { Line } from "react-chartjs-2";
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

interface SubscriptionGrowthChartProps {
  data: { month: string; count: number }[];
}

const SubscriptionGrowthChart: React.FC<SubscriptionGrowthChartProps> = ({
  data,
}) => {
  const chartRef = useRef<ChartJS<"line">>(null);

  // Format month number to name
  const formatMonthName = (monthNum: string) => {
    const monthIndex = parseInt(monthNum, 10) - 1;
    if (isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) return monthNum;
    return new Date(2023, monthIndex).toLocaleString("default", {
      month: "short",
    });
  };

  // Check if dark mode is active
  const isDarkMode = () => {
    return (
      document.documentElement.classList.contains("dark") ||
      document.querySelector('html[class*="dark"]') !== null
    );
  };

  // Format the number to be displayed on y-axis
  const formatYAxisLabel = (value: number) => {
    if (value === 0) return "0";
    if (value < 10) return value.toString();
    return value.toString();
  };

  // Update chart colors when theme changes
  useEffect(() => {
    const updateChartColors = () => {
      const chart = chartRef.current;
      if (chart) {
        const isDark = isDarkMode();

        chart.data.datasets[0].borderColor = isDark ? "#6EE5A8" : "#10b981"; // gamer-green-light : Emerald-500
        chart.data.datasets[0].backgroundColor = isDark
          ? "rgba(110, 229, 168, 0.1)"
          : "rgba(16, 185, 129, 0.1)"; // gamer-green with opacity
        chart.options.scales!.x!.ticks!.color = isDark ? "#9ca3af" : "#4b5563"; // gray-400 : gray-600
        chart.options.scales!.y!.ticks!.color = isDark ? "#9ca3af" : "#4b5563"; // gray-400 : gray-600
        chart.options.scales!.y!.grid!.color = isDark
          ? "rgba(75, 85, 99, 0.1)"
          : "rgba(229, 231, 235, 1)"; // gray-600 at 10% : gray-200
        chart.update();
      }
    };

    // Create a MutationObserver to watch for class changes on html element
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
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

  // Prepare chart data with updated styling
  const chartData = useMemo(() => {
    const isDark = isDarkMode();

    return {
      labels: data.map((item) => formatMonthName(item.month.toString())),
      datasets: [
        {
          label: "Subscriptions",
          data: data.map((item) => item.count),
          borderColor: isDark ? "#6EE5A8" : "#10b981", // gamer-green-light : Emerald-500
          backgroundColor: isDark
            ? "rgba(110, 229, 168, 0.1)"
            : "rgba(16, 185, 129, 0.1)", // gamer-green with opacity
          tension: 0.4,
          fill: true,
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: isDark ? "#6EE5A8" : "#10b981", // gamer-green-light : Emerald-500
          pointBorderColor: isDark ? "#1f2937" : "#ffffff", // gray-800 : white
          pointHoverRadius: 6,
          pointHoverBackgroundColor: isDark ? "#6EE5A8" : "#10b981", // gamer-green-light : Emerald-500
          pointHoverBorderColor: isDark ? "#1f2937" : "#ffffff", // gray-800 : white
          pointHoverBorderWidth: 2,
        },
      ],
    };
  }, [data]);

  // Chart options with improved styling
  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: "index",
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDarkMode() ? "#1f2937" : "#ffffff", // gray-800 : white
        titleColor: isDarkMode() ? "#e5e7eb" : "#374151", // gray-200 : gray-700
        bodyColor: isDarkMode() ? "#f9fafb" : "#111827", // gray-50 : gray-900
        borderColor: isDarkMode() ? "#374151" : "#e5e7eb", // gray-700 : gray-200
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => {
            return `${context.parsed.y} Subscriptions`;
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
          color: isDarkMode() ? "#9ca3af" : "#4b5563", // gray-400 : gray-600
          font: {
            size: 12,
          },
        },
      },
      y: {
        grid: {
          color: isDarkMode()
            ? "rgba(75, 85, 99, 0.1)"
            : "rgba(229, 231, 235, 1)", // gray-600 at 10% : gray-200
        },
        border: {
          display: false,
        },
        ticks: {
          color: isDarkMode() ? "#9ca3af" : "#4b5563", // gray-400 : gray-600
          font: {
            size: 12,
          },
          callback: (value) => formatYAxisLabel(value as number),
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div style={{ height: "400px" }}>
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
};

export default SubscriptionGrowthChart;
