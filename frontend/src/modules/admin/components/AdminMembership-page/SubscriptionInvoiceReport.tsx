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
  G,
} from "@react-pdf/renderer";
import { styles } from "./SubscriptionInvoiceReport.styles";

interface SubscriptionInvoiceProps {
  subscription: {
    _id: string;
    userId: {
      _id: string;
      email: string;
      name?: string;
    };
    membershipId: {
      _id: string;
      name: string;
      price: number;
    };
    startDate: string;
    endDate: string;
    duration: number;
    totalAmount: number;
    status: "active" | "expired" | "cancelled";
    paymentStatus: "pending" | "completed" | "failed";
    autoRenew: boolean;
    createdAt: string;
  };
}

const SubscriptionInvoiceReport: React.FC<SubscriptionInvoiceProps> = ({
  subscription,
}) => {
  // Format dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `LKR ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Get status styles
  const getStatusStyles = () => {
    switch (subscription.paymentStatus) {
      case "completed":
        return {
          container: [styles.status, styles.statusCompleted],
          text: [styles.statusText, styles.statusTextCompleted],
          message: "PAYMENT COMPLETED",
        };
      case "pending":
        return {
          container: [styles.status, styles.statusPending],
          text: [styles.statusText, styles.statusTextPending],
          message: "PAYMENT PENDING",
        };
      case "failed":
        return {
          container: [styles.status, styles.statusFailed],
          text: [styles.statusText, styles.statusTextFailed],
          message: "PAYMENT FAILED",
        };
      default:
        return {
          container: [styles.status],
          text: [styles.statusText],
          message: "UNKNOWN STATUS",
        };
    }
  };

  const statusStyles = getStatusStyles();
  const invoiceDate = formatDate(subscription.createdAt);
  const subscriptionStart = formatDate(subscription.startDate);
  const subscriptionEnd = formatDate(subscription.endDate);

  // Calculate individual price from total and duration
  const unitPrice = subscription.totalAmount / subscription.duration;

  return (
    <PDFViewer style={{ width: "100%", height: "100%", maxHeight: "90vh" }}>
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>INVOICE</Text>
              <Text style={styles.subtitle}>SaloGame Membership</Text>
            </View>
            {/* Logo */}
            <View style={{ width: 80 }}>
              <Text
                style={{ fontSize: 20, color: "#6a0dad", fontWeight: "bold" }}
              >
                SALO
              </Text>
              <Text style={{ fontSize: 12, color: "#6a0dad" }}>GAMES</Text>
            </View>
          </View>

          {/* Invoice & Customer Info */}
          <View style={styles.infoSection}>
            <View style={styles.infoColumn}>
              <Text style={styles.infoTitle}>Customer:</Text>
              <Text style={styles.infoText}>
                {subscription.userId.name || "Member"}
              </Text>
              <Text style={styles.infoText}>{subscription.userId.email}</Text>
              <Text style={styles.infoText}>
                User ID: {subscription.userId._id.substring(0, 8)}...
              </Text>
            </View>
            <View style={styles.infoColumn}>
              <Text style={styles.invoiceNumberText}>Invoice Number:</Text>
              <Text style={styles.invoiceNumber}>
                INV-{subscription._id.substring(0, 8)}
              </Text>
              <Text style={styles.infoText}>Date: {invoiceDate}</Text>
              <Text style={styles.infoText}>
                Subscription:{" "}
                {subscription.status.charAt(0).toUpperCase() +
                  subscription.status.slice(1)}
              </Text>
              <Text style={styles.infoText}>
                Auto-Renewal: {subscription.autoRenew ? "Yes" : "No"}
              </Text>
            </View>
          </View>

          {/* Payment Status Banner */}
          <View style={statusStyles.container}>
            <Text style={statusStyles.text}>{statusStyles.message}</Text>
          </View>

          {/* Subscription Details Table */}
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <View style={[styles.tableCell, styles.descriptionCell]}>
                <Text style={styles.tableHeaderCell}>Description</Text>
              </View>
              <View style={[styles.tableCell, styles.quantityCell]}>
                <Text style={styles.tableHeaderCell}>Duration</Text>
              </View>
              <View style={[styles.tableCell, styles.rateCell]}>
                <Text style={styles.tableHeaderCell}>Rate</Text>
              </View>
              <View style={[styles.tableCell, styles.amountCell]}>
                <Text style={styles.tableHeaderCell}>Amount</Text>
              </View>
            </View>

            <View style={styles.tableRow}>
              <View style={[styles.tableCell, styles.descriptionCell]}>
                <Text style={styles.tableCellText}>
                  {subscription.membershipId.name} Membership
                </Text>
                <Text style={[styles.tableCellText, { fontSize: 8 }]}>
                  Period: {subscriptionStart} to {subscriptionEnd}
                </Text>
              </View>
              <View style={[styles.tableCell, styles.quantityCell]}>
                <Text style={styles.tableCellText}>
                  {subscription.duration}{" "}
                  {subscription.duration === 1 ? "month" : "months"}
                </Text>
              </View>
              <View style={[styles.tableCell, styles.rateCell]}>
                <Text style={styles.tableCellText}>
                  {formatCurrency(unitPrice)}/month
                </Text>
              </View>
              <View style={[styles.tableCell, styles.amountCell]}>
                <Text style={styles.tableCellText}>
                  {formatCurrency(subscription.totalAmount)}
                </Text>
              </View>
            </View>
          </View>

          {/* Totals */}
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal:</Text>
            <Text style={styles.totalsValue}>
              {formatCurrency(subscription.totalAmount)}
            </Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Tax:</Text>
            <Text style={styles.totalsValue}>{formatCurrency(0)}</Text>
          </View>
          <View style={[styles.totalsRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(subscription.totalAmount)}
            </Text>
          </View>

          {/* Terms and Conditions */}
          <View style={{ marginTop: 40 }}>
            <Text style={styles.termsTitle}>Terms & Conditions:</Text>
            <Text style={styles.termsText}>
              1. This membership is subject to SaloGame's terms of service.
            </Text>
            <Text style={styles.termsText}>
              2. Refunds are processed according to our refund policy.
            </Text>
            <Text style={styles.termsText}>
              3. For questions regarding this invoice, please contact customer
              support.
            </Text>
            {subscription.autoRenew && (
              <Text style={styles.termsText}>
                4. This subscription will automatically renew at the end of the
                current term unless cancelled.
              </Text>
            )}
          </View>

          {/* Footer */}
          <Text style={styles.footer}>
            SaloGame Inc. • www.salogame.com • support@salogame.com • +94 11 234
            5678
          </Text>
        </Page>
      </Document>
    </PDFViewer>
  );
};

export default SubscriptionInvoiceReport;
