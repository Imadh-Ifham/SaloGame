import React, { useState, useEffect } from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer, Svg, Path, Circle, G, Rect, Line } from '@react-pdf/renderer';
import { ITransaction, getTransactionReport, TransactionReportData } from '../../../../api/transactionService';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#6a0dad', // SaloGames purple theme
    borderBottomStyle: 'solid',
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'column',
  },
  logo: {
    width: 120,
    height: 40,
    marginBottom: 5,
  },
  title: {
    fontSize: 24,
    marginBottom: 5,
    color: '#6a0dad', // SaloGames purple theme
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#777777',
  },
  section: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'solid',
    borderRadius: 4,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
    color: '#6a0dad', // SaloGames purple theme
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderBottomStyle: 'solid',
    paddingBottom: 5,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  metricCard: {
    width: '31%',
    margin: '1%',
    padding: 10,
    backgroundColor: '#f9f7ff', // Light purple background
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#6a0dad', // SaloGames purple theme
    borderLeftStyle: 'solid',
  },
  metricTitle: {
    fontSize: 10,
    color: '#555555',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: 'bold',
  },
  trendMetricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 15,
  },
  trendMetricCard: {
    width: '48%',
    marginBottom: 10,
    marginRight: '2%',
    padding: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#34d399', // Success green
    borderLeftStyle: 'solid',
  },
  trendNegative: {
    borderLeftColor: '#f87171', // Failure red
  },
  trendIndicator: {
    fontSize: 8,
    marginLeft: 5,
    color: '#34d399', // Success green
  },
  trendNegativeIndicator: {
    color: '#f87171', // Failure red
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartsRow: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 10,
  },
  chartColumn: {
    width: '48%',
    margin: '1%',
  },
  chartTitle: {
    fontSize: 12,
    color: '#555555',
    marginBottom: 5,
    textAlign: 'center',
  },
  chartContainer: {
    height: 200,
    padding: 10,
    backgroundColor: '#f9f7ff',
    borderRadius: 4,
  },
  pieContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
    color: '#555555',
  },
  table: {
    width: 'auto',
    borderStyle: 'solid',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderBottomStyle: 'solid',
    minHeight: 25,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
  },
  tableCell: {
    width: '20%',
    borderStyle: 'solid',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
  },
  tableCellText: {
    fontSize: 10,
    color: '#111827',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    paddingTop: 10,
    borderTopColor: '#e5e7eb',
  },
});

// Chart colors - theme colors
const chartColors = ['#6a0dad', '#34d399', '#f59e0b', '#3b82f6', '#ef4444', '#10b981', '#6366f1', '#8b5cf6'];

// Helper function to create SVG pie chart path
const createPieChart = (data: { value: number; color: string }[], radius: number) => {
  if (!data || data.length === 0) {
    return []; // Return empty array for empty data
  }
  
  const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
  if (total === 0) {
    return []; // Return empty array if total is zero
  }
  
  let startAngle = 0;
  
  return data.map((item, index) => {
    const value = item.value || 0;
    const angle = (value / total) * 360;
    const endAngle = startAngle + angle;
    
    // Calculate path coordinates
    const x1 = radius * Math.cos((startAngle * Math.PI) / 180);
    const y1 = radius * Math.sin((startAngle * Math.PI) / 180);
    const x2 = radius * Math.cos((endAngle * Math.PI) / 180);
    const y2 = radius * Math.sin((endAngle * Math.PI) / 180);
    
    // Create SVG path
    const largeArcFlag = angle > 180 ? 1 : 0;
    const path = `M 0 0 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    
    startAngle = endAngle;
    
    return {
      path,
      color: item.color,
      value: value,
      percentage: Math.round((value / total) * 100),
    };
  });
};

interface TransactionReportProps {
  transactions?: ITransaction[];
  startDate: Date | null;
  endDate: Date | null;
  period: '3mo' | '6mo' | '1yr';
}

const TransactionReport: React.FC<TransactionReportProps> = ({
  transactions: initialTransactions,
  startDate: initialStartDate,
  endDate: initialEndDate,
  period,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<TransactionReportData | null>(null);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await getTransactionReport({
          period,
          startDate: initialStartDate,
          endDate: initialEndDate
        });
        
        setReportData(data);
      } catch (err) {
        console.error('Error fetching report data:', err);
        setError('Failed to load report data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportData();
  }, [period, initialStartDate, initialEndDate]);

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

  const {
    transactions = [],
    metrics: {
      totalTransactions = 0,
      completedTransactions = 0,
      totalRevenue = 0,
      averageTransactionValue = 0,
      transactionsByType = {},
      transactionsByPayment = {}
    },
    startDate,
    endDate
  } = reportData;

  // Format functions
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return `LKR ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Calculate additional financial metrics
  const totalRefunds = transactions.filter(t => t.transactionType === 'refund').length;
  const refundAmount = transactions
    .filter(t => t.transactionType === 'refund')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  const completionRate = totalTransactions > 0 ? (completedTransactions / totalTransactions) * 100 : 0;
  const refundRate = completedTransactions > 0 ? (totalRefunds / completedTransactions) * 100 : 0;
  const averageTransactionValueFormatted = completedTransactions > 0 ? formatCurrency(averageTransactionValue) : 'N/A';

  // Calculate revenue by month for trend
  const revenueByMonth: Record<string, number> = {};
  const currentDate = new Date();
  const monthsToShow = period === '3mo' ? 3 : period === '6mo' ? 6 : 12;
  
  // Initialize months
  for (let i = 0; i < monthsToShow; i++) {
    const date = new Date(currentDate);
    date.setMonth(currentDate.getMonth() - i);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    revenueByMonth[monthKey] = 0;
  }
  
  // Fill in revenue data
  transactions.forEach(transaction => {
    if (transaction.status === 'completed') {
      const date = new Date(transaction.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (revenueByMonth[monthKey] !== undefined) {
        revenueByMonth[monthKey] += transaction.amount;
      }
    }
  });
  
  // Sort by month
  const sortedMonthKeys = Object.keys(revenueByMonth).sort();
  const sortedRevenueData = sortedMonthKeys.map(key => ({
    month: key,
    revenue: revenueByMonth[key]
  }));

  // Calculate growth rate
  let growthRate = 0;
  if (sortedRevenueData.length >= 2) {
    const currentMonthRevenue = sortedRevenueData[sortedRevenueData.length - 1].revenue;
    const previousMonthRevenue = sortedRevenueData[sortedRevenueData.length - 2].revenue;
    
    if (previousMonthRevenue > 0) {
      growthRate = ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;
    }
  }

  // Format month labels
  const monthLabels = sortedMonthKeys.map(key => {
    const [year, month] = key.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short' });
  });

  // Prepare pie chart data for transaction types
  const typeData = Object.entries(transactionsByType).map(([type, count], index) => ({
    label: type,
    value: count,
    color: chartColors[index % chartColors.length]
  }));

  // Prepare pie chart for payment methods
  const paymentData = Object.entries(transactionsByPayment).map(([type, count], index) => ({
    label: type,
    value: count,
    color: chartColors[(index + 3) % chartColors.length]
  }));

  // Generate pie chart SVG paths
  const typePiePaths = createPieChart(typeData, 50);
  const paymentPiePaths = createPieChart(paymentData, 50);

  return (
    <PDFViewer style={{ width: '100%', height: '100%', maxHeight: '90vh' }}>
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>SaloGame Transactions</Text>
              <Text style={styles.subtitle}>
                {period === '3mo' ? 'Last 3 Months' : period === '6mo' ? 'Last 6 Months' : 'Last Year'} •{' '}
                {formatDate(startDate)} - {formatDate(endDate)}
              </Text>
            </View>
            {/* Placeholder for logo */}
            <View style={{ width: 80 }}>
              <Text style={{ fontSize: 20, color: '#6a0dad', fontWeight: 'bold' }}>SALO</Text>
              <Text style={{ fontSize: 12, color: '#6a0dad' }}>GAMES</Text>
            </View>
          </View>

          {/* Executive Summary Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Executive Summary</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricTitle}>Total Transactions</Text>
                <Text style={styles.metricValue}>{totalTransactions}</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricTitle}>Completed Transactions</Text>
                <Text style={styles.metricValue}>{completedTransactions}</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricTitle}>Total Revenue</Text>
                <Text style={styles.metricValue}>{formatCurrency(totalRevenue)}</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricTitle}>Average Transaction Value</Text>
                <Text style={styles.metricValue}>{averageTransactionValueFormatted}</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricTitle}>Total Refunds</Text>
                <Text style={styles.metricValue}>{totalRefunds}</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricTitle}>Refund Amount</Text>
                <Text style={styles.metricValue}>{formatCurrency(refundAmount)}</Text>
              </View>
            </View>
            
            {/* Financial Trends */}
            <View style={styles.trendMetricGrid}>
              <View style={[styles.trendMetricCard, growthRate < 0 ? styles.trendNegative : {}]}>
                <Text style={styles.metricTitle}>Monthly Revenue Growth</Text>
                <View style={styles.trendRow}>
                  <Text style={styles.metricValue}>{formatPercentage(growthRate)}</Text>
                  <Text style={[styles.trendIndicator, growthRate < 0 ? styles.trendNegativeIndicator : {}]}>
                    {growthRate >= 0 ? '▲' : '▼'}
                  </Text>
                </View>
              </View>
              <View style={styles.trendMetricCard}>
                <Text style={styles.metricTitle}>Transaction Completion Rate</Text>
                <Text style={styles.metricValue}>{formatPercentage(completionRate)}</Text>
              </View>
              <View style={[styles.trendMetricCard, refundRate > 5 ? styles.trendNegative : {}]}>
                <Text style={styles.metricTitle}>Refund Rate</Text>
                <View style={styles.trendRow}>
                  <Text style={styles.metricValue}>{formatPercentage(refundRate)}</Text>
                  <Text style={[styles.trendIndicator, refundRate > 5 ? styles.trendNegativeIndicator : {}]}>
                    {refundRate <= 5 ? '✓' : '⚠'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Charts Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Visual Analysis</Text>
            
            {/* Revenue Trend Line Chart */}
            <View>
              <Text style={styles.chartTitle}>Monthly Revenue Trend</Text>
              <View style={styles.chartContainer}>
                <Svg width="100%" height="180">
                  {/* X and Y axis */}
                  <Line x1="40" y1="150" x2="40" y2="20" stroke="#666666" strokeWidth={1} />
                  <Line x1="40" y1="150" x2="460" y2="150" stroke="#666666" strokeWidth={1} />

                  {/* Revenue line */}
                  {sortedRevenueData.length > 0 ? (
                    <Path
                      d={sortedRevenueData.map((item, index) => {
                        const x = 40 + (index * (420 / (sortedRevenueData.length - 1 || 1)));
                        const maxRevenue = Math.max(...sortedRevenueData.map(d => d.revenue), 1);
                        const y = 150 - ((item.revenue / maxRevenue) * 120);
                        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }).join(' ')}
                      stroke="#6a0dad"
                      strokeWidth={2}
                      fill="none"
                    />
                  ) : null}

                  {/* Plot points */}
                  {sortedRevenueData.map((item, index) => {
                    const x = 40 + (index * (420 / (sortedRevenueData.length - 1 || 1)));
                    const maxRevenue = Math.max(...sortedRevenueData.map(d => d.revenue), 1);
                    const y = 150 - ((item.revenue / maxRevenue) * 120);
                    return (
                      <Circle key={index} cx={x} cy={y} r={3} fill="#6a0dad" />
                    );
                  })}

                  {/* X-axis labels */}
                  {monthLabels.map((label, index) => {
                    const x = 40 + (index * (420 / (monthLabels.length - 1 || 1)));
                    return (
                      <Text key={index} style={{ position: 'absolute', left: x - 10, top: 165, fontSize: 8 }}>
                        {label}
                      </Text>
                    );
                  })}

                  {/* Y-axis labels */}
                  {[0, 25, 50, 75, 100].map((percent, index) => {
                    const y = 150 - (percent * 1.2);
                    const maxRevenue = Math.max(...sortedRevenueData.map(d => d.revenue), 1);
                    const value = (maxRevenue * percent) / 100;
                    return (
                      <Text key={index} style={{ position: 'absolute', left: 35, top: y + 3, fontSize: 8 }}>
                        {formatCurrency(value).substring(0, 8)}
                      </Text>
                    );
                  })}
                </Svg>
              </View>
            </View>

            {/* Pie Charts */}
            <View style={styles.chartsRow}>
              {/* Transaction Types Pie Chart */}
              <View style={styles.chartColumn}>
                <Text style={styles.chartTitle}>Transaction Types</Text>
                <View style={[styles.chartContainer, styles.pieContainer]}>
                  <Svg width={120} height={120} viewBox="-60 -60 120 120">
                    <G>
                      {typePiePaths.map((path, index) => (
                        <Path
                          key={index}
                          d={path.path}
                          fill={path.color}
                        />
                      ))}
                    </G>
                  </Svg>
                  <View style={styles.legend}>
                    {typeData.map((item, index) => (
                      <View key={index} style={styles.legendItem}>
                        <View style={[styles.legendColor, { borderWidth: 1, borderStyle: 'solid', borderColor: item.color, backgroundColor: item.color }]} />
                        <Text style={styles.legendText}>
                          {item.label} ({typePiePaths[index]?.percentage || 0}%)
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              {/* Payment Methods Pie Chart */}
              <View style={styles.chartColumn}>
                <Text style={styles.chartTitle}>Payment Methods</Text>
                <View style={[styles.chartContainer, styles.pieContainer]}>
                  <Svg width={120} height={120} viewBox="-60 -60 120 120">
                    <G>
                      {paymentPiePaths.map((path, index) => (
                        <Path
                          key={index}
                          d={path.path}
                          fill={path.color}
                        />
                      ))}
                    </G>
                  </Svg>
                  <View style={styles.legend}>
                    {paymentData.map((item, index) => (
                      <View key={index} style={styles.legendItem}>
                        <View style={[styles.legendColor, { borderWidth: 1, borderStyle: 'solid', borderColor: item.color, backgroundColor: item.color }]} />
                        <Text style={styles.legendText}>
                          {item.label} ({paymentPiePaths[index]?.percentage || 0}%)
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Recent Transactions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            {transactions && transactions.length > 0 ? (
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={[styles.tableCell, styles.tableHeaderCell]}>Date</Text>
                  <Text style={[styles.tableCell, styles.tableHeaderCell]}>Type</Text>
                  <Text style={[styles.tableCell, styles.tableHeaderCell]}>Payment</Text>
                  <Text style={[styles.tableCell, styles.tableHeaderCell]}>Status</Text>
                  <Text style={[styles.tableCell, styles.tableHeaderCell]}>Amount</Text>
                </View>
                {transactions.slice(0, 8).map((transaction) => (
                  <View key={transaction._id} style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.tableCellText]}>
                      {formatDate(new Date(transaction.createdAt))}
                    </Text>
                    <Text style={[styles.tableCell, styles.tableCellText]}>
                      {transaction.transactionType}
                    </Text>
                    <Text style={[styles.tableCell, styles.tableCellText]}>
                      {transaction.paymentType || 'N/A'}
                    </Text>
                    <Text style={[styles.tableCell, styles.tableCellText]}>
                      {transaction.status}
                    </Text>
                    <Text style={[styles.tableCell, styles.tableCellText]}>
                      {formatCurrency(transaction.amount)}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text>No transaction data available for this period.</Text>
              </View>
            )}
          </View>

          {/* Footer */}
          <Text style={styles.footer}>
            Generated on {new Date().toLocaleDateString()} • SaloGames Financial Report • Confidential
          </Text>
        </Page>
      </Document>
    </PDFViewer>
  );
};

export default TransactionReport; 