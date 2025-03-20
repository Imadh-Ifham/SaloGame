// Language: TypeScript (React)
import React, { useState, useEffect } from "react";
import axiosInstance from "../../../axios.config";
import { Bar, Pie, Line } from "react-chartjs-2";
import "chart.js/auto";
import {
  CurrencyDollarIcon,
  TicketIcon,
  UserGroupIcon,
  CubeIcon,
  UserCircleIcon,
  ChartBarIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/outline";

interface Booking {
  id: string;
  totalPrice: number;
  packageId: string;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
}

interface Package {
  id: string;
  name: string;
  price: number;
}

interface Offer {
  id: string;
  title: string;
  usageCount: number;
}

interface Membership {
  id: string;
  status: string;
  userId: string;
}

const OverviewPage: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        const [offersRes, bookingsRes, gamesRes, membershipsRes, packagesRes] =
          await Promise.all([
            axiosInstance.get("/offers"),
            axiosInstance.get("/bookings"),
            axiosInstance.get("/games"),
            axiosInstance.get("/memberships"),
            axiosInstance.get("/packages"),
          ]);

        setOffers(offersRes.data.data || offersRes.data);
        setBookings(bookingsRes.data.data || bookingsRes.data);
        setGames(gamesRes.data.data || gamesRes.data);
        setMemberships(membershipsRes.data.data || membershipsRes.data);
        setPackages(packagesRes.data.data || packagesRes.data);
      } catch (error) {
        console.error("Error fetching overview data", error);
      }
    };

    fetchOverviewData();
  }, []);

  // Generate date labels for last 7 days
  const generateDateLabels = () => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - 6 + i);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    });
  };

  // Calculate revenue trend data
  const calculateRevenueTrend = () => {
    return generateDateLabels().map((date) => {
      return bookings.reduce((acc, booking) => {
        const bookingDate = new Date(booking.createdAt).toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "numeric",
          }
        );
        return bookingDate === date ? acc + booking.totalPrice : acc;
      }, 0);
    });
  };

  // Chart data configurations
  const offerChartData = {
    labels: offers.map((offer) => offer.title),
    datasets: [
      {
        data: offers.map((offer) => offer.usageCount),
        backgroundColor: [
          "#6366F1",
          "#10B981",
          "#3B82F6",
          "#F59E0B",
          "#EF4444",
        ],
        hoverOffset: 4,
      },
    ],
  };

  const revenueTrendData = {
    labels: generateDateLabels(),
    datasets: [
      {
        label: "Daily Revenue",
        data: calculateRevenueTrend(),
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const packagePopularityData = {
    labels: packages.map((pkg) => pkg.name),
    datasets: [
      {
        label: "Bookings",
        data: packages.map(
          (pkg) =>
            bookings.filter((booking) => booking.packageId === pkg.id).length
        ),
        backgroundColor: "#6366F1",
        borderColor: "#4F46E5",
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  };

  // Metric card component
  const MetricCard = ({
    icon: Icon,
    title,
    value,
    trend,
  }: {
    icon: React.ElementType;
    title: string;
    value: number | string;
    trend?: number;
  }) => (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-indigo-50 dark:bg-gray-700 rounded-lg">
          <Icon className="w-8 h-8 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
            {value}
          </p>
          {trend !== undefined && (
            <span
              className={`text-sm ${
                trend >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% vs last week
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8 bg-gray-50 dark:bg-background-dark min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
        Dashboard Overview
      </h1>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          icon={ComputerDesktopIcon}
          title="Active Games"
          value={games.length}
          trend={2.5}
        />
        <MetricCard
          icon={TicketIcon}
          title="Total Bookings"
          value={bookings.length}
          trend={-1.2}
        />
        <MetricCard
          icon={CurrencyDollarIcon}
          title="Total Revenue"
          value={`$${bookings
            .reduce((sum, b) => sum + b.totalPrice, 0)
            .toLocaleString()}`}
          trend={4.8}
        />
        <MetricCard
          icon={UserGroupIcon}
          title="Active Members"
          value={memberships.filter((m) => m.status === "active").length}
          trend={0.7}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Trend */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Revenue Trend (Last 7 Days)
          </h3>
          <Line
            data={revenueTrendData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "top" },
                tooltip: {
                  callbacks: {
                    label: (context) => ` $${context.parsed.y.toFixed(2)}`,
                  },
                },
              },
            }}
          />
        </div>

        {/* Package Popularity */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Package Popularity
          </h3>
          <Bar
            data={packagePopularityData}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                y: { beginAtZero: true, ticks: { precision: 0 } },
              },
            }}
          />
        </div>
      </div>

      {/* Lower Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Offer Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Offer Distribution
          </h3>
          <div className="relative h-80">
            <Pie
              data={offerChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "right" },
                  tooltip: {
                    callbacks: {
                      label: (context) =>
                        ` ${context.label}: ${context.raw} uses`,
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Recent Bookings
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b">
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Package</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 5).map((booking) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <UserCircleIcon className="w-5 h-5 text-gray-400" />
                        {booking.user?.name || "Guest"}
                      </div>
                    </td>
                    <td className="py-3">
                      {packages.find((p) => p.id === booking.packageId)?.name ||
                        "N/A"}
                    </td>
                    <td className="py-3">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-right font-medium">
                      ${booking.totalPrice.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;
