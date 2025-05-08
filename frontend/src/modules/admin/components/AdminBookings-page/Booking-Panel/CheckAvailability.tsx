import {
  selectActiveNav,
  selectBookingStatus,
  selectFormData,
  setActiveNav,
  updateBookingForm,
} from "@/store/slices/bookingSlice";
import { AppDispatch } from "@/store/store";
import { Button } from "antd";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import DurationSelector from "./DurationSelector";
import DateSelector from "./DateSelector";
import { getCurrentUTC, toUTC } from "@/utils/date.util";
import "react-datepicker/dist/react-datepicker.css"; // Ensure CSS is imported
import { selectSelectedMachine } from "@/store/selectors/machineSelector";
import {
  fetchFirstAndNextBooking,
  fetchMachineStatus,
} from "@/store/thunks/bookingThunk";
import { CustomerBooking } from "@/types/booking";

const CheckAvailability: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const formData = useSelector(selectFormData);
  const { loading } = useSelector(selectBookingStatus);
  const activeNav = useSelector(selectActiveNav);
  const selectedMachine = useSelector(selectSelectedMachine);

  const handleCheckAvailability = () => {
    if (activeNav === "Now") {
      dispatch(
        updateBookingForm({
          startTime: getCurrentUTC(),
        } as Partial<CustomerBooking>)
      );
    }
    dispatch(
      fetchMachineStatus({
        startTime: formData.startTime
          ? toUTC(formData.startTime)
          : getCurrentUTC(),
        duration: formData.duration,
      })
    );
  };

  useEffect(() => {
    if (selectedMachine) {
      dispatch(
        fetchFirstAndNextBooking({
          startTime: formData.startTime
            ? toUTC(formData.startTime)
            : getCurrentUTC(),
          duration: formData.duration,
          machineID: selectedMachine._id,
        })
      );
    }
    dispatch(
      fetchMachineStatus({
        startTime: formData.startTime
          ? toUTC(formData.startTime)
          : getCurrentUTC(),
        duration: formData.duration,
      })
    ); // Fetch machine status when selected machine changes
  }, [selectedMachine, formData.startTime, formData.duration]);

  const handleBookingNavChange = (nav: "Now" | "Later") => {
    dispatch(setActiveNav(nav));
    if (nav === "Now") {
      dispatch(
        updateBookingForm({
          startTime: getCurrentUTC(),
          status: "InUse",
        } as Partial<CustomerBooking>)
      );
    } else {
      dispatch(
        updateBookingForm({
          status: "Booked",
        } as Partial<CustomerBooking>)
      );
    }
  };

  return (
    <div className="w-full max-w-full box-border">
      {/* Navigation buttons */}
      <div className="flex gap-3 border dark:border-gray-500  p-2 rounded-lg mb-4 shadow-sm">
        {["Now", "Later"].map((item) => (
          <Button
            key={item}
            type={activeNav === item ? "primary" : "default"}
            onClick={() => handleBookingNavChange(item as "Now" | "Later")}
            className={`flex-1 py-2 rounded-lg text-base font-medium transition-all duration-300 ${
              activeNav === item
                ? "bg-blue-600 dark:bg-primary text-white shadow-md"
                : "bg-white dark:bg-gray-700 hover:bg-gray-200 hover:dark:bg-gray-600 text-gray-700 dark:text-gray-50 dark:border-gray-600"
            }`}
          >
            {item}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2 w-full relative box-border">
        {/* Date Picker - Only for "Later" Mode */}

        <DateSelector activeNav={activeNav} />

        {/* Duration Selector */}
        <div
          className={`transition-all duration-700 ease-in-out transform w-full ${
            activeNav === "Later" ? "translate-y-2" : "translate-y-0"
          } box-border`}
        >
          <DurationSelector />
        </div>

        {/* Check Availability Button */}
        <div className="w-full flex justify-center mt-4 box-border">
          <Button
            type="primary"
            onClick={handleCheckAvailability}
            className="w-full py-2 text-white bg-blue-600 dark:bg-primary rounded-lg hover:bg-blue-700 transition shadow-lg"
          >
            {loading ? "Checking..." : "Check Availability"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckAvailability;
