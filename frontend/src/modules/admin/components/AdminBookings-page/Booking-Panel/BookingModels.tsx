import Modal from "@/components/Modal";
import React, { useState } from "react";
import { Button } from "@headlessui/react";
import { useDispatch, useSelector } from "react-redux";
import {
  resetBookingModal,
  selectBookingModal,
  selectBookingStatus,
} from "@/store/slices/bookingSlice";

const BookingModels: React.FC = () => {
  const bookingModalString = useSelector(selectBookingModal);
  const dispatch = useDispatch();

  return (
    <Modal
      isOpen={bookingModalString !== null}
      onClose={() => dispatch(resetBookingModal())}
      title={
        bookingModalString === "cancel"
          ? "Cancel Booking Confirmation"
          : bookingModalString === "extend"
          ? "Extend Booking"
          : bookingModalString === "start"
          ? "Start Booking"
          : bookingModalString === "end"
          ? "End Booking"
          : ""
      }
    >
      {bookingModalString === "cancel" && <CancelBookingModal />}
      {bookingModalString === "extend" && <ExtendBookingModal />}
      {bookingModalString === "start" && <StartBookingModal />}
      {bookingModalString === "end" && <EndBookingModal />}
    </Modal>
  );
};

// Cancel Booking Modal - Cancels booking with confirmation
const CancelBookingModal: React.FC = () => {
  const { loading, error } = useSelector(selectBookingStatus);
  const dispatch = useDispatch();

  const handleCancel = async () => {
    // handle cancel
  };
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-300">
        Are you sure you want to cancel this booking? This action cannot be
        undone.
      </p>
      {error && <div className="text-red-500 text-sm text-center">{error}</div>}
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          onClick={() => dispatch(resetBookingModal())}
          className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition"
        >
          Cancel Action
        </Button>
        <Button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          disabled={loading}
        >
          {loading ? "Booking Cancelling..." : "Confirm Cancellation"}
        </Button>
      </div>
    </div>
  );
};

// Extend Booking Modal with Select Input inside Sentence
const ExtendBookingModal: React.FC = () => {
  const { loading, error } = useSelector(selectBookingStatus);
  const dispatch = useDispatch();
  const [extendTime, setExtendTime] = useState("30min");

  const handleExtend = async () => {
    // Handle time extension logic
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-300">
        Select how long you want to extend the booking:
      </p>

      {/* Select Dropdown inside Sentence */}
      <div className="flex items-center space-x-2">
        <p className="text-gray-700 dark:text-gray-300">I want to extend by</p>
        <select
          value={extendTime}
          onChange={(e) => setExtendTime(e.target.value)}
          className="px-3 py-2 border rounded dark:bg-gray-800 dark:text-white"
        >
          <option value="30min">30 minutes</option>
          <option value="1hour">1 hour</option>
          <option value="1h30min">1 hour 30 minutes</option>
          <option value="2hours">2 hours</option>
        </select>
      </div>

      {error && <div className="text-red-500 text-sm text-center">{error}</div>}

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          onClick={() => dispatch(resetBookingModal())}
          className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleExtend}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          disabled={loading}
        >
          {loading ? "Extending..." : `Confirm Extension`}
        </Button>
      </div>
    </div>
  );
};

// Start Booking Modal - Changes status to "In Use"
const StartBookingModal: React.FC = () => {
  const { error } = useSelector(selectBookingStatus);
  const dispatch = useDispatch();
  const [isConfirming, setIsConfirming] = useState(false);

  const handleStart = async () => {
    setIsConfirming(true);
    try {
      // API call to start booking (Change status to "In Use")
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated delay
      dispatch(resetBookingModal());
    } catch (error) {
      console.error("Error starting booking:", error);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-300">
        The customer has arrived and is ready to use the machine. Once you
        confirm, the booking status will change to <b>"In Use"</b>.
      </p>

      {error && <div className="text-red-500 text-sm text-center">{error}</div>}

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          onClick={() => dispatch(resetBookingModal())}
          className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleStart}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          disabled={isConfirming}
        >
          {isConfirming ? "Starting..." : "Confirm Start"}
        </Button>
      </div>
    </div>
  );
};

// End Booking Modal - Shows summary before ending the booking
const EndBookingModal: React.FC = () => {
  const { error } = useSelector(selectBookingStatus);
  const dispatch = useDispatch();
  const [isConfirming, setIsConfirming] = useState(false);

  // Dummy Data (Replace these with real values from backend later)
  const startTime = new Date("2025-03-17T10:00:00"); // Dummy Start Time
  const endTime = new Date(); // Current Time (End Time)
  const durationMinutes = Math.round(
    (endTime.getTime() - startTime.getTime()) / (1000 * 60)
  ); // Calculate duration in minutes
  const pricePerHour = 500; // Dummy price per hour
  const totalPrice = ((durationMinutes / 60) * pricePerHour).toFixed(2); // Calculate price

  const handleEndBooking = async () => {
    setIsConfirming(true);
    try {
      // API call to end booking (Change status to "Completed")
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated delay
      dispatch(resetBookingModal());
    } catch (error) {
      console.error("Error ending booking:", error);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
        Review the details below before ending the booking:
      </p>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500 dark:text-gray-300">Start Time</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {startTime.toLocaleTimeString()}
          </p>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500 dark:text-gray-300">End Time</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {endTime.toLocaleTimeString()} (Now)
          </p>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500 dark:text-gray-300">
            Total Duration
          </p>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {Math.floor(durationMinutes / 60)}h {durationMinutes % 60}min
          </p>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500 dark:text-gray-300">
            Total Price
          </p>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Rs. {totalPrice}
          </p>
        </div>
      </div>

      {error && <div className="text-red-500 text-sm text-center">{error}</div>}

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          onClick={() => dispatch(resetBookingModal())}
          className="px-6 py-3 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleEndBooking}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          disabled={isConfirming}
        >
          {isConfirming ? "Ending Booking..." : "Confirm End Booking"}
        </Button>
      </div>
    </div>
  );
};

export default BookingModels;
