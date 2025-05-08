import { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";
import axiosInstance from "@/axios.config";
import { Dialog } from "@headlessui/react";
import { fetchXpBalance } from "@/store/slices/XPslice";
import * as Payment from "payment"; // Corrected import
import { useDispatch as useReduxDispatch } from "react-redux";
import type { AppDispatch } from "../../../../store/store";

export const useDispatch = () => useReduxDispatch<AppDispatch>();
interface ChangePlanFormProps {
  currentSubscriptionId: string;
  newMembershipId: string;
  newMembershipName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const ChangePlanForm = ({
  currentSubscriptionId,
  newMembershipId,
  newMembershipName,
  onSuccess,
  onCancel,
}: ChangePlanFormProps) => {
  const [loading, setLoading] = useState(false);
  const [showPaymentPortal, setShowPaymentPortal] = useState(false);
  const [additionalAmount, setAdditionalAmount] = useState(0);
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const cardNumberRef = useRef<HTMLInputElement>(null);
  const expiryDateRef = useRef<HTMLInputElement>(null);
  const cvvRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();

  const [errors, setErrors] = useState<{
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
  }>({});
  const [cardType, setCardType] = useState<string>("");

  useEffect(() => {
    if (cardNumberRef.current) {
      Payment.formatCardNumber(cardNumberRef.current);
    }
    if (expiryDateRef.current) {
      Payment.formatCardExpiry(expiryDateRef.current);
    }
    if (cvvRef.current) {
      Payment.formatCardCVC(cvvRef.current);
    }
  }, []);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCardNumber(value);

    // Detect card type
    const detectedType = Payment.fns.cardType(value);
    setCardType(detectedType || "");

    // Validate card number
    if (value) {
      if (!Payment.fns.validateCardNumber(value)) {
        setErrors((prev) => ({ ...prev, cardNumber: "Invalid card number" }));
      } else {
        setErrors((prev) => ({ ...prev, cardNumber: undefined }));
      }
    } else {
      setErrors((prev) => ({ ...prev, cardNumber: undefined }));
    }
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setExpiryDate(value);

    if (value) {
      const [month, year] = value.split("/");
      if (!Payment.fns.validateCardExpiry(month, year)) {
        setErrors((prev) => ({
          ...prev,
          expiryDate: "Invalid or expired date",
        }));
      } else {
        setErrors((prev) => ({ ...prev, expiryDate: undefined }));
      }
    } else {
      setErrors((prev) => ({ ...prev, expiryDate: undefined }));
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCvv(value);

    if (value) {
      if (!Payment.fns.validateCardCVC(value, cardType)) {
        setErrors((prev) => ({ ...prev, cvv: "Invalid CVV" }));
      } else {
        setErrors((prev) => ({ ...prev, cvv: undefined }));
      }
    } else {
      setErrors((prev) => ({ ...prev, cvv: undefined }));
    }
  };

  // Add validation before payment submission
  const validatePaymentForm = () => {
    const newErrors: {
      cardNumber?: string;
      expiryDate?: string;
      cvv?: string;
    } = {};

    if (!cardNumber) {
      newErrors.cardNumber = "Card number is required";
    } else if (!Payment.fns.validateCardNumber(cardNumber)) {
      newErrors.cardNumber = "Invalid card number";
    }

    if (!expiryDate) {
      newErrors.expiryDate = "Expiry date is required";
    } else {
      const [month, year] = expiryDate.split("/");
      if (!Payment.fns.validateCardExpiry(month, year)) {
        newErrors.expiryDate = "Invalid or expired date";
      }
    }

    if (!cvv) {
      newErrors.cvv = "CVV is required";
    } else if (!Payment.fns.validateCardCVC(cvv, cardType)) {
      newErrors.cvv = "Invalid CVV";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePlan = async (paymentConfirmed = false) => {
    try {
      setLoading(true);

      const response = await axiosInstance.post("/subscriptions/change-plan", {
        currentSubscriptionId,
        newMembershipId,
        paymentConfirmed,
      });

      if (response.data.success) {
        // If payment is required, show payment portal
        if (response.data.paymentRequired) {
          setAdditionalAmount(response.data.additionalAmount);
          setShowPaymentPortal(true);
          setLoading(false);
          return;
        }

        // Otherwise, plan changed successfully
        toast.success("Subscription plan changed successfully!");
        dispatch(fetchXpBalance());
        onSuccess();
      } else {
        toast.error(response.data.message || "Failed to change plan");
      }
    } catch (error: any) {
      console.error("Plan change error:", error);
      toast.error(
        error.response?.data?.message || "An error occurred while changing plan"
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = () => {
    if (!validatePaymentForm()) {
      const errorMessage =
        Object.values(errors).find((err) => err) ||
        "Please correct the card details";
      toast.error(errorMessage);
      return;
    }

    setIsProcessingPayment(true);

    setTimeout(() => {
      setIsProcessingPayment(false);

      toast.success("Payment processed successfully!");
      setShowPaymentPortal(false);

      handleChangePlan(true);
    }, 1500);
  };

  return (
    <div>
      <div className="text-center">
        <h3 className="text-lg font-medium mb-2">Change Subscription Plan</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          You are about to change to the {newMembershipName} plan.
        </p>
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => handleChangePlan()}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark disabled:opacity-50"
        >
          {loading ? "Processing..." : "Confirm Change"}
        </button>
      </div>

      {/* Payment Portal Dialog */}
      <Dialog
        open={showPaymentPortal}
        onClose={() => setShowPaymentPortal(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg p-6">
            <Dialog.Title className="text-lg font-medium mb-4">
              Payment for Plan Upgrade
            </Dialog.Title>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                <div className="flex justify-between font-semibold">
                  <span>Additional Amount:</span>
                  <span>LKR{additionalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 ${
                      errors.cardNumber ? "border-red-500" : ""
                    }`}
                    ref={cardNumberRef}
                    maxLength={19}
                  />
                  {cardType && (
                    <span className="absolute right-3 top-2 text-gray-500">
                      {cardType}
                    </span>
                  )}
                </div>
                {errors.cardNumber && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.cardNumber}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={handleExpiryDateChange}
                    className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 ${
                      errors.expiryDate ? "border-red-500" : ""
                    }`}
                    ref={expiryDateRef}
                    maxLength={5}
                  />
                  {errors.expiryDate && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.expiryDate}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    value={cvv}
                    onChange={handleCvvChange}
                    className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 ${
                      errors.cvv ? "border-red-500" : ""
                    }`}
                    ref={cvvRef}
                    maxLength={3}
                  />
                  {errors.cvv && (
                    <p className="mt-1 text-sm text-red-500">{errors.cvv}</p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPaymentPortal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePaymentSubmit}
                  disabled={isProcessingPayment}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark disabled:opacity-50"
                >
                  {isProcessingPayment ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing Payment...
                    </span>
                  ) : (
                    "Pay & Upgrade"
                  )}
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default ChangePlanForm;
