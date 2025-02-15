import { UserOutlined } from "@ant-design/icons";
import React from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

interface CurrentBookingDetailsProps {
  currentBooking: any;
  nextBooking: any;
}

// Extend dayjs with timezone support
dayjs.extend(utc);
dayjs.extend(timezone);

const CurrentBookingDetails: React.FC<CurrentBookingDetailsProps> = ({
  currentBooking,
  nextBooking,
}) => {
  return (
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
            currentBooking.status === "InUse" ||
            currentBooking.status === "Available"
              ? "bg-green-100 text-green-700"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          {currentBooking.status}
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
          <div className="text-gray-800 font-semibold">Upcoming Booking</div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">{nextBooking.customerName}</span> -{" "}
            {dayjs(nextBooking.startTime).format("MMM D, YYYY h:mm A")}
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrentBookingDetails;
