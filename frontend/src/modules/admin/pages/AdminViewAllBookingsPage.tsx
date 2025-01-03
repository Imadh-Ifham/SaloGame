import React, { useEffect, useState } from "react";
import HomeLayout from "../../users/layout/HomeLayout";
import { API_ENDPOINTS } from "../../../api/endpoints";
import { BookingFormData } from "../../users/components/BookingForm";
import BookingForm from "../../users/components/BookingForm";
import axios from "axios";

export interface Booking {
  _id: string;
  date: string; // Stored as ISO string
  time: string;
  name: string;
  phone: number;
  email: string;
}

const AdminViewAllBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_ENDPOINTS.BOOKINGS.GET_BOOKINGS);
      console.log("Fetched bookings:", response.data);
      setBookings(response.data.data);
    } catch (err) {
      setError("Failed to fetch bookings. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking);
  };

  const handleSave = async (updatedBooking: BookingFormData) => {
    try {
      const booking: Booking = {
        ...updatedBooking,
        _id: updatedBooking.id || "",
        phone: Number(updatedBooking.phone),
        date:
          updatedBooking.date instanceof Date
            ? updatedBooking.date.toISOString()
            : updatedBooking.date,
      };

      const response = await axios.put(API_ENDPOINTS.BOOKINGS.UPDATE_BOOKING(booking._id), booking);
      console.log("Updated booking response:", response.data);
      setBookings((prev) =>
        prev.map((b) => (b._id === booking._id ? booking : b))
      );
      setEditingBooking(null);
    } catch (err) {
      setError("Failed to update booking. Please try again later.");
      console.error(err);
    }
  };

  const handleCancel = () => {
    setEditingBooking(null);
  };

  const handleDelete = async (_id: string) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      try {
        await axios.delete(`${API_ENDPOINTS.BOOKINGS.GET_BOOKINGS}/${_id}`);
        setBookings((prev) => prev.filter((booking) => booking._id !== _id));
      } catch (err) {
        setError("Failed to delete booking. Please try again later.");
        console.error(err);
      }
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  if (loading) {
    return (
      <HomeLayout>
        <div className="py-12 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-center mb-8">All Bookings</h1>
          <div className="text-center">Loading bookings...</div>
        </div>
      </HomeLayout>
    );
  }



  return (
    <HomeLayout>
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center mb-8">All Bookings</h1>
        {error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : editingBooking ? (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Edit Booking</h2>
            <BookingForm
              initialData={{
                id: editingBooking._id,
                date: editingBooking.date,
                time: editingBooking.time,
                name: editingBooking.name,
                phone: editingBooking.phone.toString(),
                email: editingBooking.email,
              }}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td className="px-6 py-4 whitespace-nowrap">#{booking._id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(booking.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{booking.time}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{booking.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{booking.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{booking.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                          onClick={() => handleEdit(booking)}
                        >
                          Edit
                        </button>
                        <button
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          onClick={() => handleDelete(booking._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </HomeLayout>
  );
};

export default AdminViewAllBookingsPage;
