import React from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface PaymentStatusProps {
  isSuccess: boolean;
}

const PaymentStatus: React.FC<PaymentStatusProps> = ({ isSuccess }) => {
  const navigate = useNavigate();

  return (
    <>
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 text-center">
        {isSuccess ? (
          <>
            <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              Payment Successful!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Your booking has been successfully completed. You can view your
              booking details in your profile.
            </p>
            <button
              onClick={() => navigate("/profile")}
              className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200"
            >
              Go to Profile
            </button>
          </>
        ) : (
          <>
            <FaTimesCircle className="text-red-500 text-6xl mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              Payment Failed
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Unfortunately, your payment could not be processed. Kindly retry
              or report the issue to our support team.
            </p>
            <div className="mt-6 space-x-4">
              <button
                onClick={() => navigate("/")}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all duration-200"
              >
                Go to Home
              </button>
              <button
                onClick={() => alert("Reporting issue...")}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-200"
              >
                Report Issue
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default PaymentStatus;
