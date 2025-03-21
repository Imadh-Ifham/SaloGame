// frontend/src/components/SubscriptionGrowthChart.tsx
import React from "react";
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
  const chartData = {
    labels: data.map((item) => item.month),
    datasets: [
      {
        label: "Subscriptions",
        data: data.map((item) => item.count),
        borderColor: "#4F46E5", // Indigo-600
        backgroundColor: "rgba(79, 70, 229, 0.2)", // Indigo-600 with opacity
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          color: "rgba(229, 231, 235, 0.2)", // Gray-200 with opacity
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default SubscriptionGrowthChart;
