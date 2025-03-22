import React from "react";
import { FaUserCircle } from "react-icons/fa";

interface BookingCardProps {
  userName: string;
  bookingType: "walk-in-booking" | "online-booking";
  dateTime: string;
  status: "Booked" | "InUse" | "Completed" | "Cancelled";
}

const BookingCard: React.FC<BookingCardProps> = ({
  userName,
  bookingType,
  dateTime,
  status,
}) => {
  const statusColors = {
    Booked: "bg-blue-500",
    InUse: "bg-yellow-500",
    Completed: "bg-green-500",
    Cancelled: "bg-red-500",
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-4 cursor-pointer">
      <div className="flex items-center">
        <FaUserCircle className="h-10 w-10 text-gray-700 dark:text-gray-300 mr-4" />
        <div>
          <div className="font-semibold text-gray-900 dark:text-white">
            {userName}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {bookingType}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {dateTime}
        </div>
        <div
          className={`mt-1 inline-block px-3 py-1 text-sm font-semibold text-white rounded-full ${statusColors[status]}`}
        >
          {status}
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
