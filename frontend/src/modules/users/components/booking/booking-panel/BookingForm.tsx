import { selectFormData, updateBookingForm } from '@/store/slices/bookingSlice';
import { AppDispatch } from '@/store/store';
import { createBooking } from '@/store/thunks/bookingThunk';
import { FileTextOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';
import React from 'react'
import { useDispatch, useSelector } from 'react-redux';

interface SelectedMachineDetailProps {
    setActiveTab: (tab: string) => void;
}

const BookingForm:React.FC<SelectedMachineDetailProps> = ({setActiveTab}) => {
    const dispatch = useDispatch<AppDispatch>();
    const formData = useSelector(selectFormData);

    const handleStartBooking = async () => {
    
        await dispatch(createBooking(formData))
          .catch((error) => {
            console.error("Booking failed:", error);
          });
      };
    
  return (
    <div className="space-y-4">

        {/* Gaming Illustration */}
<div className="flex justify-center">
  <div className="relative w-full max-w-md h-40 sm:h-52 rounded-xl overflow-hidden">
    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-400/30 to-purple-500/30 blur-md z-0" />
    <img
      src="/gaming.jpg"
      alt="Gaming"
      className="relative z-10 w-full h-full object-cover rounded-xl"
    />
  </div>
</div>

        {/* Customer Name Input */}
        <div className="relative">
          <UserOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Customer Name"
            required
            className="w-full pl-10 pr-4 py-2 border dark:border-gray-500 dark:bg-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            maxLength={10}
            minLength={10}
            pattern="[0-9]{10}"
            placeholder="Contact Number"
            required
            className="w-full pl-10 pr-4 py-2 border dark:border-gray-500 dark:bg-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.phoneNumber ? formData.phoneNumber : ""}
            onKeyDown={(e) => {
              // Only allow number keys, backspace, delete, arrow keys, and tab
              if (
                !/[0-9]/.test(e.key) && // Allow numbers only
                e.key !== "Backspace" && // Allow backspace
                e.key !== "Delete" && // Allow delete
                e.key !== "ArrowLeft" && // Allow left arrow
                e.key !== "ArrowRight" // Allow right arrow
              ) {
                e.preventDefault(); // Block the input if it's not a number
              }
            }}
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
            className="w-full pl-10 pr-4 py-2 border dark:border-gray-500 dark:bg-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            value={formData.notes ? formData.notes : ""}
            onChange={(e) =>
              dispatch(updateBookingForm({ notes: e.target.value }))
            }
          />
        </div>

        {/* Button Wrapper */}
        <div className="absolute bottom-0 left-0 w-full px-4 py-4 bg-gradient-to-t from-white dark:from-gray-900 flex justify-between">
            {/* Back Button */}
            <button
            disabled={
                !formData.startTime || !formData.duration || formData.machines.length === 0
            }
            onClick={() => setActiveTab("machine-details")}
            className={`px-6 py-2 rounded-xl text-black font-semibold transition-all duration-200 ${
                !formData.startTime || !formData.duration || formData.machines.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary hover:bg-primary-dark cursor-pointer"
            }`}
            >
            Back
            </button>

            {/* Book Now Button */}
            <button
            onClick={handleStartBooking}
            disabled={
                !formData.customerName ||
                !formData.phoneNumber ||
                !/^[0-9]{10}$/.test(formData.phoneNumber)
            }
            className={`px-6 py-2 text-white dark:text-black font-semibold rounded-lg transition duration-300 ${
                formData.customerName &&
                formData.phoneNumber &&
                /^[0-9]{10}$/.test(formData.phoneNumber)
                ? "bg-blue-600 dark:bg-primary hover:bg-blue-700 dark:hover:bg-primary-dark cursor-pointer"
                : "bg-gray-400 cursor-not-allowed"
            }`}
            >
            Book Now
            </button>
        </div>
      </div>
  )
}

export default BookingForm
