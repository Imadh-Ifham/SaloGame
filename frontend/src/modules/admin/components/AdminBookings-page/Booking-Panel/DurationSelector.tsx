import { selectFormData, updateBookingForm } from "@/store/slices/bookingSlice";
import { AppDispatch } from "@/store/store";
import { ClockCircleOutlined } from "@ant-design/icons";
import { Select } from "antd";
import React from "react";
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
  return (
    <div className="flex-1 min-w-[200px]">
      <div className="relative border border-gray-300 rounded-lg px-3 py-2 bg-white">
        <Select
          value={formData.duration}
          onChange={(value) => dispatch(updateBookingForm({ duration: value }))}
          className="w-full bg-transparent"
        >
          {durations.map((d) => (
            <Select.Option key={d.value} value={d.value}>
              <div className="flex items-center">
                <ClockCircleOutlined className="mr-2 text-gray-500" />
                {d.label}
              </div>
            </Select.Option>
          ))}
        </Select>
      </div>
    </div>
  );
};

export default DurationSelector;
