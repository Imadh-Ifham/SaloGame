// src/modules/users/components/SubscriptionForm.tsx
import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import axiosInstance from "@/axios.config";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

interface SubscriptionFormProps {
  isOpen: boolean;
  onClose: () => void;
  membershipId: string;
  membershipName: string;
  price: number;
}
const calculateTotalPrice = (monthlyPrice: number, duration: number) => {
  return monthlyPrice * duration;
};
const SubscriptionForm: React.FC<SubscriptionFormProps> = ({
  isOpen,
  onClose,
  membershipId,
  membershipName,
  price,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState(1); // Default 1 month
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const totalPrice = calculateTotalPrice(price, duration);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get auth token
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please sign in to subscribe");
        navigate("/auth");
        return;
      }

      // Set auth header
      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;

      // Make API call to create subscription
      const response = await axiosInstance.post("/subscriptions", {
        membershipId,
        duration,
        totalAmount: totalPrice,
        startDate: new Date(),
        endDate: new Date(Date.now() + duration * 30 * 24 * 60 * 60 * 1000), // Calculate end date based on duration
      });

      const responseData = response.data as {
        success: boolean;
        message?: string;
      };
      if (responseData.success) {
        // Show success message
        toast.success("Subscription confirmed successfully!");

        // Close both modals
        setShowConfirmation(false);
        onClose();

        // Redirect to profile page
        navigate("/profile");
      } else {
        const errorMessage =
          (response.data as { message?: string }).message ||
          "Failed to confirm subscription";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("An error occurred while processing your subscription");
    } finally {
      setLoading(false);
    }
  };

  // Show error message if present
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md transform rounded-2xl bg-white dark:bg-gray-800 p-6 text-left shadow-xl transition-all">
          <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Subscribe to {membershipName}
          </Dialog.Title>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Subscription Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              >
                <option value={1}>1 Month</option>
                <option value={3}>3 Months</option>
                <option value={6}>6 Months</option>
                <option value={12}>12 Months</option>
              </select>
            </div>

            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
              <div className="flex justify-between text-sm">
                <span>Monthly Price:</span>
                <span>${price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span>Duration:</span>
                <span>{duration} months</span>
              </div>
              <div className="flex justify-between font-semibold mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                <span>Total Price:</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmation(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark"
              >
                Continue
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-lg p-6">
            <Dialog.Title className="text-lg font-medium mb-4">
              Confirm Subscription
            </Dialog.Title>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Are you sure you want to subscribe to {membershipName} for{" "}
              {duration} months at ${totalPrice.toFixed(2)}?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark disabled:opacity-50"
              >
                {loading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </Dialog>
  );
};
export default SubscriptionForm;
