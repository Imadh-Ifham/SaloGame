import {
  selectFormData,
  setShowBookingForm,
  updateBookingForm,
} from "@/store/slices/bookingSlice";
import { AppDispatch } from "@/store/store";
import {
  FileTextOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

const NewBookingForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const formData = useSelector(selectFormData);

  const handleStartBooking = () => {
    dispatch(setShowBookingForm(false));
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md mx-auto">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">New Booking</h3>

      <div className="space-y-4">
        {/* Customer Name Input */}
        <div className="relative">
          <UserOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Customer Name"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.customerName}
            onChange={(e) =>
              dispatch(updateBookingForm({ customerName: e.target.value }))
            }
          />
        </div>

        {/* Contact Number Input */}
        <div className="relative">
          <PhoneOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="tel"
            placeholder="Contact Number"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.phoneNumber ? formData.phoneNumber : ""}
            onChange={(e) =>
              dispatch(updateBookingForm({ phoneNumber: e.target.value }))
            }
          />
        </div>

        {/* Notes Input */}
        <div className="relative">
          <FileTextOutlined className="absolute left-3 top-3 text-gray-500" />
          <textarea
            placeholder="Notes (optional)"
            rows={3}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            value={formData.notes ? formData.notes : ""}
            onChange={(e) =>
              dispatch(updateBookingForm({ notes: e.target.value }))
            }
          />
        </div>

        {/* Start Booking Button */}
        <button
          onClick={handleStartBooking}
          disabled={!formData.customerName}
          className={`w-full py-2 text-white rounded-lg transition duration-300 ${
            formData.customerName
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Start Booking
        </button>
      </div>
    </div>
  );
};

export default NewBookingForm;
