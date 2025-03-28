import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Document, Page, Text, View, PDFViewer } from "@react-pdf/renderer";
import styles from "./BookingReportStyles";
import { getBookingReport } from "@/api/bookingService";

const BookingReportPage: React.FC = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const period = query.get("period") || "previous-month";

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any | null>(null);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Await the completion of the getBookingReport function if it's async
        const data = await getBookingReport(period);

        setReportData(data);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching report data:", err);
        setError("Failed to load report data. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchReportData();
  }, [period]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500 text-center">
          <p className="text-lg mb-2">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500 text-center">
          <p>No data available for the selected period.</p>
        </div>
      </div>
    );
  }
  console.log("report Data: ", reportData);
  const {
    metrics: {
      totalBookings,
      completedBookings,
      totalRevenue,
      averageBookingValue,
      bookingsByStatus,
      bookingsByMachine,
    },
    startDate,
    endDate,
  } = reportData;

  // Format functions
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return `LKR ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <PDFViewer style={{ width: "100%", height: "100vh", maxHeight: "100vh" }}>
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>SaloGame Bookings</Text>
            <Text style={styles.subtitle}>
              {formatDate(startDate)} - {formatDate(endDate)}
            </Text>
          </View>

          {/* Executive Summary Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Executive Summary</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricTitle}>Total Bookings</Text>
                <Text style={styles.metricValue}>{totalBookings}</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricTitle}>Completed Bookings</Text>
                <Text style={styles.metricValue}>{completedBookings}</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricTitle}>Total Revenue</Text>
                <Text style={styles.metricValue}>
                  {formatCurrency(totalRevenue)}
                </Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricTitle}>Average Booking Value</Text>
                <Text style={styles.metricValue}>
                  {formatCurrency(averageBookingValue)}
                </Text>
              </View>
            </View>
          </View>

          {/* Booking Trends */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Booking Trends</Text>
            <View style={styles.trendGrid}>
              <View style={styles.trendCard}>
                <Text style={styles.trendTitle}>Monthly Bookings</Text>
                <Text style={styles.trendValue}>15 this month</Text>
              </View>
              <View style={styles.trendCard}>
                <Text style={styles.trendTitle}>Revenue Trends</Text>
                <Text style={styles.trendValue}>
                  {formatCurrency(totalRevenue)}
                </Text>
              </View>
            </View>
          </View>

          {/* Booking Details By Machines */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Booking Details By Machines</Text>
            <View style={styles.metricsGrid}>
              {Object.entries(bookingsByMachine).map(
                ([machine, bookingCount]) => (
                  <View key={machine} style={styles.metricCard}>
                    <Text
                      style={styles.metricTitle}
                    >{`${machine} Bookings`}</Text>
                    {/* Ensure bookingCount is treated as a number or string */}
                    <Text style={styles.metricValue}>
                      {String(bookingCount)}
                    </Text>
                  </View>
                )
              )}
            </View>
          </View>

          {/* Booking Details By Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Booking Details By Status</Text>
            <View style={styles.metricsGrid}>
              {Object.entries(bookingsByStatus).map(
                ([status, bookingCount]) => (
                  <View key={status} style={styles.metricCard}>
                    <Text
                      style={styles.metricTitle}
                    >{`${status} Bookings`}</Text>
                    {/* Ensure bookingCount is treated as a number or string */}
                    <Text style={styles.metricValue}>
                      {String(bookingCount)}
                    </Text>
                  </View>
                )
              )}
            </View>
          </View>

          {/* Financial Metrics */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Financial Metrics</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricTitle}>Total Transactions</Text>
                <Text style={styles.metricValue}>{totalBookings}</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricTitle}>
                  Average Transaction Value
                </Text>
                <Text style={styles.metricValue}>
                  {formatCurrency(averageBookingValue)}
                </Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricTitle}>Refunds</Text>
                <Text style={styles.metricValue}>2</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricTitle}>Cancellations</Text>
                <Text style={styles.metricValue}>2</Text>
              </View>
            </View>
          </View>

          {/* Additional Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Features</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricTitle}>Machine Utilization</Text>
                <Text style={styles.metricValue}>High</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricTitle}>Peak Usage Times</Text>
                <Text style={styles.metricValue}>Evenings</Text>
              </View>
            </View>
          </View>

          {/* Footer */}
          <Text style={styles.footer}>
            Generated on {new Date().toLocaleDateString()} • SaloGames Booking
            Report • Confidential
          </Text>
        </Page>
      </Document>
    </PDFViewer>
  );
};

export default BookingReportPage;
