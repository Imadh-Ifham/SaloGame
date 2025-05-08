import React, { useState, useRef, useEffect } from "react";
import { FiCreditCard, FiTrash2, FiPlus } from "react-icons/fi";
import { toast } from "react-hot-toast";
import axiosInstance from "@/axios.config";
import { useDispatch as useReduxDispatch } from "react-redux";
import type { AppDispatch } from "../../../../store/store";

import { fetchXpBalance } from "@/store/slices/XPslice";
import Payment from "payment";

interface PaymentMethodsManagerProps {
  subscription: {
    _id: string;
    paymentDetails?: {
      cardNumber?: string;
      expiryDate?: string;
    };
    autoRenew: boolean;
  };
  onUpdate: () => void;
}

const PaymentMethodsManager: React.FC<PaymentMethodsManagerProps> = ({
  subscription,
  onUpdate,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);
  const [cardType, setCardType] = useState<string>("");
  const [errors, setErrors] = useState<{
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
  }>({});

  // Create refs for input formatting
  const cardNumberRef = useRef<HTMLInputElement>(null);
  const expiryDateRef = useRef<HTMLInputElement>(null);
  const cvvRef = useRef<HTMLInputElement>(null);

  const dispatch: AppDispatch = useReduxDispatch();

  // Initialize Payment.js formatting on component mount
  useEffect(() => {
    if (cardNumberRef.current) {
      Payment.formatCardNumber(cardNumberRef.current);
    }
    if (cvvRef.current) {
      Payment.formatCardCVC(cvvRef.current);
    }
  }, [showAddForm]);

  const formatCardNumber = (number: string) => {
    if (!number) return "No card saved";
    return `**** **** **** ${number.slice(-4)}`;
  };

  // Card number validation and formatting
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCardNumber(value);

    const detectedType = Payment.fns.cardType(value);
    setCardType(detectedType || "");

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

  // Expiry date validation
  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    let formattedValue = inputValue;

    if (!inputValue.includes("/") && inputValue.length >= 2) {
      formattedValue = inputValue.slice(0, 2) + "/" + inputValue.slice(2);
    }

    setExpiryDate(formattedValue);

    if (formattedValue) {
      const [month, year] = formattedValue.split("/");

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

  // CVV validation
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

  // Complete validation before submission
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

  const handleSaveCard = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePaymentForm()) {
      const errorMessage =
        Object.values(errors).find((err) => err) ||
        "Please correct the card details";
      toast.error(errorMessage);
      return;
    }

    try {
      setLoading(true);
      const paymentDetails = {
        cardNumber,
        expiryDate,
      };

      // Call the API to update payment method
      const response = await axiosInstance.patch(
        `/subscriptions/${subscription._id}/payment-method`,
        { paymentDetails }
      );

      if (response.data.success) {
        toast.success("Payment method updated successfully");
        dispatch(fetchXpBalance());

        setShowAddForm(false);

        setCardNumber("");
        setExpiryDate("");
        setCvv("");

        onUpdate();
      }
    } catch (error) {
      console.error("Error saving card:", error);
      toast.error("Failed to save payment method");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCard = async () => {
    try {
      setLoading(true);
      await axiosInstance.delete(
        `/subscriptions/${subscription._id}/payment-method`
      );

      toast.success("Payment method removed");
      onUpdate();
    } catch (error) {
      toast.error("Failed to remove payment method");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Saved Payment Methods
        </h3>

        {subscription.paymentDetails?.cardNumber ? (
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <FiCreditCard className="text-primary text-xl" />
              <div>
                <p className="text-white">
                  {formatCardNumber(subscription.paymentDetails.cardNumber)}
                </p>
                <p className="text-sm text-gray-400">
                  Expires: {subscription.paymentDetails.expiryDate}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  // Pre-fill the form with masked values
                  setCardNumber(subscription.paymentDetails?.cardNumber || "");
                  setExpiryDate(subscription.paymentDetails?.expiryDate || "");
                  setShowAddForm(true);
                }}
                disabled={loading}
                className="p-2 text-blue-400 hover:text-blue-300 disabled:opacity-50"
                title="Edit card details"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>

              <button
                onClick={handleRemoveCard}
                disabled={loading}
                className="p-2 text-red-400 hover:text-red-300 disabled:opacity-50"
                title="Remove card"
              >
                <FiTrash2 />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-400">No payment methods saved</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 flex items-center justify-center mx-auto px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              <FiPlus className="mr-2" /> Add Payment Method
            </button>
          </div>
        )}
      </div>

      {showAddForm && (
        <div className="bg-gray-800/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            {subscription.paymentDetails?.cardNumber ? "Edit" : "Add"} Payment
            Method
          </h3>

          <form onSubmit={handleSaveCard} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Card Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  ref={cardNumberRef}
                  className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-white ${
                    errors.cardNumber ? "border-red-500" : ""
                  }`}
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Expiry Date
                </label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={handleExpiryDateChange}
                  ref={expiryDateRef}
                  className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-white ${
                    errors.expiryDate ? "border-red-500" : ""
                  }`}
                  maxLength={5}
                />
                {errors.expiryDate && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.expiryDate}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  CVV
                </label>
                <input
                  type="text"
                  placeholder="123"
                  value={cvv}
                  onChange={handleCvvChange}
                  ref={cvvRef}
                  className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-white ${
                    errors.cvv ? "border-red-500" : ""
                  }`}
                  maxLength={4}
                />
                {errors.cvv && (
                  <p className="mt-1 text-sm text-red-500">{errors.cvv}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Card"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notice about auto-renewal */}
      {subscription.autoRenew && (
        <div className="p-4 bg-blue-900/20 border border-blue-800/30 rounded-lg">
          <p className="text-sm text-blue-300">
            <strong>Note:</strong> Your saved payment method will be used for
            automatic renewals.
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodsManager;
