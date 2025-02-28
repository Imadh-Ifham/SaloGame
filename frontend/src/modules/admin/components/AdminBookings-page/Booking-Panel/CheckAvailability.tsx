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
      <div className="flex flex-wrap items-center gap-4 w-full">
        {/* Date Picker - Only for "Later" Mode */}
        <DateSelector activeNav={activeNav} />

        {/* Duration Selector */}
        <DurationSelector />

        {/* Check Availability Button */}
        <div className="w-full flex justify-center">
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
