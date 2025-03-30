import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { FiAlertTriangle, FiUsers, FiArrowRight } from "react-icons/fi";

interface DeprecatePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  planName: string;
  subscriberCount: number;
  onDeprecate: (planId: string, migrationPlanId?: string) => Promise<void>;
  availablePlans: Array<{ _id: string; name: string }>;
}

const DeprecatePlanModal: React.FC<DeprecatePlanModalProps> = ({
  isOpen,
  onClose,
  planId,
  planName,
  subscriberCount,
  onDeprecate,
  availablePlans,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [disableAutoRenewal, setDisableAutoRenewal] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onDeprecate(planId, selectedPlan || undefined);
      onClose();
    } catch (error) {
      console.error("Failed to deprecate plan:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => !loading && onClose()}
      className="relative z-50"
    >
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
        aria-hidden="true"
      />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          <div className="bg-orange-100 dark:bg-orange-900/20 p-4 flex items-start space-x-4">
            <FiAlertTriangle className="h-6 w-6 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-medium text-orange-800 dark:text-orange-300">
                Deprecate Membership Plan
              </h3>
              <p className="mt-1 text-sm text-orange-700 dark:text-orange-200">
                This will make "{planName}" unavailable for new subscribers.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {subscriberCount > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg">
                <div className="flex items-center text-blue-700 dark:text-blue-300 mb-2">
                  <FiUsers className="mr-2" />
                  <span className="font-medium">
                    This plan has {subscriberCount} active subscribers
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="disableAutoRenewal"
                      checked={disableAutoRenewal}
                      onChange={(e) => setDisableAutoRenewal(e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="disableAutoRenewal"
                      className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                    >
                      Disable auto-renewal for existing subscribers
                    </label>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Migrate existing subscribers to: (optional)
                    </label>
                    <select
                      value={selectedPlan}
                      onChange={(e) => setSelectedPlan(e.target.value)}
                      className="w-full px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    >
                      <option value="">
                        Don't migrate (let them use until expiry)
                      </option>
                      {availablePlans
                        .filter((plan) => plan._id !== planId)
                        .map((plan) => (
                          <option key={plan._id} value={plan._id}>
                            {plan.name}
                          </option>
                        ))}
                    </select>

                    {selectedPlan && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <FiArrowRight className="mr-2" />
                        <span>
                          Users will be migrated to the new plan when their
                          current subscription expires
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                This action can't be undone, but the plan will remain in the
                database for historical data purposes.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Deprecate Plan"}
                </button>
              </div>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default DeprecatePlanModal;
