import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import BookingCard from "./BookingCard";
import { selectUpcomingBookings } from "@/store/slices/upcomingBookingsSlice";
import { fetchUpcomingBookings } from "@/store/thunks/bookingThunk";
import { AppDispatch } from "@/store/store";

const UpcomingBooking: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { today, tomorrow, loading, error } = useSelector(selectUpcomingBookings);

  // Fetch upcoming bookings when component mounts
  useEffect(() => {
    dispatch(fetchUpcomingBookings());
  }, [dispatch]);

  return (
    <>
      <div className="text-sm font-poppins font-semibold my-2 dark:text-primary">
        Upcoming Bookings
      </div>
      <div className="border dark:border-gray-700 rounded-lg h-[calc(100%-2rem)] p-2 w-full flex flex-col gap-2 overflow-y-auto scrollbar-hide shadow-lg">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center p-4">{error}</div>
        ) : (
          <>
            {today.length > 0 && (
              <>
                <div className="text-xs font-poppins font-semibold">Today</div>
                <div className="flex flex-col gap-2">
                  {today.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      customerName={booking.customerName}
                      machines={booking.machines}
                      startTime={booking.startTime}
                      duration={booking.duration}
                      status={booking.status}
                      description={booking.description}
                      price={booking.price}
                      paymentStatus={booking.paymentStatus}
                    />
                  ))}
                </div>
              </>
            )}
            
            {tomorrow.length > 0 && (
              <>
                <div className="text-xs font-poppins font-semibold">Tomorrow</div>
                <div className="flex flex-col gap-2">
                  {tomorrow.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      customerName={booking.customerName}
                      machines={booking.machines}
                      startTime={booking.startTime}
                      duration={booking.duration}
                      status={booking.status}
                      description={booking.description}
                      price={booking.price}
                      paymentStatus={booking.paymentStatus}
                    />
                  ))}
                </div>
              </>
            )}
            
            {today.length === 0 && tomorrow.length === 0 && (
              <div className="text-gray-500 text-center p-4">No upcoming bookings found</div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default UpcomingBooking;
