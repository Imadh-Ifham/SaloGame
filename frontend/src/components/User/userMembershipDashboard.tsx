import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FiStar, FiChevronDown, FiChevronUp, FiRefreshCw } from "react-icons/fi";
import NotificationArea from "../notifications/NotificationArea";
import axiosInstance from "@/axios.config";
import { toast } from "react-hot-toast";

interface UserMembershipDashboardProps {
  profile: {
    defaultMembershipId?: {
      name: string;
      price: number;
      benefits: string[];
    };
  } | null;
}

interface Subscription {
  _id: string;
  startDate: string;
  endDate: string;
  status: string;
  autoRenew: boolean;
  totalAmount: number;
}

const UserMembershipDashboard: React.FC<UserMembershipDashboardProps> = ({ profile }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch subscription details when component mounts
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/subscriptions');
        if (response.data.success && response.data.data.length > 0) {
          setSubscription(response.data.data[0]); // Get most recent subscription
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
        toast.error('Failed to fetch subscription details');
      } finally {
        setLoading(false);
      }
    };

    if (profile?.defaultMembershipId) {
      fetchSubscription();
    }
  }, [profile]);

  const handleRenewSubscription = async () => {
    try {
      if (!subscription?._id) return;
      setLoading(true);
      await axiosInstance.post(`/subscriptions/${subscription._id}/renew`);
      toast.success('Subscription renewed successfully');
      // Refresh subscription data
      const response = await axiosInstance.get('/subscriptions');
      if (response.data.success && response.data.data.length > 0) {
        setSubscription(response.data.data[0]);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to renew subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Membership Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/40 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-100 flex items-center gap-1.5">
            <FiStar className="text-yellow-400" size={14} />
            <span>Membership</span>
          </h3>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/memberships")}
            className="px-2 py-1 bg-emerald-500/20 rounded text-emerald-400 text-xs hover:bg-emerald-500/30 transition-colors"
          >
            {profile?.defaultMembershipId ? "Change" : "Get Plan"}
          </motion.button>
        </div>

        {profile?.defaultMembershipId ? (
          <div>
            {/* Current Plan Details */}
            <div className="grid grid-cols-2 gap-2 text-sm mb-2">
              <div className="bg-gray-900/30 rounded-lg p-2">
                <p className="text-xs text-gray-400">Plan</p>
                <p className="text-xs font-medium text-emerald-400 truncate">
                  {profile.defaultMembershipId.name}
                </p>
              </div>
              <div className="bg-gray-900/30 rounded-lg p-2">
                <p className="text-xs text-gray-400">Price</p>
                <p className="text-xs font-medium text-cyan-400">
                  LKR {profile.defaultMembershipId.price}/mo
                </p>
              </div>
            </div>

            {/* Subscription Status */}
            {subscription && (
              <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                <div className="bg-gray-900/30 rounded-lg p-2">
                  <p className="text-xs text-gray-400">Status</p>
                  <p className={`text-xs font-medium ${subscription.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>
                    {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                  </p>
                </div>
                <div className="bg-gray-900/30 rounded-lg p-2">
                  <p className="text-xs text-gray-400">Expires</p>
                  <p className="text-xs font-medium text-orange-400">
                    {new Date(subscription.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            {/* Auto-renewal and Actions */}
            {subscription?.status === 'active' && (
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-400">
                  Auto-renew: {subscription.autoRenew ? 'On' : 'Off'}
                </p>
                <button
                  onClick={handleRenewSubscription}
                  disabled={loading}
                  className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50"
                >
                  <FiRefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                  Renew Now
                </button>
              </div>
            )}

            {/* Benefits Toggle */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="mt-2 flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300"
            >
              {showDetails ? (
                <>
                  <FiChevronUp size={12} /> Hide Benefits
                </>
              ) : (
                <>
                  <FiChevronDown size={12} /> Show Benefits
                </>
              )}
            </button>

            {/* Benefits List */}
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 space-y-1"
              >
                {profile.defaultMembershipId.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-1.5 text-xs text-gray-300">
                    <span className="text-emerald-400">✓</span>
                    {benefit}
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        ) : (
          <div className="py-2 text-center space-y-1 bg-gray-900/30 rounded-lg">
            <div className="text-xl">🔒</div>
            <p className="text-xs text-gray-400">
              No active membership
            </p>
          </div>
        )}
      </motion.div>

      {/* Notifications Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/40 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50"
      >
        <h3 className="font-semibold text-gray-100 mb-4">Notifications</h3>
        <div className="max-h-48 overflow-y-auto">
          <NotificationArea compact={true} />
        </div>
      </motion.div>
    </div>
  );
};

export default UserMembershipDashboard;