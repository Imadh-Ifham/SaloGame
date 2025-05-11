import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import axiosInstance from "@/axios.config";
import { selectFormData } from "@/store/slices/bookingSlice";
import { selectMachines } from "@/store/selectors/machineSelector";
import PaymentOption from "../components/payment/PaymentOption";
import PaymentStatus from "../components/payment/PaymentStatus";

const PaymentPage: React.FC = () => {
  const xpBalance = useSelector((state: RootState) => state.xp.xpBalance);
  const formData = useSelector(selectFormData);
  const machines = useSelector(selectMachines);
  const [totalPrice, setTotalPrice] = useState(0);
  const [activeTab, setActiveTab] = useState("options");
  const [paymentStatus, setPaymentStatus] = useState(false);

  useEffect(() => {
    const calculateTotalPrice = async () => {
      try {
        console.log("Calculating total price with formData:", formData);
        const response = await axiosInstance.post("/currency/calculate-price", {
          startTime: formData.startTime,
          endTime: formData.endTime,
          machines: formData.machines,
        });
        console.log("Total Price Response:", response.data);

        setTotalPrice(response.data);
      } catch (error) {
        console.error("Error fetching total price:", error);
        setTotalPrice(0); // Reset to 0 in case of error
      }
    };
    calculateTotalPrice();
  }, [machines, formData.startTime, formData.endTime, formData.machines]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        {activeTab === "options" && (
          <PaymentOption
            xpBalance={xpBalance}
            totalPrice={totalPrice}
            setActiveTab={setActiveTab}
            setPaymentStatus={setPaymentStatus}
          />
        )}
        {activeTab === "status" && <PaymentStatus isSuccess={paymentStatus} />}
      </div>
    </div>
  );
};

export default PaymentPage;
