import React, { useState } from "react";
import XPDisplay from "../../layout/XPDisplay";
import { createBooking } from "@/store/thunks/bookingThunk";
import { AppDispatch } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import { selectFormData } from "@/store/slices/bookingSlice";

interface PaymentOptionProps {
  xpBalance: number;
  totalPrice: number;
  setActiveTab: (tab: string) => void;
  setPaymentStatus: (status: boolean) => void;
}
const PaymentOption: React.FC<PaymentOptionProps> = ({
  xpBalance,
  totalPrice,
  setActiveTab,
  setPaymentStatus,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const formData = useSelector(selectFormData);
  const [isLoading, setIsLoading] = useState(false);

  const handleQuickPay = async () => {
    setIsLoading(true); // Set loading state to true
    try {
      await dispatch(
        createBooking({ formData, mode: "user", paymentType: "XP" })
      ).unwrap();
      setPaymentStatus(true); // Pass success status to parent
      setActiveTab("status");
    } catch (error) {
      setPaymentStatus(false); // Pass failure status to parent
      console.error("Booking failed:", error);
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 text-center mb-6">
        Choose Your Payment Method
      </h1>
      <div className="space-y-6">
        {/* Pay with XP */}
        <div className="flex flex-col items-center bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700 rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-200">
          <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-300">
            Pay with XP
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2">
            Use your in-game currency to complete the payment.
          </p>
          <div className="mt-4 flex items-center justify-center gap-6">
            {/* XP Balance */}
            <XPDisplay xpBalance={xpBalance} showTooltip={false} />
          </div>
          <button
            onClick={handleQuickPay}
            disabled={isLoading} // Disable button while loading
            className={`mt-6 px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
              isLoading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isLoading ? "Processing..." : `Quick Pay with ${totalPrice} XP`}
          </button>
        </div>

        {/* Pay with Credit/Debit Card */}
        <div className="flex flex-col items-center bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-200">
          <h2 className="text-lg font-semibold text-green-800 dark:text-green-300">
            Pay with Credit/Debit Card
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2">
            Use your credit or debit card to complete the payment securely.
          </p>
          <button className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-200 cursor-pointer">
            Proceed with Card
          </button>
        </div>
      </div>
    </>
  );
};

export default PaymentOption;
