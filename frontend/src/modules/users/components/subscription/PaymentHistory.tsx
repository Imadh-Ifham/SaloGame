import React, { useState, useEffect } from "react";
import axiosInstance from "@/axios.config";
import { formatCurrency } from "../../../../utils/formatter.util.ts";
import { FiClock, FiCheck, FiAlertTriangle } from "react-icons/fi";

interface Payment {
  _id: string;
  membershipId: {
    _id: string;
    name: string;
    price: number;
  };
  totalAmount: number;
  paymentStatus: "pending" | "completed" | "failed";
  createdAt: string;
  startDate: string;
  status: "active" | "expired" | "cancelled";
  autoRenew: boolean;
}

interface PaymentHistoryProps {
  userId: string;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ userId }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tableheaders = ["Date", "Amount", "Status", "Method"];
  useEffect(() => {
    const fetchPaymentHistory = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/subscriptions/user");
        const subscriptions = response.data.data || [];
        setPayments(subscriptions);
      } catch (error) {
        console.error("Error fetching payment history:", error);
        setError("Failed to load payment history");
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentHistory();
  }, [userId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <FiCheck className="text-green-500" />;
      case "pending":
        return <FiClock className="text-yellow-500" />;
      case "failed":
        return <FiAlertTriangle className="text-red-500" />;
      default:
        return null;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-400">
        <p>{error}</p>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="p-6 text-center text-gray-400">
        <p>No payment history found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-700">
        <thead>
          <tr>
            {tableheaders.map((header) => (
              <th
                key={header}
                className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {payments.map((payment) => (
            <tr key={payment._id} className="hover:bg-gray-700/30">
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                {formatDate(payment.createdAt)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                {payment.membershipId?.name || "N/A"}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                {formatCurrency(payment.totalAmount)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                <div className="flex items-center">
                  {getStatusIcon(payment.paymentStatus)}
                  <span className="ml-2 capitalize">
                    {payment.paymentStatus}
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentHistory;
