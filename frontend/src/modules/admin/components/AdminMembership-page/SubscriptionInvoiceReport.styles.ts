import { StyleSheet } from "@react-pdf/renderer";

// PDF styles
export const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#6a0dad", // SaloGames purple theme
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
    color: "#6a0dad", // SaloGames purple theme
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 12,
    color: "#777777",
  },
  infoSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  infoColumn: {
    width: "48%",
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333333",
  },
  infoText: {
    fontSize: 10,
    marginBottom: 2,
    color: "#555555",
  },
  invoiceNumberText: {
    fontSize: 11,
    color: "#555555",
    marginBottom: 4,
  },
  invoiceNumber: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 8,
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
    minHeight: 30,
    alignItems: "center",
  },
  tableHeader: {
    backgroundColor: "#f3f4f6",
  },
  tableCell: {
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
  descriptionCell: {
    width: "40%",
  },
  quantityCell: {
    width: "15%",
  },
  rateCell: {
    width: "20%",
  },
  amountCell: {
    width: "25%",
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  totalsLabel: {
    width: "30%",
    textAlign: "right",
    fontSize: 11,
    fontWeight: "bold",
    paddingRight: 8,
    color: "#111827",
  },
  totalsValue: {
    width: "25%",
    fontSize: 11,
    textAlign: "right",
    paddingRight: 8,
    color: "#111827",
  },
  totalRow: {
    backgroundColor: "#f3f4f6",
    padding: 5,
    marginTop: 5,
    borderRadius: 4,
  },
  totalLabel: {
    width: "30%",
    textAlign: "right",
    fontSize: 12,
    fontWeight: "bold",
    paddingRight: 8,
    color: "#111827",
  },
  totalValue: {
    width: "25%",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "right",
    paddingRight: 8,
    color: "#111827",
  },
  status: {
    marginTop: 20,
    marginBottom: 20,
    padding: 10,
    borderRadius: 4,
    textAlign: "center",
  },
  statusCompleted: {
    backgroundColor: "#d1fae5",
  },
  statusPending: {
    backgroundColor: "#fef3c7",
  },
  statusFailed: {
    backgroundColor: "#fee2e2",
  },
  statusText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  statusTextCompleted: {
    color: "#065f46",
  },
  statusTextPending: {
    color: "#92400e",
  },
  statusTextFailed: {
    color: "#b91c1c",
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
    borderTopStyle: "solid",
    paddingTop: 10,
    borderTopColor: "#e5e7eb",
  },
  termsTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#374151",
  },
  termsText: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 2,
  },
});
