import React, { useState } from "react";
import { Button, Select } from "antd";
import {
  ClockCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  FileTextOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { selectAllMachineBookings } from "@/store/slices/bookingSlice";
import { useDispatch, useSelector } from "react-redux";
import {
  selectMachineStatus,
  selectSelectedMachine,
} from "@/store/selectors/machineSelector";
import { AppDispatch } from "@/store/store";
import { fetchFirstAndNextBookings } from "@/store/thunks/bookingThunk";

export interface CustomerBooking {
  name: string;
  startTime: string;
  endTime: string;
  machineIds: string[];
}

export interface NewBookingForm {
  customerName: string;
  duration: number;
  startTime?: Date;
  contactNumber: string;
  notes: string;
}

const durations = [
  { value: 30, label: "30 minutes" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1 hour 30 min" },
  { value: 120, label: "2 hours" },
  { value: 150, label: "2 hours 30 min" },
  { value: 180, label: "3 hours" },
];

// Extend dayjs with timezone support
dayjs.extend(utc);
dayjs.extend(timezone);

const BookingPanel: React.FC = () => {
  const [activeNav, setActiveNav] = useState<"Now" | "Later">("Now");
  const [formData, setFormData] = useState<NewBookingForm>({
    customerName: "",
    duration: 30,
    contactNumber: "",
    notes: "",
  });
  const [showNewBookingForm, setShowNewBookingForm] = useState(false);
  const selectedMachine = useSelector(selectSelectedMachine);
  const machineStatus = useSelector(selectMachineStatus);
  const allMachineBookings = useSelector(selectAllMachineBookings);
  const dispatch = useDispatch<AppDispatch>();

  var currentBooking = null;
  var nextBooking = null;

  if (selectedMachine) {
    currentBooking = allMachineBookings?.[selectedMachine._id].firstBooking;
    nextBooking = allMachineBookings?.[selectedMachine._id].nextBooking;
  }

  const handleCheckAvailability = () => {
    dispatch(
      fetchFirstAndNextBookings({
        startTime: formData.startTime ? formData.startTime : new Date(),
        duration: formData.duration,
      })
    );
    setShowNewBookingForm(true);
  };

  const handleStartBooking = () => {
    setShowNewBookingForm(false);
  };

  // Get Sri Lankan time (GMT+5:30)
  const sriLankaTime = dayjs().tz("Asia/Colombo");

  // Detect user's local timezone
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Convert Sri Lanka time to user's local timezone
  const minTimeInUserTZ = sriLankaTime.tz(userTimeZone).toDate();
  const maxTimeInUserTZ = dayjs()
    .tz("Asia/Colombo")
    .hour(23)
    .minute(59)
    .tz(userTimeZone)
    .toDate();

  const handleDateChange = (date: Date | null) => {
    if (date) {
      const selectedDay = dayjs(date);
      const today = dayjs();

      // Check if the selected date is today
      if (selectedDay.isSame(today, "day")) {
        // If it's today, set minTime to current time and maxTime to 11:59 PM
        setFormData((prev) => ({
          ...prev,
          startTime: date,
        }));
      } else {
        // If it's tomorrow or later, remove minTime/maxTime restrictions
        setFormData((prev) => ({
          ...prev,
          startTime: date,
        }));
      }
    }
  };

  return (
    <div className="col-span-5 row-span-1 lg:col-span-3 lg:row-span-2 py-2 px-4 flex flex-col gap-4">
      <div className="text-lg font-bold">Booking Mode</div>

      {/* Navigation */}
      <div className="flex gap-3 bg-gray-100 p-2 rounded-lg">
        {["Now", "Later"].map((item) => (
          <Button
            key={item}
            type={activeNav === item ? "primary" : "default"}
            onClick={() => setActiveNav(item as "Now" | "Later")}
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

      {/* Duration and Start Time Inputs */}
      <div className="flex flex-wrap items-center gap-4 w-full">
        {/* Date Picker - Only for "Later" Mode */}
        {activeNav === "Later" && (
          <div className="flex-1 min-w-[250px]">
            <div className="relative flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white">
              <CalendarOutlined className="text-gray-500 mr-2" />
              <DatePicker
                selected={formData.startTime}
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
                className="w-full bg-transparent outline-none text-sm"
              />
            </div>
          </div>
        )}

        {/* Duration Selector */}
        <div className="flex-1 min-w-[200px]">
          <div className="relative border border-gray-300 rounded-lg px-3 py-2 bg-white">
            <Select
              value={formData.duration}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, duration: value }))
              }
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

        {/* Check Availability Button */}
        <div className="w-full flex justify-center">
          <Button
            type="primary"
            onClick={handleCheckAvailability}
            className="w-52 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
          >
            Check Availability
          </Button>
        </div>
      </div>

      {/* Current Booking Status */}
      {selectedMachine ? (
        <div className="border rounded-lg p-4 flex-grow overflow-y-auto">
          {currentBooking ? (
            <div className="w-full p-4 bg-white shadow-lg rounded-xl border">
              {/* Booking Info */}
              <div className="flex justify-between items-center border-b pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-500 text-white rounded-full">
                    <UserOutlined className="text-lg" />
                  </div>
                  <span className="font-semibold text-lg">
                    {currentBooking.customerName}
                  </span>
                </div>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                    machineStatus[selectedMachine._id] === "InUse" ||
                    machineStatus[selectedMachine._id] === "Available"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {machineStatus[selectedMachine._id]}
                </span>
              </div>

              {/* Contact & Booking Details */}
              <div className="mt-4 text-gray-700 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Contact:</span>{" "}
                  {currentBooking.phoneNumber}
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Start:</span>{" "}
                  {dayjs(currentBooking.startTime).format("MMM D, YYYY h:mm A")}
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">End:</span>{" "}
                  {dayjs(currentBooking.endTime).format("MMM D, YYYY h:mm A")}
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Other Machines:</span>
                  {currentBooking.machines
                    ? currentBooking.machines.join(", ")
                    : "None"}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex justify-end gap-3">
                <button className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600">
                  Cancel
                </button>
                <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg shadow hover:bg-gray-300">
                  Extend Time
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700">
                  End
                </button>
              </div>

              {/* Next Booking Section */}
              {nextBooking && (
                <div className="mt-5 p-4 bg-gray-50 rounded-lg shadow">
                  <div className="text-gray-800 font-semibold">
                    Upcoming Booking
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">
                      {nextBooking.customerName}
                    </span>{" "}
                    -{" "}
                    {dayjs(currentBooking.startTime).format(
                      "MMM D, YYYY h:mm A"
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : showNewBookingForm ? (
            <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                New Booking
              </h3>

              <div className="space-y-4">
                {/* Customer Name Input */}
                <div className="relative">
                  <UserOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Customer Name"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.customerName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        customerName: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* Contact Number Input */}
                <div className="relative">
                  <PhoneOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <input
                    type="tel"
                    placeholder="Contact Number"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.contactNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        contactNumber: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* Notes Input */}
                <div className="relative">
                  <FileTextOutlined className="absolute left-3 top-3 text-gray-500" />
                  <textarea
                    placeholder="Notes (optional)"
                    rows={3}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* Start Booking Button */}
                <button
                  onClick={handleStartBooking}
                  disabled={!formData.customerName}
                  className={`w-full py-2 text-white rounded-lg transition duration-300 ${
                    formData.customerName
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  Start Booking
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              Check availability to make a booking
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-gray-500">
          Select a machine to view booking status
        </div>
      )}
    </div>
  );
};

export default BookingPanel;
