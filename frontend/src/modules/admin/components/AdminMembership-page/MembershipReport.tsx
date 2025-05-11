import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
  Svg,
  Path,
  Circle,
  G,
  Line,
} from "@react-pdf/renderer";
import { format } from "date-fns";

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#6a0dad",
    borderBottomStyle: "solid",
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "column",
  },
  title: {
    fontSize: 24,
    marginBottom: 5,
    color: "#6a0dad",
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    color: "#777777",
  },
  section: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderStyle: "solid",
    borderRadius: 4,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
    color: "#6a0dad",
    fontWeight: "bold",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    borderBottomStyle: "solid",
    paddingBottom: 5,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  metricCard: {
    width: "31%",
    margin: "1%",
    padding: 10,
    backgroundColor: "#f9f7ff",
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: "#6a0dad",
    borderLeftStyle: "solid",
  },
  metricTitle: {
    fontSize: 10,
    color: "#555555",
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "bold",
  },
  chartContainer: {
    height: 200,
    padding: 10,
    backgroundColor: "#f9f7ff",
    borderRadius: 4,
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderColor: "#e5e7eb",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    borderBottomStyle: "solid",
    minHeight: 25,
    alignItems: "center",
  },
  tableHeader: {
    backgroundColor: "#f3f4f6",
  },
  tableCell: {
    width: "20%",
    borderStyle: "solid",
    borderColor: "#e5e7eb",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#374151",
  },
  tableCellText: {
    fontSize: 10,
    color: "#111827",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 10,
    color: "#6b7280",
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    borderTopStyle: "solid",
    paddingTop: 10,
  },
  chartTitle: {
    fontSize: 12,
    color: "#555555",
    marginBottom: 5,
    textAlign: "center",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 4,
    marginTop: 2,
  },
  progressFill: {
    height: 8,
    backgroundColor: "#6a0dad",
    borderRadius: 4,
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
    marginBottom: 5,
  },
  legendColor: {
    width: 10,
    height: 10,
    marginRight: 5,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 8,
    color: "#4b5563",
  },
});

interface MembershipReportProps {
  reportData: any;
  selectedSections: string[];
  periodLabel: string;
  onLoadComplete?: () => void;
}

const MembershipReport: React.FC<MembershipReportProps> = ({
  reportData,
  selectedSections,
  periodLabel,
  onLoadComplete,
}) => {
  const formatCurrency = (amount: number) => {
    return `LKR ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  React.useEffect(() => {
    // Add a slight delay to ensure PDF has time to render
    const timer = setTimeout(() => {
      if (onLoadComplete) onLoadComplete();
    }, 1500);

    return () => clearTimeout(timer);
  }, [onLoadComplete]);

  return (
    <PDFViewer style={{ width: "100%", height: "100%" }}>
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>SaloGame Membership Report</Text>
              <Text style={styles.subtitle}>
                {periodLabel} • Generated on{" "}
                {format(new Date(), "MMMM d, yyyy")}
              </Text>
            </View>
            {/* Logo placeholder */}
            <View style={{ width: 80 }}>
              <Text
                style={{ fontSize: 20, color: "#6a0dad", fontWeight: "bold" }}
              >
                SALO
              </Text>
              <Text style={{ fontSize: 12, color: "#6a0dad" }}>GAMES</Text>
            </View>
          </View>

          {/* Subscription Summary Section */}
          {selectedSections.includes("subscription-summary") && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Subscription Summary</Text>
              <View style={styles.metricsGrid}>
                <View style={styles.metricCard}>
                  <Text style={styles.metricTitle}>Total Active Members</Text>
                  <Text style={styles.metricValue}>
                    {reportData.totalActiveMembers}
                  </Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricTitle}>Total Revenue</Text>
                  <Text style={styles.metricValue}>
                    {formatCurrency(reportData.totalRevenue)}
                  </Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricTitle}>Auto-Renewal Users</Text>
                  <Text style={styles.metricValue}>
                    {reportData.autoRenewalUsers}
                  </Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricTitle}>Growth Rate</Text>
                  <Text style={styles.metricValue}>
                    {formatPercentage(reportData.growthRate || 0)}
                  </Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricTitle}>
                    Avg. Subscription Value
                  </Text>
                  <Text style={styles.metricValue}>
                    {formatCurrency(reportData.averageSubscriptionValue || 0)}
                  </Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricTitle}>Failed Payments</Text>
                  <Text style={styles.metricValue}>
                    {reportData.failedPayments}
                  </Text>
                </View>
              </View>

              {/* Subscription Growth Chart */}
              <View style={{ marginTop: 15 }}>
                <Text style={styles.chartTitle}>
                  Subscription Growth (Last 6 Months)
                </Text>
                <View style={styles.chartContainer}>
                  <Svg width="100%" height="180">
                    {/* X and Y axis */}
                    <Line
                      x1="40"
                      y1="150"
                      x2="40"
                      y2="20"
                      stroke="#666666"
                      strokeWidth={1}
                    />
                    <Line
                      x1="40"
                      y1="150"
                      x2="460"
                      y2="150"
                      stroke="#666666"
                      strokeWidth={1}
                    />

                    {/* Growth line */}
                    {reportData.growthData &&
                      reportData.growthData.length > 0 && (
                        <Path
                          d={reportData.growthData
                            .map((item, index) => {
                              const x =
                                40 +
                                index *
                                  (420 /
                                    (reportData.growthData.length - 1 || 1));
                              const maxCount = Math.max(
                                ...reportData.growthData.map((d) => d.count),
                                1
                              );
                              const y = 150 - (item.count / maxCount) * 120;
                              return `${index === 0 ? "M" : "L"} ${x} ${y}`;
                            })
                            .join(" ")}
                          stroke="#6a0dad"
                          strokeWidth={2}
                          fill="none"
                        />
                      )}

                    {/* Plot points */}
                    {reportData.growthData &&
                      reportData.growthData.map((item, index) => {
                        const x =
                          40 +
                          index *
                            (420 / (reportData.growthData.length - 1 || 1));
                        const maxCount = Math.max(
                          ...reportData.growthData.map((d) => d.count),
                          1
                        );
                        const y = 150 - (item.count / maxCount) * 120;
                        return (
                          <Circle
                            key={index}
                            cx={x}
                            cy={y}
                            r={3}
                            fill="#6a0dad"
                          />
                        );
                      })}

                    {/* X-axis labels */}
                    {reportData.growthData &&
                      reportData.growthData.map(
                        (
                          item: { month: string; count: number },
                          index: number
                        ) => {
                          const x =
                            40 +
                            index *
                              (420 / (reportData.growthData.length - 1 || 1));
                          return (
                            <Text
                              key={index}
                              style={{
                                position: "absolute",
                                left: x - 10,
                                top: 165,
                                fontSize: 8,
                              }}
                            >
                              {item.month}
                            </Text>
                          );
                        }
                      )}
                  </Svg>
                </View>
              </View>
            </View>
          )}

          {/* Member Activity Section */}
          {selectedSections.includes("member-activity") && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Member Activity</Text>
              <View style={styles.metricsGrid}>
                <View style={styles.metricCard}>
                  <Text style={styles.metricTitle}>
                    Active Logins (30 days)
                  </Text>
                  <Text style={styles.metricValue}>
                    {reportData.activeLogins || 0}
                  </Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricTitle}>Avg. Session Duration</Text>
                  <Text style={styles.metricValue}>
                    {reportData.avgSessionDuration || "00:45:32"}
                  </Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricTitle}>Feature Usage</Text>
                  <Text style={styles.metricValue}>
                    {formatPercentage(reportData.featureUsage || 78.5)}
                  </Text>
                </View>
              </View>

              {/* Recent Activity Table */}
              {reportData.recentActivities &&
                reportData.recentActivities.length > 0 && (
                  <View style={{ marginTop: 15 }}>
                    <Text style={styles.chartTitle}>
                      Recent Member Activities
                    </Text>
                    <View style={styles.table}>
                      <View style={[styles.tableRow, styles.tableHeader]}>
                        <View style={styles.tableCell}>
                          <Text style={styles.tableHeaderCell}>Date</Text>
                        </View>
                        <View style={styles.tableCell}>
                          <Text style={styles.tableHeaderCell}>User</Text>
                        </View>
                        <View style={styles.tableCell}>
                          <Text style={styles.tableHeaderCell}>Action</Text>
                        </View>
                        <View style={styles.tableCell}>
                          <Text style={styles.tableHeaderCell}>Membership</Text>
                        </View>
                        <View style={styles.tableCell}>
                          <Text style={styles.tableHeaderCell}>Details</Text>
                        </View>
                      </View>

                      {reportData.recentActivities
                        .slice(0, 8)
                        .map((activity, i) => (
                          <View key={i} style={styles.tableRow}>
                            <View style={styles.tableCell}>
                              <Text style={styles.tableCellText}>
                                {format(new Date(activity.date), "MMM d, yyyy")}
                              </Text>
                            </View>
                            <View style={styles.tableCell}>
                              <Text style={styles.tableCellText}>
                                {activity.user}
                              </Text>
                            </View>
                            <View style={styles.tableCell}>
                              <Text style={styles.tableCellText}>
                                {activity.action}
                              </Text>
                            </View>
                            <View style={styles.tableCell}>
                              <Text style={styles.tableCellText}>
                                {activity.membershipType}
                              </Text>
                            </View>
                            <View style={styles.tableCell}>
                              <Text style={styles.tableCellText}>
                                {activity.details}
                              </Text>
                            </View>
                          </View>
                        ))}
                    </View>
                  </View>
                )}
            </View>
          )}

          {/* Renewal Analysis Section */}
          {selectedSections.includes("renewal-analysis") && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Renewal Analysis</Text>
              <View style={styles.metricsGrid}>
                <View style={styles.metricCard}>
                  <Text style={styles.metricTitle}>Renewal Rate</Text>
                  <Text style={styles.metricValue}>
                    {formatPercentage(reportData.renewalRate || 67.8)}
                  </Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricTitle}>Churn Rate</Text>
                  <Text style={styles.metricValue}>
                    {formatPercentage(reportData.churnRate || 12.4)}
                  </Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricTitle}>Auto-Renewal %</Text>
                  <Text style={styles.metricValue}>
                    {formatPercentage(
                      (reportData.autoRenewalUsers /
                        reportData.totalActiveMembers) *
                        100 || 0
                    )}
                  </Text>
                </View>
              </View>

              {/* Membership Retention Chart */}
              <View style={{ marginTop: 15 }}>
                <Text style={styles.chartTitle}>
                  Membership Status Distribution
                </Text>
                <View style={styles.chartContainer}>
                  <View
                    style={{
                      flexDirection: "column",
                      paddingTop: 10,
                      paddingBottom: 10,
                    }}
                  >
                    <Text style={{ fontSize: 10, marginBottom: 5 }}>
                      Auto-renewal Enabled
                    </Text>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${
                              (reportData.autoRenewalUsers /
                                reportData.totalActiveMembers) *
                              100
                            }%`,
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={{ fontSize: 10, marginBottom: 5, marginTop: 10 }}
                    >
                      Renewals Pending
                    </Text>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${
                              ((reportData.totalActiveMembers -
                                reportData.autoRenewalUsers) /
                                reportData.totalActiveMembers) *
                              100
                            }%`,
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={{ fontSize: 10, marginBottom: 5, marginTop: 10 }}
                    >
                      Failed Payments
                    </Text>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${
                              (reportData.failedPayments /
                                reportData.totalActiveMembers) *
                              100
                            }%`,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Revenue Breakdown Section */}
          {selectedSections.includes("revenue-breakdown") && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Revenue Breakdown</Text>
              <View style={styles.metricsGrid}>
                <View style={styles.metricCard}>
                  <Text style={styles.metricTitle}>Total Revenue</Text>
                  <Text style={styles.metricValue}>
                    {formatCurrency(reportData.totalRevenue)}
                  </Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricTitle}>
                    Avg. Subscription Value
                  </Text>
                  <Text style={styles.metricValue}>
                    {formatCurrency(reportData.averageSubscriptionValue || 0)}
                  </Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricTitle}>Revenue Growth</Text>
                  <Text style={styles.metricValue}>
                    {formatPercentage(reportData.revenueGrowth || 8.5)}
                  </Text>
                </View>
              </View>

              {/* Revenue by Plan Type */}
              <View style={{ marginTop: 15 }}>
                <Text style={styles.chartTitle}>
                  Revenue by Membership Plan
                </Text>
                <View style={styles.table}>
                  <View style={[styles.tableRow, styles.tableHeader]}>
                    <View style={styles.tableCell}>
                      <Text style={styles.tableHeaderCell}>Plan Name</Text>
                    </View>
                    <View style={styles.tableCell}>
                      <Text style={styles.tableHeaderCell}>Subscribers</Text>
                    </View>
                    <View style={styles.tableCell}>
                      <Text style={styles.tableHeaderCell}>Monthly Price</Text>
                    </View>
                    <View style={styles.tableCell}>
                      <Text style={styles.tableHeaderCell}>Total Revenue</Text>
                    </View>
                    <View style={styles.tableCell}>
                      <Text style={styles.tableHeaderCell}>% of Total</Text>
                    </View>
                  </View>

                  {(reportData.planRevenue || []).map((plan, i) => (
                    <View key={i} style={styles.tableRow}>
                      <View style={styles.tableCell}>
                        <Text style={styles.tableCellText}>{plan.name}</Text>
                      </View>
                      <View style={styles.tableCell}>
                        <Text style={styles.tableCellText}>
                          {plan.subscribers}
                        </Text>
                      </View>
                      <View style={styles.tableCell}>
                        <Text style={styles.tableCellText}>
                          {formatCurrency(plan.price)}
                        </Text>
                      </View>
                      <View style={styles.tableCell}>
                        <Text style={styles.tableCellText}>
                          {formatCurrency(plan.totalRevenue)}
                        </Text>
                      </View>
                      <View style={styles.tableCell}>
                        <Text style={styles.tableCellText}>
                          {formatPercentage(plan.percentage)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* Footer */}
          <Text style={styles.footer}>
            SaloGame Membership Report • Confidential • Internal Use Only
          </Text>
        </Page>
      </Document>
    </PDFViewer>
  );
};

export default MembershipReport;
