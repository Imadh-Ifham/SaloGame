import React, { useState, useEffect, useRef } from "react";
import { Dialog } from "@headlessui/react";
import axiosInstance from "@/axios.config";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useDispatch as useReduxDispatch } from "react-redux";
import type { AppDispatch } from "../../../store/store";
import { fetchXpBalance } from "@/store/slices/XPslice";
import Payment from "payment";

interface SubscriptionFormProps {
  isOpen: boolean;
  onClose: () => void;
  membershipId: string;
  membershipName: string;
  price: number;
}

const checkExistingSubscription = async (): Promise<boolean> => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return false;

    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    const response = await axiosInstance.get("/subscriptions/user");

    const subscriptions = response.data.data;
    // Check if user has any active subscription
    return subscriptions.some((sub: any) => sub.status === "active");
  } catch (error) {
    console.error("Error checking subscriptions:", error);
    return false;
  }
};

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

  const [showPaymentPortal, setShowPaymentPortal] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const [autoRenew, setAutoRenew] = useState(false);

  const [cardType, setCardType] = useState<string>("");
  const [errors, setErrors] = useState<{
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
  }>({});
  const [saveCardDetails, setSaveCardDetails] = useState(false);
  const cardNumberRef = useRef<HTMLInputElement>(null);
  const expiryDateRef = useRef<HTMLInputElement>(null);
  const cvvRef = useRef<HTMLInputElement>(null);
  const dispatch = useReduxDispatch<AppDispatch>();

  const handlePaymentSubmit = () => {
    if (!validatePaymentForm()) {
      const errorMessage =
        Object.values(errors).find((err) => err) ||
        "Please correct the card details";
      toast.error(errorMessage);
      return;
    }

    // Simulate payment processing
    setIsProcessingPayment(true);

    setTimeout(() => {
      setIsProcessingPayment(false);

      // Simulate 80% success, 20% failure rate
      const isSuccessful = Math.random() <= 0.8;

      if (isSuccessful) {
        checkExistingSubscription().then((hasActive) => {
          if (hasActive) {
            toast.error(
              "You already have an active subscription. Please cancel your current subscription before subscribing to a new plan."
            );
            setShowPaymentPortal(false);
            setShowConfirmation(false);
            return;
          }

          // Only show success and proceed if no active subscription
          toast.success("Payment processed successfully!");
          setShowPaymentPortal(false);
          handleSubmit();
        });
      } else {
        toast.error(
          "Payment failed. Please try again or use a different payment method."
        );
      }
    }, 2000);
  };

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

      // Check if user already has an active subscription
      const hasActiveSubscription = await checkExistingSubscription();

      if (hasActiveSubscription) {
        toast.error(
          "You already have an active subscription. Please cancel your current subscription before subscribing to a new plan."
        );
        setShowPaymentPortal(false);
        setShowConfirmation(false);
        setLoading(false);
        return;
      }

      // Make API call to create subscription
      const response = await axiosInstance.post("/subscriptions", {
        membershipId,
        duration,
        totalAmount: totalPrice,
        startDate: new Date(),
        endDate: new Date(Date.now() + duration * 30 * 24 * 60 * 60 * 1000), // Calculate end date based on duration
        autoRenew,
        paymentDetails: saveCardDetails
          ? {
              cardNumber,
              expiryDate,
            }
          : undefined,
      });

      const responseData = response.data as {
        success: boolean;
        message?: string;
      };

      if (responseData.success) {
        // Show success message
        toast.success(
          `Subscription to ${membershipName} confirmed successfully!`
        );
        dispatch(fetchXpBalance());

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

    if (cardNumberRef.current) {
      Payment.formatCardNumber(cardNumberRef.current);
    }
    if (expiryDateRef.current) {
      Payment.formatCardExpiry(expiryDateRef.current);
    }
    if (cvvRef.current) {
      Payment.formatCardCVC(cvvRef.current);
    }
  }, [error]);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numericValue = inputValue.replace(/[^\d\s]/g, "");

    if (inputValue !== numericValue) {
      e.target.value = numericValue; // Update input field if non-numeric chars were entered
    }
    const value = numericValue.replace(/\s+/g, ""); // Remove spaces
    const formattedValue = value.replace(/(\d{4})(?=\d)/g, "$1 "); // Add space every 4 digits
    setCardNumber(formattedValue);

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

  // Handle expiry date change with validation
  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numericWithSlash = inputValue.replace(/[^\d/]/g, "");

    if (inputValue !== numericWithSlash) {
      e.target.value = numericWithSlash; // Update if non-numeric chars were entered
    }

    const value = numericWithSlash.replace(/\s+/g, ""); // Remove spaces
    let formattedValue = value;

    if (value.length >= 2 && !value.includes("/")) {
      formattedValue = value.slice(0, 2) + "/" + value.slice(2);
    }

    if (formattedValue.length <= 5) {
      setExpiryDate(formattedValue);
    }

    if (value) {
      // Parse expiry date
      const [month, year] = value.split("/");

      // Validate expiry date
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

  // Handle CVV change with validation
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numericValue = inputValue.replace(/\D/g, "");

    if (inputValue !== numericValue) {
      e.target.value = numericValue; // Update if non-numeric chars were entered
    }

    setCvv(numericValue);

    if (numericValue) {
      if (!Payment.fns.validateCardCVC(numericValue, cardType)) {
        setErrors((prev) => ({ ...prev, cvv: "Invalid CVV" }));
      } else {
        setErrors((prev) => ({ ...prev, cvv: undefined }));
      }
    } else {
      setErrors((prev) => ({ ...prev, cvv: undefined }));
    }
  };

  // Enhanced payment validation
  const validatePaymentForm = () => {
    const newErrors: {
      cardNumber?: string;
      expiryDate?: string;
      cvv?: string;
    } = {};

    // Check card number
    if (!cardNumber) {
      newErrors.cardNumber = "Card number is required";
    } else if (!Payment.fns.validateCardNumber(cardNumber)) {
      newErrors.cardNumber = "Invalid card number";
    }

    // Check expiry date
    if (!expiryDate) {
      newErrors.expiryDate = "Expiry date is required";
    } else {
      const [month, year] = expiryDate.split("/");
      if (!Payment.fns.validateCardExpiry(month, year)) {
        newErrors.expiryDate = "Invalid or expired date";
      }
    }

    // Check CVV
    if (!cvv) {
      newErrors.cvv = "CVV is required";
    } else if (!Payment.fns.validateCardCVC(cvv, cardType)) {
      newErrors.cvv = "Invalid CVV";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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

              <div className="flex items-center mt-4">
                <input
                  type="checkbox"
                  id="autoRenew"
                  checked={autoRenew}
                  onChange={(e) => setAutoRenew(e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label
                  htmlFor="autoRenew"
                  className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                >
                  Enable auto-renewal (your subscription will automatically
                  renew when it expires)
                </label>
              </div>

              {autoRenew && (
                <div className="flex items-center mt-2 ml-6">
                  <input
                    type="checkbox"
                    id="saveCard"
                    checked={saveCardDetails}
                    onChange={(e) => setSaveCardDetails(e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label
                    htmlFor="saveCard"
                    className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                  >
                    Save card details for auto-renewal
                  </label>
                </div>
              )}
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
                onClick={() => {
                  setShowConfirmation(false);
                  setShowPaymentPortal(true);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark"
              >
                Proceed to Payment
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

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
              Payment for {membershipName} Subscription
            </Dialog.Title>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                <div className="flex justify-between font-semibold">
                  <span>Total Amount:</span>
                  <span>LKR.{totalPrice.toFixed(2)}</span>
                </div>
              </div>

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
                <p className="mt-1 text-sm text-red-500">{errors.cardNumber}</p>
              )}

              <div className="grid grid-cols-2 gap-4 mt-4">
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
                    maxLength={4}
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
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
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
                      Processing...
                    </span>
                  ) : (
                    "Pay Now"
                  )}
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </Dialog>
  );
};
export default SubscriptionForm;
