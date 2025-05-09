import React from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { selectFormData, updateBookingForm } from "@/store/slices/bookingSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import { CalendarOutlined } from "@ant-design/icons";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface DatePickerProps {
  activeNav: string;
}

const DateSelector: React.FC<DatePickerProps> = ({ activeNav }) => {
  const dispatch = useDispatch<AppDispatch>();
  const formData = useSelector(selectFormData);
  // Extend dayjs with timezone support
  dayjs.extend(utc);
  dayjs.extend(timezone);

  // Get Sri Lankan time (GMT+5:30)
  const sriLankaTime = dayjs().tz("Asia/Colombo");

  // Detect user's local timezone
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Convert Sri Lanka time to user's local timezone
  const minTimeInUserTZ = sriLankaTime
  .clone()
  .add(30, 'minutes')
  .tz(userTimeZone)
  .toDate();

  const maxTimeInUserTZ = dayjs()
    .tz("Asia/Colombo")
    .hour(23)
    .minute(59)
    .tz(userTimeZone)
    .toDate();

  const handleDateChange = (date: Date | null) => {
    if (date) {
      dispatch(updateBookingForm({ startTime: date.toISOString() }));
    }
  };
  return (
    <>
      {activeNav === "Later" && (
        <div className="flex-1 w-full">
          <div className="relative flex items-center border dark:border-gray-500 rounded-lg px-3 py-2">
            <CalendarOutlined className="text-gray-500 mr-2" />
            <DatePicker
              selected={
                formData.startTime ? dayjs(formData.startTime).toDate() : null
              }
              onChange={handleDateChange}
              showTimeSelect
              minDate={minTimeInUserTZ} // Prevent past dates
              minTime={
                activeNav === "Later" &&
                dayjs(formData.startTime).isSame(dayjs(), "day")
                  ? minTimeInUserTZ
                  : undefined
              }
              maxTime={
                activeNav === "Later" &&
                dayjs(formData.startTime).isSame(dayjs(), "day")
                  ? maxTimeInUserTZ
                  : undefined
              }
              dateFormat="MMMM d, yyyy h:mm aa"
              placeholderText="Select date & time"
              className="bg-transparent outline-none text-sm w-full"
              popperClassName="custom-date-picker-popper" // Add custom class
            />
          </div>
        </div>
      )}
    </>
  );
};

export default DateSelector;
