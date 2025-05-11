import React, { useMemo, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const MachineStats: React.FC = () => {
  const chartRef = useRef<ChartJS<"bar">>(null);

  // Mock data for machine usage
  const machineData = [
    { name: "Machine A", usage: 87, maintenance: 3 },
    { name: "Machine B", usage: 65, maintenance: 8 },
    { name: "Machine C", usage: 92, maintenance: 2 },
    { name: "Machine D", usage: 78, maintenance: 5 },
    { name: "Machine E", usage: 45, maintenance: 12 },
    { name: "Machine F", usage: 81, maintenance: 4 },
  ];

  // Check if dark mode is active
  const isDarkMode = () => {
    return (
      document.documentElement.classList.contains("dark") ||
      document.querySelector('html[class*="dark"]') !== null
    );
  };

  // Update chart colors when theme changes
  useEffect(() => {
    const updateChartColors = () => {
      const chart = chartRef.current;
      if (chart) {
        const isDark = isDarkMode();

        // Update colors based on theme
        chart.data.datasets[0].backgroundColor = isDark
          ? "rgba(52, 211, 153, 0.8)"
          : "rgba(16, 185, 129, 0.8)";
        chart.data.datasets[1].backgroundColor = isDark
          ? "rgba(239, 68, 68, 0.8)"
          : "rgba(248, 113, 113, 0.8)";

        chart.options.scales!.x!.ticks!.color = isDark ? "#9ca3af" : "#4b5563";
        chart.options.scales!.y!.ticks!.color = isDark ? "#9ca3af" : "#4b5563";
        chart.options.scales!.y!.grid!.color = isDark
          ? "rgba(75, 85, 99, 0.1)"
          : "rgba(229, 231, 235, 1)";
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

  const chartData = useMemo(() => {
    const isDark = isDarkMode();
    return {
      labels: machineData.map((item) => item.name),
      datasets: [
        {
          label: "Usage (%)",
          data: machineData.map((item) => item.usage),
          backgroundColor: isDark
            ? "rgba(52, 211, 153, 0.8)"
            : "rgba(16, 185, 129, 0.8)",
          borderRadius: 4,
          maxBarThickness: 35,
        },
        {
          label: "Maintenance Time (%)",
          data: machineData.map((item) => item.maintenance),
          backgroundColor: isDark
            ? "rgba(239, 68, 68, 0.8)"
            : "rgba(248, 113, 113, 0.8)",
          borderRadius: 4,
          maxBarThickness: 35,
        },
      ],
    };
  }, []);

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: "index",
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: isDarkMode() ? "#9ca3af" : "#4b5563",
        },
      },
      tooltip: {
        backgroundColor: isDarkMode() ? "#1f2937" : "#ffffff",
        titleColor: isDarkMode() ? "#e5e7eb" : "#374151",
        bodyColor: isDarkMode() ? "#f9fafb" : "#111827",
        borderColor: isDarkMode() ? "#374151" : "#e5e7eb",
        borderWidth: 1,
        padding: 12,
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
          color: isDarkMode() ? "#9ca3af" : "#4b5563",
          font: {
            size: 12,
          },
        },
      },
      y: {
        grid: {
          color: isDarkMode()
            ? "rgba(75, 85, 99, 0.1)"
            : "rgba(229, 231, 235, 1)",
        },
        border: {
          display: false,
        },
        ticks: {
          color: isDarkMode() ? "#9ca3af" : "#4b5563",
          font: {
            size: 12,
          },
          callback: (value) => `${value}%`,
        },
        max: 100,
      },
    },
  };

  return (
    <Card className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-gray-900 dark:text-white text-lg font-semibold">
          Machine Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[400px]">
        <Bar ref={chartRef} data={chartData} options={options} />
      </CardContent>
    </Card>
  );
};

export default MachineStats;
