import {
  selectBookingStatus,
  selectFormData,
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

const CheckAvailability: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const formData = useSelector(selectFormData);
  const { loading } = useSelector(selectBookingStatus);
  const selectedMachine = useSelector(selectSelectedMachine);

  const handleCheckAvailability = () => {
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

  return (
    <div className="w-full max-w-full box-border">
      
      <div className="flex flex-wrap items-center gap-2 w-full relative box-border">
        {/* Date Picker - Only for "Later" Mode */}

        <DateSelector activeNav={"Later"} />

        {/* Duration Selector */}
        <div
          className={`transition-all duration-700 ease-in-out transform w-full translate-y-2 box-border`}
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
