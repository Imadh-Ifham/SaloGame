import React from "react";
import HomeLayout from "../../users/layout/HomeLayout";
import BookingForm from "../../users/components/BookingForm";
import { Link } from "react-router-dom";

const AdminBookingPage: React.FC = () => {
  return (
    <HomeLayout>
      <div className="py-12 px-4 sm:px-6 lg:px-8 relative">
        {/* View All Bookings Button */}
        <Link
          to="/admin/bookings/all"
          className="absolute top-0 right-0 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg m-4"
        >
          View All Bookings
        </Link>

        <h1 className="text-3xl font-bold text-center mb-8">Manage Bookings</h1>
        <BookingForm />
      </div>
    </HomeLayout>
  );
};

export default AdminBookingPage;
