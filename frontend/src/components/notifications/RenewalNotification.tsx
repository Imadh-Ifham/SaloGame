import React from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import {
  clearNotification,
  renewFromNotification,
} from "@/store/slices/notificationSlice";
import { AppDispatch } from "@/store/store";
import { BellAlertIcon } from "@heroicons/react/24/outline";

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
        return "border-red-500";
      case "medium":
        return "border-yellow-500";
      case "low":
        return "border-blue-500";
      default:
        return "border-gray-300";
    }
  };

  const getIconColor = () => {
    switch (severity) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-yellow-500";
      case "low":
        return "text-blue-500";
      default:
        return "text-gray-500";
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
      className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-3 border-l-4 ${getBorderColor()}`}
    >
      <div className="flex items-start">
        <div className={`mr-3 flex-shrink-0 ${getIconColor()}`}>
          <BellAlertIcon className="w-5 h-5" />
        </div>
        <div className="flex-grow">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            {title}
          </h4>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {message}
          </p>
          <div className="mt-3 flex space-x-3">
            <button
              onClick={handleRenew}
              disabled={isRenewing}
              className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-md text-white bg-primary hover:bg-primary-dark disabled:opacity-50"
            >
              {isRenewing ? "Renewing..." : "Renew Now"}
            </button>
            <button
              onClick={handleDismiss}
              className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RenewalNotification;
