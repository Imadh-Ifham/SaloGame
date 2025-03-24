import React, { useEffect, useState } from "react";
import { ArrowPathIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import BookingCard from "./BookingCard";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import { selectBookingLog } from "@/store/slices/bookingHistorySlice";
import {
  fetchBookingLogs,
  fetchSelectedBooking,
} from "@/store/thunks/bookingThunk";

const BookingHistory: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const bookingLogs = useSelector(selectBookingLog);

  useEffect(() => {
    const fetchBookingLog = async () => {
      await dispatch(fetchBookingLogs());
    };
    if (bookingLogs.length === 0) fetchBookingLog();
  }, [dispatch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleBookingCardClick = async (bookingID: string) => {
    setSelectedBooking(bookingID);
    console.log("Selected booking:", bookingID);
    await dispatch(fetchSelectedBooking({ bookingID }));
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Additional logic can be added here
  };

  const handleRefreshClick = async () => {
    setIsRefreshing(true);
    await dispatch(fetchBookingLogs());
    setIsRefreshing(false);
  };

  return (
    <div className="py-2 px-4 flex flex-col gap-4 h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
      <div className="text-base font-poppins font-semibold">
        Booking History
      </div>
      <section className="w-full flex items-center justify-between">
        {/* Search Input */}
        <div className="relative w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gamer-green" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search booking..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border-2 dark:border-gamer-green/20 dark:bg-[#111111]/60 dark:text-white placeholder-gray-400 focus:outline-none focus:border-gamer-green/50 transition-colors"
          />
        </div>

        {/* Refresh Button */}
        <button
          onClick={handleRefreshClick}
          className="ml-4 p-2 rounded-lg border-2 dark:border-gamer-green/20 text-gamer-green hover:bg-gamer-green/10 transition-colors"
          disabled={isRefreshing}
        >
          <ArrowPathIcon
            className={`h-4 w-4 transition-transform ${
              isRefreshing ? "animate-spin" : ""
            }`}
          />
        </button>
      </section>
      <section className="h-[calc(100vh-10rem)] overflow-y-auto scrollbar-hide border-t dark:border-gamer-green/20">
        {bookingLogs
          .filter((booking) =>
            booking.customerName
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          )
          .map((booking, index) => (
            <div
              key={index}
              onClick={() => handleBookingCardClick(booking._id)}
              className={`hover:shadow-lg hover:scale-[0.99] transition-transform duration-300 ease-in-out cursor-pointer ${
                selectedBooking === booking._id ? "scale-[0.99] shadow-lg" : ""
              }`}
            >
              <BookingCard {...booking} />
            </div>
          ))}
      </section>
    </div>
  );
};

export default BookingHistory;
