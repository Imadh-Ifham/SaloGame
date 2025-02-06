import React from "react";
import HomeLayout from "../layout/HomeLayout";
import BookingForm from "../components/BookingForm";

const BookingPage: React.FC = () => {
  return (
    <HomeLayout>
      <div className="py-12 px-4 sm:px-6 lg:px-8 relative">
        {/* View My Bookings Button */}
        <button
          className="absolute top-0 right-0 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg m-4"
        >
          View My Bookings
        </button>

        {/* Booking Form Section */}
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Book Your Session</h1>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <BookingForm />
          </div>
        </div>
      </div>
    </HomeLayout>
  );
};

export default BookingPage;
