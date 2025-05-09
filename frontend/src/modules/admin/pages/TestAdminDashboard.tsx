import { useState, useEffect } from "react";
import {
  FiUsers,
  FiDollarSign,
  FiRefreshCw,
  FiAlertCircle,
} from "react-icons/fi";
import { FiDownload, FiEye } from "react-icons/fi";
import { toast } from "react-hot-toast";
import axiosInstance from "@/axios.config";
import ReportPreviewModal from "../components/AdminMembership-page/ReportPreviewModal";
import SubscriptionGrowthChart from "../components/AdminMembership-page/SubscriptionGrowthChart";
import RecentActivityFeed from "../components/AdminMembership-page/RecentActivityFeed";
import MembershipPlansTable from "../components/AdminMembership-page/MembershipPlansTable";
import UserSubscriptionsTable from "../components/AdminMembership-page/UserSubscriptionsTable";
import InvoiceManagementTable from "../components/AdminMembership-page/InvoiceManagementTable";
import FailedRenewalsTable from "../components/AdminMembership-page/FailedRenewalsTable";

export default function AdminMembershipPage() {
  const [stats, setStats] = useState({
    totalActiveMembers: 0,
    totalRevenue: 0,
    autoRenewalUsers: 0,
    failedPayments: 0,
  });
  const [growthData, setGrowthData] = useState<
    { month: string; count: number }[]
  >([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportPeriod, setReportPeriod] = useState("30days");
  const [showReportPreview, setShowReportPreview] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [selectedReportSections, setSelectedReportSections] = useState<
    string[]
  >(["subscription-summary"]);
  const [isExporting, setIsExporting] = useState(false);
  const reportSections = [
    {
      id: "subscription-summary",
      title: "Subscription Summary",
      description:
        "A complete overview of subscription stats, revenue, and growth metrics",
    },

    {
      id: "revenue-breakdown",
      title: "Revenue Breakdown",
      description:
        "Detailed revenue analysis by plan type, payment method, and time period",
    },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [statsResponse, growthResponse, activitiesResponse] =
          await Promise.all([
            axiosInstance.get("/subscriptions/stats"),
            axiosInstance.get("/subscriptions/growth"),
            axiosInstance.get("/subscriptions/recentActivities"),
          ]);
        setStats(statsResponse.data);
        setGrowthData(growthResponse.data.data);
        setRecentActivities(activitiesResponse.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Format currency
  const formatCurrency = (amount: number): string => {
    return `LKR ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setReportPeriod(e.target.value);
  };

  const toggleReportSection = (section: string) => {
    setSelectedReportSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const getPeriodLabel = () => {
    switch (reportPeriod) {
      case "7days":
        return "Last 7 Days";
      case "30days":
        return "Last 30 Days";
      case "90days":
        return "Last 3 Months";
      case "180days":
        return "Last 6 Months";
      case "1year":
        return "Last Year";
      default:
        return "Last 30 Days";
    }
  };

  const generateReportPreview = async () => {
    try {
      // Show loading toast
      toast.loading("Generating report preview...");

      // Make API call to get report data
      const response = await axiosInstance.get(
        `/subscriptions/report?period=${reportPeriod}`
      );

      // Set the report data
      setReportData({
        ...response.data,
        growthData: growthData, // Use existing growthData from state
        recentActivities: recentActivities, // Use existing activities from state
        totalActiveMembers: stats.totalActiveMembers,
        totalRevenue: stats.totalRevenue,
        autoRenewalUsers: stats.autoRenewalUsers,
        failedPayments: stats.failedPayments,
        // Mock data for sections that might not be in the API response
        averageSubscriptionValue: stats.totalRevenue / stats.totalActiveMembers,
        growthRate: 8.3,
        renewalRate: 67.8,
        churnRate: 12.4,
        revenueGrowth: 8.5,
        planRevenue: [
          {
            name: "Basic",
            subscribers: Math.floor(stats.totalActiveMembers * 0.5),
            price: 1000,
            totalRevenue: Math.floor(stats.totalRevenue * 0.3),
            percentage: 30,
          },
          {
            name: "Standard",
            subscribers: Math.floor(stats.totalActiveMembers * 0.3),
            price: 2000,
            totalRevenue: Math.floor(stats.totalRevenue * 0.4),
            percentage: 40,
          },
          {
            name: "Premium",
            subscribers: Math.floor(stats.totalActiveMembers * 0.2),
            price: 3000,
            totalRevenue: Math.floor(stats.totalRevenue * 0.3),
            percentage: 30,
          },
        ],
      });

      // Show the preview modal
      setShowReportPreview(true);

      // Dismiss loading toast
      toast.dismiss();
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report");
    }
  };

  const exportReport = async () => {
    try {
      setIsExporting(true);
      toast.loading("Generating report...");

      // Ensure at least one section is selected
      if (selectedReportSections.length === 0) {
        toast.dismiss();
        toast.error("Please select at least one report section");
        return;
      }

      const response = await axiosInstance.get(
        `/subscriptions/report/download?period=${reportPeriod}&sections=${selectedReportSections.join(
          ","
        )}`,
        { responseType: "blob" }
      );

      // Create download link
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `membership-report-${reportPeriod}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.dismiss();
      toast.success("Report exported successfully!");
    } catch (error: any) {
      toast.dismiss();
      console.error("Error exporting report:", error);

      // If the error response is a blob, read it to get the actual error message
      if (error.response?.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorData = JSON.parse(reader.result as string);

            // Check for the specific PDF pagination error
            if (
              errorData.error &&
              errorData.error.includes("switchToPage(0) out of bounds")
            ) {
              toast.error(
                "PDF generation failed: The report engine has a page indexing issue. Please contact the development team with error code: PDFKit-001."
              );
              console.error("PDF pagination error:", errorData.error);
            } else {
              toast.error(
                `Export failed: ${errorData.message || "Unknown error"}`
              );
              console.error("Server error details:", errorData);
            }
          } catch (e) {
            toast.error("Failed to export report: Server error");
          }
        };
        reader.readAsText(error.response.data);
      } else {
        toast.error(
          `Failed to export report: ${
            error.response?.data?.message || error.message || "Server error"
          }`
        );
      }
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8 py-6">
        <div className="p-6 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-lg">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-gray-50 dark:bg-gray-900">
      <div className="px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Membership & Subscription Management
          </h1>
        </div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-all border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Active Members
                </p>
                <h3 className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">
                  {stats.totalActiveMembers}
                </h3>
              </div>
              <div className="p-3 rounded-full bg-gray-50 dark:bg-gray-700">
                <FiUsers className="text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-all border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Revenue
                </p>
                <h3 className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">
                  {formatCurrency(stats.totalRevenue)}
                </h3>
              </div>
              <div className="p-3 rounded-full bg-gray-50 dark:bg-gray-700">
                <FiDollarSign className="text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-all border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Auto-Renewal Users
                </p>
                <h3 className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">
                  {stats.autoRenewalUsers}
                </h3>
              </div>
              <div className="p-3 rounded-full bg-gray-50 dark:bg-gray-700">
                <FiRefreshCw className="text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-all border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Failed Payments
                </p>
                <h3 className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">
                  {stats.failedPayments}
                </h3>
              </div>
              <div className="p-3 rounded-full bg-gray-50 dark:bg-gray-700">
                <FiAlertCircle className="text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Subscription Growth (Last 6 Months)
            </h2>
            <SubscriptionGrowthChart data={growthData} />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h2>
            <RecentActivityFeed activities={recentActivities} />
          </div>
        </div>

        {/* Membership Management Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Membership Plans
            </h2>
            <MembershipPlansTable />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              User Subscriptions
            </h2>
            <UserSubscriptionsTable />
          </div>
        </div>

        {/* Invoice Management Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Invoice Management
          </h2>
          <InvoiceManagementTable />
        </div>

        {/* Auto-Renewal Status Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Failed Auto-Renewals Management
          </h2>
          <FailedRenewalsTable />
        </div>

        {/* Report Generation Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Membership Reports
            </h2>

            <div className="flex items-center gap-2">
              <select
                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                value={reportPeriod}
                onChange={handlePeriodChange}
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 3 Months</option>
                <option value="180days">Last 6 Months</option>
                <option value="1year">Last Year</option>
              </select>

              <button
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                onClick={exportReport}
                disabled={isExporting}
              >
                {isExporting ? (
                  <span className="inline-block animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <FiDownload size={16} />
                )}
                <span>Export Report</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportSections.map((section) => (
              <div
                key={section.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  {section.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {section.description}
                </p>
                <div className="flex items-center text-primary">
                  <input
                    type="checkbox"
                    checked={selectedReportSections.includes(section.id)}
                    onChange={() => toggleReportSection(section.id)}
                    className="mr-2"
                  />
                  <span className="text-sm">Include in export</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Report Preview Modal */}
        {showReportPreview && reportData && (
          <ReportPreviewModal
            isOpen={showReportPreview}
            onClose={() => setShowReportPreview(false)}
            reportData={reportData}
            selectedSections={selectedReportSections}
            periodLabel={getPeriodLabel()}
          />
        )}
      </div>
    </div>
  );
}
