import React from "react";
import { formatCurrency } from "../../../../utils/formatter.util.ts";
import {
  FiCalendar,
  FiCreditCard,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import { Switch } from "@/components/ui/switch";
import { toast } from "react-hot-toast";
import axiosInstance from "@/axios.config";
import { useDispatch as useReduxDispatch } from "react-redux";
import type { AppDispatch } from "../../../../store/store";

import { fetchXpBalance } from "@/store/slices/XPslice";

interface SubscriptionDetailsProps {
  subscription: {
    _id: string;
    membershipId: {
      _id: string;
      name: string;
      benefits: string[];
    };
    startDate: string;
    endDate: string;
    duration: number;
    totalAmount: number;
    status: "active" | "expired" | "cancelled";
    paymentStatus: "pending" | "completed" | "failed";
    autoRenew: boolean;
  };
}

const SubscriptionDetails: React.FC<SubscriptionDetailsProps> = ({
  subscription,
}) => {
  const [autoRenew, setAutoRenew] = React.useState(subscription.autoRenew);
  const [isUpdating, setIsUpdating] = React.useState(false);

  const dispatch: AppDispatch = useReduxDispatch();

  // Auto Renewal Toggle
  const handleAutoRenewToggle = async (newAutoRenewValue: boolean) => {
    try {
      setIsUpdating(true);
      await axiosInstance.patch(
        `/subscriptions/${subscription._id}/auto-renew`,
        {
          autoRenew: newAutoRenewValue,
        }
      );

      // Success case
      setAutoRenew(newAutoRenewValue);
      toast.success(
        newAutoRenewValue
          ? "Auto-renewal enabled successfully"
          : "Auto-renewal disabled successfully"
      );
      dispatch(fetchXpBalance());
    } catch (error) {
      if (
        (error as any).response?.data?.errorCode === "PAYMENT_DETAILS_REQUIRED"
      ) {
        toast.error(
          "You need to add a payment method before enabling auto-renewal. Please go to Payment Methods section.",
          {
            duration: 5000,
            icon: "💳",
          }
        );

        setAutoRenew(false);
      } else {
        const errorMessage =
          (error as any).response?.data?.message ||
          "Failed to update auto-renewal setting";
        toast.error(errorMessage);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
            Active
          </span>
        );
      case "expired":
        return (
          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">
            Expired
          </span>
        );
      case "cancelled":
        return (
          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  // Format dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    /* Header Section */
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">
            {subscription.membershipId.name} Plan
            <span className="ml-3">{getStatusBadge(subscription.status)}</span>
          </h3>
          <p className="text-gray-400 mt-1">
            {formatCurrency(subscription.totalAmount)} for{" "}
            {subscription.duration}{" "}
            {subscription.duration === 1 ? "month" : "months"}
          </p>
        </div>

        {/* Auto Renewal Toggle */}
        {subscription.status === "active" && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Auto-renew</span>
            {isUpdating ? (
              <span className="text-blue-400 animate-spin">💫</span>
            ) : (
              <Switch
                checked={autoRenew}
                onCheckedChange={(checked) => handleAutoRenewToggle(checked)}
                disabled={isUpdating}
              />
            )}
          </div>
        )}
      </div>

      {/* Subscription Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <FiCalendar className="text-primary" />
            <div>
              <p className="text-sm text-gray-400">Start Date</p>
              <p className="text-white">{formatDate(subscription.startDate)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <FiCalendar className="text-primary" />
            <div>
              <p className="text-sm text-gray-400">Expiry Date</p>
              <p className="text-white">{formatDate(subscription.endDate)}</p>
            </div>
          </div>
        </div>

        {/* Payment Status */}
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <FiCreditCard className="text-primary" />
            <div>
              <p className="text-sm text-gray-400">Payment Status</p>
              <p className="text-white flex items-center">
                {subscription.paymentStatus === "completed" ? (
                  <>
                    <FiCheckCircle className="text-green-500 mr-1" />
                    Completed
                  </>
                ) : subscription.paymentStatus === "pending" ? (
                  <>
                    <FiRefreshCw className="text-yellow-500 mr-1" />
                    Pending
                  </>
                ) : (
                  <>
                    <FiXCircle className="text-red-500 mr-1" />
                    Failed
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Renewal Status */}
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <FiRefreshCw className="text-primary" />
            <div>
              <p className="text-sm text-gray-400">Renewal Status</p>
              <p className="text-white">
                {subscription.status === "active"
                  ? autoRenew
                    ? "Will renew automatically"
                    : "Will not renew"
                  : "No renewal (subscription not active)"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Membership benefits */}
      <div className="mt-6">
        <h4 className="text-md font-semibold text-white mb-2">
          Membership Benefits
        </h4>
        <ul className="space-y-2">
          {subscription.membershipId.benefits.map((benefit, index) => (
            <li key={index} className="flex items-center text-sm text-gray-300">
              <span className="mr-2 text-gamer-green">✔</span>
              {benefit}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SubscriptionDetails;
