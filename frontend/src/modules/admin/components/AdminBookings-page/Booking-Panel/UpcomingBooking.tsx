import React from "react";
import BookingCard from "./BookingCard";

const UpcomingBooking: React.FC = () => {
  return (
    <>
      <div className="text-sm font-poppins font-semibold my-2 dark:text-primary">
        Upcoming Bookings
      </div>
      <div className="border dark:border-gray-700 rounded-lg h-[calc(100%-2rem)] p-2 w-full flex flex-col gap-2 overflow-y-auto scrollbar-hide shadow-lg">
        <div className="text-xs font-poppins font-semibold">Today</div>
        {/** Booking Card */}
        <div className="flex flex-col gap-2">
          <BookingCard
            customerName="John Doe"
            machines={[
              { name: "PC-12", type: "pc" },
              { name: "PC-13", type: "console" },
              { name: "PC-13", type: "console" },
            ]}
            startTime="14:00"
            duration="30 mins"
            status="Confirmed"
            description="Playing Call of Duty"
            price="500"
            paymentStatus="Paid"
          />
          <BookingCard
            customerName="John Doe"
            machines={[{ name: "C-1", type: "console" }]}
            startTime="14:00"
            duration="30 mins"
            status="Confirmed"
            description="Playing Call of Duty"
            price="500"
            paymentStatus="Paid"
          />
          <BookingCard
            customerName="John Doe"
            machines={[
              { name: "PC-12", type: "pc" },
              { name: "PC-13", type: "pc" },
            ]}
            startTime="14:00"
            duration="30 mins"
            status="Confirmed"
            description="Playing Call of Duty"
            price="500"
            paymentStatus="Paid"
          />
        </div>
        <div className="text-xs font-poppins font-semibold">Tomorow</div>
        {/** Booking Card */}
        <div className="flex flex-col gap-2">
          <BookingCard
            customerName="John Doe"
            machines={[
              { name: "PC-12", type: "pc" },
              { name: "PC-13", type: "pc" },
            ]}
            startTime="14:00"
            duration="30 mins"
            status="Confirmed"
            description="Playing Call of Duty"
            price="500"
            paymentStatus="Paid"
          />
          <BookingCard
            customerName="John Doe"
            machines={[
              { name: "PC-12", type: "pc" },
              { name: "PC-13", type: "pc" },
            ]}
            startTime="14:00"
            duration="30 mins"
            status="Confirmed"
            description="Playing Call of Duty"
            price="500"
            paymentStatus="Paid"
          />
          <BookingCard
            customerName="John Doe"
            machines={[
              { name: "PC-12", type: "pc" },
              { name: "PC-13", type: "pc" },
            ]}
            startTime="14:00"
            duration="30 mins"
            status="Confirmed"
            description="Playing Call of Duty"
            price="500"
            paymentStatus="Paid"
          />
        </div>
      </div>
    </>
  );
};

export default UpcomingBooking;
