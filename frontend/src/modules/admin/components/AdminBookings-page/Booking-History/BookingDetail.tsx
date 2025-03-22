import React, { useEffect } from "react";
import {
  UserOutlined,
  CreditCardOutlined,
  DollarOutlined,
  GiftOutlined,
} from "@ant-design/icons";
import { FaGamepad, FaDesktop } from "react-icons/fa";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import { fetchSelectedBooking } from "@/store/thunks/bookingThunk";
import { selectSelectedBooking } from "@/store/slices/bookingHistorySlice";
import { bookingStatusString, PaymentType } from "@/types/booking";

const BookingDetail: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const callBooking = async () => {
    try {
      await dispatch(
        fetchSelectedBooking({ bookingID: "67dedc97ad6be8bdb4653e41" })
      );
    } catch (error) {
      console.error("Failed to fetch booking:", error);
    }
  };
  useEffect(() => {
    callBooking();
  }, []);
  const selectedBooking = useSelector(selectSelectedBooking);

  const statusColors: Record<bookingStatusString, string> = {
    Booked: "bg-blue-500",
    InUse: "bg-yellow-500",
    Completed: "bg-green-500",
    Cancelled: "bg-red-500",
    Available: "bg-gray-500",
  };

  const paymentIcons: Record<PaymentType, JSX.Element> = {
    cash: <DollarOutlined />,
    card: <CreditCardOutlined />,
    XP: <GiftOutlined />,
  };

  if (!selectedBooking) {
    return <div>Loading...</div>;
  }

  const booking = selectedBooking.booking;
  const transaction = selectedBooking.transaction;

  return (
    <div className="flex justify-center items-center h-full p-4">
      <div className="w-full max-w-3xl p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        {/* Booking Info */}
        <div className="flex flex-col md:flex-row justify-between items-center border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="py-2 px-3 bg-blue-500 text-white rounded-full">
              <UserOutlined className="text-lg" />
            </div>
            <span className="font-semibold text-lg text-gray-900 dark:text-white">
              {selectedBooking.booking.customerName}
            </span>
          </div>
          <span
            className={`mt-2 md:mt-0 px-3 py-1 text-sm font-medium rounded-full ${
              statusColors[booking.status]
            }`}
          >
            {booking.status}
          </span>
        </div>

        {/* Booking Details */}
        <div className="mt-4 text-gray-700 dark:text-gray-300 text-sm space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">Contact:</span>
            {booking.phoneNumber}
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Start:</span>
            {dayjs(booking.startTime).format("MMM D, YYYY h:mm A")}
          </div>
          <div className="flex justify-between">
            <span className="font-medium">End:</span>
            {dayjs(booking.endTime).format("MMM D, YYYY h:mm A")}
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Duration:</span>
            {dayjs(booking.endTime).diff(
              dayjs(booking.startTime),
              "minute"
            )}{" "}
            minutes
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Price:</span>
            Rs. {transaction.amount}
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Description:</span>
            {booking.notes || "No description provided"}
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Booking Type:</span>
            {transaction.transactionType}
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Payment Type:</span>
            <div className="flex items-center gap-1">
              {paymentIcons[transaction.paymentType]}
              <span>{transaction.paymentType}</span>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Payment Status:</span>
            {transaction.status}
          </div>
        </div>

        {/* Booked Machines */}
        <div className="mt-6">
          <div className="text-center font-medium text-lg text-gray-900 dark:text-white">
            Booked Machines
          </div>
          <div className="flex flex-wrap justify-center items-center gap-4 mt-4">
            {booking.machines.map((machine) => (
              <div
                key={machine.machineID._id}
                className="relative flex flex-col items-center"
              >
                {machine.machineID.machineCategory === "Console" ? (
                  <FaGamepad className="text-6xl text-gray-700 dark:text-gray-300" />
                ) : (
                  <FaDesktop className="text-6xl text-gray-700 dark:text-gray-300" />
                )}
                <div className="mt-2 text-sm text-gray-900 dark:text-white">
                  {machine.machineID.serialNumber}
                </div>
                <div className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                  {machine.userCount}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;
