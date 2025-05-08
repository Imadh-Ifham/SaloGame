import React, { useState, useEffect } from "react";
import axiosInstance from "@/axios.config";
import { toast } from "react-hot-toast";
import NeonGradientCard from "@/components/ui/NeonGradientCard";
import { Dialog } from "@headlessui/react";
import ChangePlanForm from "./ChangePlanForm";
interface MembershipPlan {
  _id: string;
  name: string;
  price: number;
  benefits: string[];
  isActive: boolean;
  color?: string;
}

interface PlanOptionsProps {
  currentSubscription: {
    _id: string;
    membershipId: {
      _id: string;
      name: string;
    };
  };
  onChangePlan: () => void;
}

const PlanOptions: React.FC<PlanOptionsProps> = ({
  currentSubscription,
  onChangePlan,
}) => {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [changingPlan, setChangingPlan] = useState(false);
  const [confirmPlanId, setConfirmPlanId] = useState<string | null>(null);
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/memberships?isActive=true");
        if (Array.isArray(response.data)) {
          // Add colors to the plans
          const coloredPlans = response.data.map((plan, index) => ({
            ...plan,
            color: getColor(index),
          }));
          setPlans(coloredPlans);
        }
      } catch (error) {
        toast.error("Failed to load membership plans");
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const getColor = (index: number) => {
    const colors = ["#6EE5A8", "#6AA8FF", "#F471B5", "#CDA5FF"];
    return colors[index % colors.length];
  };

  const handlePlanClick = (plan: MembershipPlan) => {
    setSelectedPlan(plan);
    setShowChangePlanModal(true);
  };

  const handleChangePlan = async (planId: string) => {
    try {
      setChangingPlan(true);
      await axiosInstance.post(`/subscriptions/change-plan`, {
        currentSubscriptionId: currentSubscription._id,
        newMembershipId: planId,
      });

      toast.success("Successfully changed your membership plan");
      onChangePlan(); // Refresh data
      setConfirmPlanId(null);
    } catch (error) {
      toast.error("Failed to change membership plan");
    } finally {
      setChangingPlan(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="p-6 text-center text-gray-400">
        <p>No membership plans available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-300">
          <strong>Note:</strong> Changing your plan will take effect
          immediately. You'll be charged the price difference if upgrading, or
          receive credit for future payments if downgrading.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans
          .filter((plan) => plan._id !== currentSubscription.membershipId._id)
          .map((plan) => (
            <NeonGradientCard
              key={plan._id}
              color={plan.color || "#6EE5A8"}
              className="h-full"
            >
              <div className="p-6 flex flex-col h-full">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-2xl font-bold text-white mb-4">
                    <span className="text-sm">LKR </span>
                    {plan.price}
                    <span className="text-sm"> / month</span>
                  </p>

                  <ul className="mt-4 space-y-2">
                    {plan.benefits.map((benefit, index) => (
                      <li
                        key={index}
                        className="flex items-center text-sm text-gray-300"
                      >
                        <span className="mr-2 text-gamer-green">✔</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => handlePlanClick(plan)}
                    disabled={changingPlan}
                    className="w-full px-4 py-2 bg-transparent border border-primary text-primary rounded hover:bg-primary/10 transition-colors disabled:opacity-50"
                  >
                    Switch to This Plan
                  </button>
                </div>
              </div>
            </NeonGradientCard>
          ))}
      </div>

      {/* Current plan indicator */}
      <div className="mt-8 p-4 bg-gray-800/50 rounded-lg">
        <p className="text-center text-gray-400">
          You are currently on the{" "}
          <span className="text-white font-medium">
            {currentSubscription.membershipId.name}
          </span>{" "}
          plan
        </p>
      </div>

      {/* Change Plan Modal */}
      <Dialog
        open={showChangePlanModal}
        onClose={() => setShowChangePlanModal(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md bg-gray-800 rounded-lg p-6">
            {selectedPlan && (
              <ChangePlanForm
                currentSubscriptionId={currentSubscription._id}
                newMembershipId={selectedPlan._id}
                newMembershipName={selectedPlan.name}
                onSuccess={() => {
                  setShowChangePlanModal(false);
                  onChangePlan(); // Refresh data
                }}
                onCancel={() => {
                  setShowChangePlanModal(false);
                }}
              />
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default PlanOptions;
