import React from "react";
import {
  UserOutlined,
  CreditCardOutlined,
  DollarOutlined,
  GiftOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import { FaGamepad, FaDesktop } from "react-icons/fa";
import dayjs from "dayjs";

type BookingStatus = "Booked" | "InUse" | "Completed" | "Cancelled";
type BookingType = "online-booking" | "walk-in-booking";
type PaymentType = "cash" | "card" | "game-currency" | "membership";

interface Booking {
  customerName: string;
  phoneNumber: string;
  startTime: string;
  endTime: string;
  price: number;
  notes: string;
  status: BookingStatus;
  bookingType: BookingType;
  paymentType: PaymentType;
  machines: {
    machineID: string;
    userCount: number;
    type: "console" | "pc";
    name: string;
  }[];
}

const BookingDetail: React.FC = () => {
  const booking: Booking = {
    customerName: "John Doe",
    phoneNumber: "123-456-7890",
    startTime: "2025-03-20T15:30:00Z",
    endTime: "2025-03-20T16:30:00Z",
    price: 500,
    notes: "This is a mock booking.",
    status: "Booked",
    bookingType: "online-booking",
    paymentType: "card",
    machines: [
      { machineID: "1", userCount: 2, type: "console", name: "Console 1" },
      { machineID: "2", userCount: 1, type: "pc", name: "PC 1" },
    ],
  };

  const statusColors: Record<BookingStatus, string> = {
    Booked: "bg-blue-500",
    InUse: "bg-yellow-500",
    Completed: "bg-green-500",
    Cancelled: "bg-red-500",
  };

  const paymentIcons: Record<PaymentType, JSX.Element> = {
    cash: <DollarOutlined />,
    card: <CreditCardOutlined />,
    "game-currency": <GiftOutlined />,
    membership: <IdcardOutlined />,
  };

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
              {booking.customerName}
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
            Rs. {booking.price}
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Description:</span>
            {booking.notes || "No description provided"}
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Booking Type:</span>
            {booking.bookingType}
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Payment Type:</span>
            <div className="flex items-center gap-1">
              {paymentIcons[booking.paymentType]}
              <span>{booking.paymentType}</span>
            </div>
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
                key={machine.machineID}
                className="relative flex flex-col items-center"
              >
                {machine.type === "console" ? (
                  <FaGamepad className="text-6xl text-gray-700 dark:text-gray-300" />
                ) : (
                  <FaDesktop className="text-6xl text-gray-700 dark:text-gray-300" />
                )}
                <div className="mt-2 text-sm text-gray-900 dark:text-white">
                  {machine.name}
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
