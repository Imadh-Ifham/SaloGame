import { UserOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useDispatch, useSelector } from "react-redux";
import {
  selectMachines,
  selectSelectedMachine,
} from "@/store/selectors/machineSelector";
import { setBookingModal } from "@/store/slices/bookingSlice";
import BookingModals from "./BookingModals";

dayjs.extend(utc);
dayjs.extend(timezone);

interface CurrentBookingDetailsProps {
  currentBooking: any;
  nextBooking: any;
}

const CurrentBookingDetails: React.FC<CurrentBookingDetailsProps> = ({
  currentBooking,
  nextBooking,
}) => {
  const dispatch = useDispatch();
  const machines = useSelector(selectMachines);
  const [machineSerialNumbers, setMachineSerialNumbers] = useState<string[]>(
    []
  );
  const [playerCount, setPlayerCount] = useState<number>(1);
  const selectedMachine = useSelector(selectSelectedMachine);

  useEffect(() => {
    if (currentBooking?.machines?.length > 0) {
      const serialNumbers = currentBooking.machines
        .map((currentBookingMachine: any) => {
          const machine = machines.find(
            (m: any) => m._id === currentBookingMachine.machineID
          );
          return machine ? machine.serialNumber : null;
        })
        .filter(Boolean); // Remove null values
      setMachineSerialNumbers(serialNumbers);
    } else {
      setMachineSerialNumbers([]); // Reset if no machines
    }
  }, [machines, currentBooking]);

  useEffect(() => {
    if (selectedMachine && currentBooking) {
      const playerCountMachine = currentBooking.machines.find(
        (machine: any) => machine.machineID === selectedMachine?._id
      );
      setPlayerCount(playerCountMachine?.userCount || 1);
    }
  }, [selectedMachine, currentBooking]);

  return (
    <div className="w-full p-4 dark:bg-gray-700 text-gray-700 dark:text-gray-50 shadow-lg rounded-xl border dark:border-gray-500">
      {/* Booking Info */}
      <div className="flex justify-between items-center border-b pb-3">
        <div className="flex items-center gap-2">
          <div className="py-2 px-3 bg-blue-500 text-white rounded-full">
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

      {/* Booking Details */}
      <div className="mt-4 text-sm space-y-2">
        <div className="flex justify-between">
          <span className="font-medium">Contact:</span>
          {currentBooking.phoneNumber}
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Start:</span>
          {dayjs(currentBooking.startTime).format("MMM D, YYYY h:mm A")}
        </div>
        <div className="flex justify-between">
          <span className="font-medium">End:</span>
          {dayjs(currentBooking.endTime).format("MMM D, YYYY h:mm A")}
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Duration:</span>
          {dayjs(currentBooking.endTime).diff(
            dayjs(currentBooking.startTime),
            "minute"
          )}{" "}
          minutes
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Price:</span>
          Rs. {currentBooking.price}
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Description:</span>
          {currentBooking.notes || "No description provided"}
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Players:</span>
          {playerCount || "1"}
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Other Machines:</span>
          {machineSerialNumbers.length > 0
            ? machineSerialNumbers.join(", ")
            : "None"}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex justify-end gap-3">
        <button
          className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600"
          onClick={() => dispatch(setBookingModal("cancel"))}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg shadow hover:bg-gray-300"
          onClick={() => dispatch(setBookingModal("extend"))}
        >
          Extend
        </button>
        <button
          className="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600"
          onClick={() => dispatch(setBookingModal("start"))}
        >
          Start
        </button>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
          onClick={() => dispatch(setBookingModal("end"))}
        >
          End
        </button>
      </div>

      {/* Next Booking */}
      {nextBooking && (
        <div className="mt-5 p-4 bg-gray-50 rounded-lg shadow">
          <div className="text-gray-800 font-semibold">Upcoming Booking</div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">{nextBooking.customerName}</span> -{" "}
            {dayjs(nextBooking.startTime).format("MMM D, YYYY h:mm A")}
          </div>
        </div>
      )}
      <BookingModals bookingID={currentBooking._id} />
    </div>
  );
};

export default CurrentBookingDetails;
