import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchUserNotifications } from "@/store/slices/notificationSlice";
import RenewalNotification from "./RenewalNotification";

const NotificationArea: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: notifications, loading } = useSelector(
    (state: RootState) => state.notification
  );

  useEffect(() => {
    dispatch(fetchUserNotifications());
    // Refresh notifications every 12 hours
    const interval = setInterval(() => {
      dispatch(fetchUserNotifications());
    }, 12 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [dispatch]);

  // Filter and sort notifications
  const renewalNotifications = notifications
    .filter((notification) => notification.type === "renewal")
    .sort((a, b) => {
      // Sort by severity (high -> medium -> low)
      const severityOrder = { high: 0, medium: 1, low: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });

  if (loading && renewalNotifications.length === 0) {
    return (
      <div className="p-4">
        <div className="animate-pulse h-16 bg-gray-800/50 dark:bg-gray-700/50 rounded-md border border-emerald-500/20"></div>
      </div>
    );
  }

  if (renewalNotifications.length === 0) {
    return (
      <div className="mb-6 p-4 bg-gray-800/30 dark:bg-gray-800/50 rounded-lg border border-emerald-500/20 backdrop-blur-sm">
        <p className="text-sm text-gray-400 dark:text-gray-400">No active notifications</p>
      </div>
    );
  }

  return (
    <div className="mb-6 space-y-4">
      <h3 className="text-lg font-semibold text-emerald-400 dark:text-emerald-400 font-orbitron">
        Membership Notifications
      </h3>
      <div className="space-y-3">
        {renewalNotifications.map((notification) => (
          <RenewalNotification
            key={notification.id}
            id={notification.id}
            title={notification.title}
            message={notification.message}
            severity={notification.severity}
            subscriptionId={notification.subscriptionId || ""}
          />
        ))}
      </div>
    </div>
  );
};

export default NotificationArea;