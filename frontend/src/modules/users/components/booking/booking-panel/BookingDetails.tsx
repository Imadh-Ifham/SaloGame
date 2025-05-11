import axiosInstance from "@/axios.config";
import { selectMachines } from "@/store/selectors/machineSelector";
import { selectFormData } from "@/store/slices/bookingSlice";
import React, { useEffect, useState } from "react";
import { FaDesktop, FaGamepad } from "react-icons/fa";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import { fromUTC } from "@/utils/date.util";
import { useNavigate } from "react-router-dom";

interface SelectedMachineDetailProps {
  setActiveTab: (tab: string) => void;
}
const BookingDetails: React.FC<SelectedMachineDetailProps> = ({
  setActiveTab,
}) => {
  const formData = useSelector(selectFormData);
  const machines = useSelector(selectMachines);
  const [totalPrice, setTotalPrice] = useState(0);
  const navigate = useNavigate();

  // Get machine serial number
  const getMachineSerialNumber = (machineID: string) => {
    const machine = machines.find((m) => m._id === machineID);
    return machine ? machine.serialNumber : machineID;
  };

  // Get machine category
  const getMachineCategory = (machineID: string) => {
    const machine = machines.find((m) => m._id === machineID);
    return machine ? machine.machineCategory : "Unknown";
  };

  const userTimezone = dayjs.tz.guess();
  // Convert UTC times to user's local timezone
  const localStartTime = fromUTC(formData.startTime, userTimezone);
  const localEndTime = formData.endTime
    ? fromUTC(formData.endTime, userTimezone)
    : "";

  // Format time to 'h:mm A' format (e.g., "9:00 PM")
  const formattedStartTime = dayjs(localStartTime).format("h:mm A");
  const formattedEndTime = dayjs(localEndTime).format("h:mm A");

  useEffect(() => {
    const calculateTotalPrice = async () => {
      try {
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
    <div className="space-y-6 p-6 border rounded-lg shadow-lg bg-white dark:bg-gray-800">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
        Booking Details
      </h2>
      <div className="space-y-2">
        <div className="flex justify-between text-gray-600 dark:text-gray-300">
          <strong className="text-gray-800 dark:text-gray-100">
            Start Time:
          </strong>
          <span>{formattedStartTime}</span>
        </div>
        <div className="flex justify-between text-gray-600 dark:text-gray-300">
          <strong className="text-gray-800 dark:text-gray-100">
            End Time:
          </strong>
          <span>{formattedEndTime}</span>
        </div>
        <div className="flex justify-between text-gray-600 dark:text-gray-300">
          <strong className="text-gray-800 dark:text-gray-100">
            Customer Name:
          </strong>
          <span>{formData.customerName}</span>
        </div>
        <div className="flex justify-between text-gray-600 dark:text-gray-300">
          <strong className="text-gray-800 dark:text-gray-100">
            Contact Number:
          </strong>
          <span>{formData.phoneNumber}</span>
        </div>
        <div className="flex justify-between text-gray-600 dark:text-gray-300">
          <strong className="text-gray-800 dark:text-gray-100">
            Total Price:
          </strong>
          <span>Rs.{totalPrice.toFixed(2)}</span>
        </div>
      </div>
      <div>
        <strong className="text-gray-800 dark:text-gray-100">
          Selected Machines:
        </strong>
        <div className="flex flex-wrap gap-4 mt-4">
          {formData.machines.map((machine, index) => {
            const category = getMachineCategory(machine.machineID);
            const isConsole = category === "Console";
            return (
              <div
                key={index}
                className="relative flex flex-col items-center bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 shadow-md w-24"
              >
                {isConsole ? (
                  <FaGamepad className="h-8 w-8 text-green-500" />
                ) : (
                  <FaDesktop className="h-8 w-8 text-green-500" />
                )}
                <span className="mt-1 text-center text-xs text-gray-700 dark:text-gray-200 font-semibold">
                  {getMachineSerialNumber(machine.machineID)}
                </span>
                {isConsole && (
                  <small className="absolute top-0 right-0 bg-green-600 text-white text-xs rounded-full px-1">
                    {machine.userCount}P
                  </small>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* Button Wrapper */}
      <div className="absolute bottom-0 left-0 w-full px-4 py-4 bg-gradient-to-t from-white dark:from-gray-900 flex justify-between">
        {/* Back Button */}
        <button
          onClick={() => setActiveTab("customer-details")}
          className={`px-6 py-2 rounded-xl text-black font-semibold transition-all duration-200 bg-primary hover:bg-primary-dark cursor-pointer`}
        >
          Back
        </button>

        {/* Book Now Button */}
        <button
          onClick={() => navigate("/payment")}
          className={`px-6 py-2 rounded-xl text-black font-semibold transition-all duration-200 bg-primary hover:bg-primary-dark cursor-pointer`}
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

export default BookingDetails;
