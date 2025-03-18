import React from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import {
  clearNotification,
  renewFromNotification,
} from "@/store/slices/notificationSlice";
import { AppDispatch } from "@/store/store";
import { FiBell } from "react-icons/fi";

interface RenewalNotificationProps {
  id: string;
  title: string;
  message: string;
  severity: "low" | "medium" | "high";
  subscriptionId: string;
}

const RenewalNotification: React.FC<RenewalNotificationProps> = ({
  id,
  title,
  message,
  severity,
  subscriptionId,
}) => {
  const [isRenewing, setIsRenewing] = React.useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const getBorderColor = () => {
    switch (severity) {
      case "high":
        return "border-red-400";
      case "medium":
        return "border-yellow-400";
      case "low":
        return "border-emerald-400";
      default:
        return "border-emerald-300";
    }
  };

  const getIconColor = () => {
    switch (severity) {
      case "high":
        return "text-red-400";
      case "medium":
        return "text-yellow-400";
      case "low":
        return "text-emerald-400";
      default:
        return "text-emerald-300";
    }
  };

  const handleRenew = async () => {
    setIsRenewing(true);
    try {
      await dispatch(renewFromNotification(subscriptionId)).unwrap();
      toast.success("Membership renewed successfully!");
    } catch (error) {
      toast.error("Failed to renew membership");
      console.error("Renewal error:", error);
    } finally {
      setIsRenewing(false);
    }
  };

  const handleDismiss = () => {
    dispatch(clearNotification(id));
  };

  return (
    <div
      className={`relative bg-gray-800/50 dark:bg-gray-800/80 rounded-lg shadow-md p-4 mb-3 border-l-4 ${getBorderColor()} backdrop-blur-sm border border-t border-r border-b border-gray-700/50`}
    >
      <div className="flex items-start">
        <div className={`mr-3 flex-shrink-0 ${getIconColor()}`}>
          <FiBell className="w-5 h-5" />
        </div>
        <div className="flex-grow">
          <h4 className="text-sm font-medium text-gray-100 dark:text-gray-100">
            {title}
          </h4>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-400">
            {message}
          </p>
          <div className="mt-3 flex space-x-3">
            <button
              onClick={handleRenew}
              disabled={isRenewing}
              className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-md text-white bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:opacity-50"
            >
              {isRenewing ? "RENEWING..." : "RENEW NOW"}
            </button>
            <button
              onClick={handleDismiss}
              className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-md text-gray-300 bg-gray-700/50 hover:bg-gray-600/50 dark:text-gray-200 dark:bg-gray-700/50 dark:hover:bg-gray-600/50 border border-gray-600/50"
            >
              DISMISS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RenewalNotification;