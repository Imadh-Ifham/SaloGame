import { selectFormData, updateBookingForm } from "@/store/slices/bookingSlice";
import { AppDispatch } from "@/store/store";
import { ClockCircleOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const durations = [
  { value: 30, label: "30 minutes" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1 hour 30 min" },
  { value: 120, label: "2 hours" },
  { value: 150, label: "2 hours 30 min" },
  { value: 180, label: "3 hours" },
];

const DurationSelector: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const formData = useSelector(selectFormData);

  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (value: number) => {
    dispatch(updateBookingForm({ duration: value }));
    setIsOpen(false); // Close the dropdown after selection
  };

  return (
    <div className="flex-1 w-full">
      <div className="relative border dark:border-gray-500 rounded-lg px-3 py-2 dark:bg-gray-800">
        {/* Custom Select input */}
        <div
          className="w-full bg-transparent dark:text-white cursor-pointer"
          onClick={toggleDropdown}
        >
          <div className="flex items-center">
            <ClockCircleOutlined className="mr-2 text-gray-500 dark:text-white" />
            {formData.duration
              ? durations.find((d) => d.value === formData.duration)?.label
              : "Select Duration"}
          </div>
        </div>

        {/* Dropdown options */}
        {isOpen && (
          <div
            className="absolute left-0 right-0 mt-2 bg-white dark:bg-gray-700 border dark:border-gray-500 rounded-lg shadow-lg z-10"
            style={{
              position: "fixed", // Fixed position
              top: "calc(100% + 10px)", // Position the dropdown below the input
              left: 0,
              right: 0,
              zIndex: 1000, // Ensure it appears above other elements
            }}
          >
            {durations.map((d) => (
              <div
                key={d.value}
                onClick={() => handleSelect(d.value)}
                className="flex items-center px-4 py-2 cursor-pointer hover:bg-blue-600 dark:hover:bg-blue-500 dark:text-white"
              >
                <ClockCircleOutlined className="mr-2 text-gray-500 dark:text-white" />
                {d.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DurationSelector;
