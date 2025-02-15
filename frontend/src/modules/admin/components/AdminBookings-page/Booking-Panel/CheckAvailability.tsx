import {
  CustomerBooking,
  selectBookingStatus,
  selectFormData,
  updateBookingForm,
} from "@/store/slices/bookingSlice";
import { AppDispatch } from "@/store/store";
import { fetchFirstAndNextBookings } from "@/store/thunks/bookingThunk";
import { Button } from "antd";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DurationSelector from "./DurationSelector";
import DateSelector from "./DateSelector";
import { getCurrentUTC, toUTC } from "@/utils/date.util";

const CheckAvailability: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const formData = useSelector(selectFormData);
  const { loading } = useSelector(selectBookingStatus);
  const [activeNav, setActiveNav] = useState<"Now" | "Later">("Now");

  const handleCheckAvailability = () => {
    dispatch(
      fetchFirstAndNextBookings({
        startTime: formData.startTime
          ? toUTC(formData.startTime)
          : getCurrentUTC(),
        duration: formData.duration,
      })
    );

    if (activeNav === "Now") {
      dispatch(
        updateBookingForm({
          startTime: getCurrentUTC(),
        } as Partial<CustomerBooking>)
      );
    }
  };

  const handleBookingNavChange = (nav: "Now" | "Later") => {
    setActiveNav(nav);
    if (nav === "Now") {
      dispatch(
        updateBookingForm({
          startTime: getCurrentUTC(),
        } as Partial<CustomerBooking>)
      );
    }
  };

  return (
    <>
      {/* Navigation buttons */}
      <div className="flex gap-3 bg-gray-100 p-2 rounded-lg mb-4">
        {["Now", "Later"].map((item) => (
          <Button
            key={item}
            type={activeNav === item ? "primary" : "default"}
            onClick={() => handleBookingNavChange(item as "Now" | "Later")}
            className={`flex-1 py-2 rounded-lg text-base font-medium transition-all duration-300 ${
              activeNav === item
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-gray-200"
            }`}
          >
            {item}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2 w-full relative">
        {/* Date Picker - Only for "Later" Mode */}
        <div
          className={`transition-all duration-700 ease-in-out transform w-full ${
            activeNav === "Later"
              ? "opacity-100 max-h-64 translate-y-0"
              : "opacity-0 max-h-0 -translate-y-4"
          } overflow-hidden`}
          style={{
            transitionDelay: activeNav === "Later" ? "0ms" : "200ms", // Delay hiding for smoother transition
          }}
        >
          <DateSelector activeNav={activeNav} />
        </div>

        {/* Duration Selector */}
        <div
          className={`transition-all duration-700 ease-in-out transform w-full ${
            activeNav === "Later" ? "translate-y-2" : "translate-y-0"
          }`}
        >
          <DurationSelector />
        </div>

        {/* Check Availability Button */}
        <div className="w-full flex justify-center mt-4">
          <Button
            type="primary"
            onClick={handleCheckAvailability}
            className="w-52 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
          >
            {loading ? "Checking..." : "Check Availability"}
          </Button>
        </div>
      </div>
    </>
  );
};

export default CheckAvailability;
