import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axiosInstance from "../../axios.config";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubscriptionDetails from "../../modules/users/components/subscription/SubscriptionDetails";
import PaymentHistory from "../../modules/users/components/subscription/PaymentHistory";
import PaymentMethodsManager from "../../modules/users/components/subscription/PaymentMethodsManager";
import PlanOptions from "../../modules/users/components/subscription/PlanOptions";
import NotificationArea from "../../components/notifications/NotificationArea";

interface UserProfile {
  email: string;
  role?: string;
  defaultMembershipId?: {
    name: string;
    price: number;
    benefits: string[];
  };
  profileImage?: string;
  _id?: string;
}

interface UserMembershipDashboardProps {
  profile: UserProfile | null;
}

const UserMembershipDashboard: React.FC<UserMembershipDashboardProps> = ({
  profile,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userSubscription, setUserSubscription] = useState<any>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        axiosInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${token}`;
        const response = await axiosInstance.get("/subscriptions/user");

        // Find active subscription if any
        const activeSubscription = response.data.data.find(
          (sub: any) => sub.status === "active"
        );

        if (activeSubscription) {
          setUserSubscription(activeSubscription);
        }
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch subscription"
        );
        console.error("Subscription fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  const refetchUserData = async () => {
    try {
      const response = await axiosInstance.get("/subscriptions/user");

      // Find active subscription if any
      const activeSubscription = response.data.data.find(
        (sub: any) => sub.status === "active"
      );

      if (activeSubscription) {
        setUserSubscription(activeSubscription);
      } else {
        setUserSubscription(null);
      }
    } catch (error) {
      console.error("Error refetching user data:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="bg-red-500/10 text-red-500 p-4 rounded-lg border border-red-500/20">
          {error}
        </div>
      </div>
    );
  }

  if (!userSubscription) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <NotificationArea compact={true} />

        <div className="bg-gray-800/40 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50">
          <div className="py-12 text-center space-y-4">
            <div className="text-4xl">🔒</div>
            <h3 className="text-xl font-semibold text-white">
              No Active Membership
            </h3>
            <p className="text-gray-400">
              Subscribe to unlock exclusive features and benefits!
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg font-medium text-white"
              onClick={() => refetchUserData()}
            >
              Explore Membership Options
            </motion.button>
          </div>
        </div>

        <div className="bg-gray-800/40 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">
            Available Plans
          </h3>
          <PlanOptions
            currentSubscription={{
              _id: "",
              membershipId: {
                _id: "",
                name: "",
              },
            }}
            onChangePlan={refetchUserData}
          />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <NotificationArea compact={true} />

      <div className="bg-gray-800/40 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">
          Your Membership
        </h3>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="history">Payment History</TabsTrigger>
            <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
            <TabsTrigger value="plan-options">Change Plan</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <SubscriptionDetails subscription={userSubscription} />
          </TabsContent>

          <TabsContent value="history">
            {profile && <PaymentHistory userId={profile._id || ""} />}
          </TabsContent>

          <TabsContent value="payment-methods">
            <PaymentMethodsManager
              subscription={userSubscription}
              onUpdate={refetchUserData}
            />
          </TabsContent>

          <TabsContent value="plan-options">
            <PlanOptions
              currentSubscription={userSubscription}
              onChangePlan={refetchUserData}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/*<div className="bg-gray-800/40 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">
          Membership Benefits
        </h3>
        <div className="space-y-3">
          {userSubscription?.plan?.benefits?.map(
            (benefit: string, index: number) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-emerald-500 text-xs">✓</span>
                </div>
                <span className="text-gray-300">{benefit}</span>
              </div>
            )
          ) || (
            <p className="text-gray-400">
              No specific benefits listed for this plan.
            </p>
          )}
        </div>
      </div> */}
    </motion.div>
  );
};

export default UserMembershipDashboard;
