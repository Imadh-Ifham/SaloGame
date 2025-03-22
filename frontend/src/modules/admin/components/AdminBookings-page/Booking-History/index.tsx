import React, { useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import BookingCard from "./BookingCard";

interface BookingCardProps {
  userName: string;
  bookingType: "walk-in-booking" | "online-booking";
  dateTime: string;
  status: "Booked" | "InUse" | "Completed" | "Cancelled";
}

const BookingHistory: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] =
    useState<BookingCardProps | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleBookingCardClick = (booking: BookingCardProps) => {
    setSelectedBooking(booking);
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Additional logic can be added here
  };

  // Example booking data
  const bookings: BookingCardProps[] = [
    {
      userName: "John Doe",
      bookingType: "walk-in-booking",
      dateTime: "2025-03-20 15:30",
      status: "Booked",
    },
    {
      userName: "Jane Smith",
      bookingType: "online-booking",
      dateTime: "2025-03-20 16:00",
      status: "InUse",
    },
    {
      userName: "Chris Johnson",
      bookingType: "walk-in-booking",
      dateTime: "2025-03-20 17:00",
      status: "Completed",
    },
    {
      userName: "Patricia Brown",
      bookingType: "online-booking",
      dateTime: "2025-03-20 18:00",
      status: "Cancelled",
    },
  ];

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
      </section>
      <section className="h-[calc(100vh-10rem)] overflow-y-auto scrollbar-hide border-t dark:border-gamer-green/20">
        {bookings
          .filter((booking) =>
            booking.userName.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((booking, index) => (
            <div key={index} onClick={() => handleBookingCardClick(booking)}>
              <BookingCard {...booking} />
            </div>
          ))}
      </section>
    </div>
  );
};

export default BookingHistory;
