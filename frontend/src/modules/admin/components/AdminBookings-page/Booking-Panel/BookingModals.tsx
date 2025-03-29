import Modal from "@/components/Modal";
import React, { useEffect, useState } from "react";
import { Button } from "@headlessui/react";
import { useDispatch, useSelector } from "react-redux";
import {
  resetBookingModal,
  selectBookingModal,
  selectBookingStatus,
  selectFormData,
  selectMachineBooking,
} from "@/store/slices/bookingSlice";
import { AppDispatch } from "@/store/store";
import {
  fetchFirstAndNextBooking,
  fetchMachineStatus,
  updateBookingStatus,
} from "@/store/thunks/bookingThunk";
import { selectSelectedMachine } from "@/store/selectors/machineSelector";
import { formatTo12Hour } from "@/utils/date.util";
import axiosInstance from "@/axios.config";
import { PaymentType } from "@/types/booking";
import {
  CreditCardOutlined,
  DollarOutlined,
  GiftOutlined,
} from "@ant-design/icons";

interface ModalProps {
  bookingID: string;
  statusData: any;
  bookingData: any;
}

const BookingModals: React.FC<{ bookingID: string }> = ({ bookingID }) => {
  const bookingModalString = useSelector(selectBookingModal);
  const dispatch = useDispatch();
  const formData = useSelector(selectFormData);
  const selectedMachine = useSelector(selectSelectedMachine);
  const machineID = selectedMachine ? selectedMachine._id : null;
  const statusData = {
    startTime: formData.startTime,
    duration: formData.duration,
  };
  const bookingDataReq = {
    startTime: formData.startTime,
    duration: formData.duration,
    machineID: machineID,
  };

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
      {bookingModalString === "cancel" && (
        <CancelBookingModal
          bookingID={bookingID}
          statusData={statusData}
          bookingData={bookingDataReq}
        />
      )}
      {bookingModalString === "extend" && <ExtendBookingModal />}
      {bookingModalString === "start" && (
        <StartBookingModal
          bookingID={bookingID}
          statusData={statusData}
          bookingData={bookingDataReq}
        />
      )}
      {bookingModalString === "end" && (
        <EndBookingModal
          bookingID={bookingID}
          statusData={statusData}
          bookingData={bookingDataReq}
        />
      )}
    </Modal>
  );
};

// Cancel Booking Modal - Cancels booking with confirmation
const CancelBookingModal: React.FC<ModalProps> = ({
  bookingID,
  statusData,
  bookingData,
}) => {
  const { loading, error } = useSelector(selectBookingStatus);
  const dispatch = useDispatch<AppDispatch>();

  const handleCancel = async () => {
    const data = { bookingID, status: "Cancelled" };
    // API call to cancel booking
    await dispatch(updateBookingStatus(data));
    await dispatch(fetchMachineStatus(statusData)); // Fetch machine status after cancellation
    await dispatch(fetchFirstAndNextBooking(bookingData)); // Fetch first and next booking after cancellation
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated delay
    dispatch(resetBookingModal());
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
const StartBookingModal: React.FC<ModalProps> = ({
  bookingID,
  statusData,
  bookingData,
}) => {
  const { error } = useSelector(selectBookingStatus);
  const dispatch = useDispatch<AppDispatch>();
  const selectedMachineBookings = useSelector(selectMachineBooking);
  const [isConfirming, setIsConfirming] = useState(false);

  const currentBooking = selectedMachineBookings!.firstBooking!;

  const handleStart = async () => {
    setIsConfirming(true);
    try {
      // API call to start booking (Change status to "In Use")
      const data = { bookingID, status: "InUse" };
      // API call to cancel booking
      await dispatch(updateBookingStatus(data));
      await dispatch(fetchMachineStatus(statusData));
      await dispatch(fetchFirstAndNextBooking(bookingData)); // Fetch first and next booking after cancellation
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated delay
      dispatch(resetBookingModal());
    } catch (error) {
      console.error("Error starting booking:", error);
    } finally {
      setIsConfirming(false);
    }
  };

  const startTime = new Date(); // Current Time (Start Time)
  const endTime = new Date(); // Current Time (End Time)
  const price = 600; // Example price

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-300">
        The customer has arrived and is ready to use the machine. Once you
        confirm, the booking status will change to <b>"In Use"</b>.
      </p>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500 dark:text-gray-300">Start Time</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {formatTo12Hour(startTime)} (Now)
          </p>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500 dark:text-gray-300">End Time</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {formatTo12Hour(endTime)}
          </p>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500 dark:text-gray-300">
            Total Price
          </p>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Rs. {price}
          </p>
        </div>
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
const EndBookingModal: React.FC<ModalProps> = ({
  bookingID,
  statusData,
  bookingData,
}) => {
  const { error } = useSelector(selectBookingStatus);
  const dispatch = useDispatch<AppDispatch>();
  const selectedMachineBookings = useSelector(selectMachineBooking);
  const [isConfirming, setIsConfirming] = useState(false);
  const [price, setPrice] = useState(0);

  const paymentType: PaymentType[] = ["cash", "card"];
  const paymentIcons: Record<PaymentType, JSX.Element> = {
    cash: <DollarOutlined className="text-4xl" />,
    card: <CreditCardOutlined className="text-4xl" />,
    XP: <GiftOutlined className="text-4xl" />,
  };

  const currentBooking = selectedMachineBookings!.firstBooking!;

  const [payment, setPayment] = useState(
    currentBooking.transaction.paymentType
  );

  const startTime = new Date(currentBooking.booking.startTime);
  const endTime = new Date(); // Current Time (End Time)
  const durationMinutes = Math.round(
    (endTime.getTime() - startTime.getTime()) / (1000 * 60)
  ); // Calculate duration in minutes

  useEffect(() => {
    const calPriceData = {
      startTime,
      endTime,
      machines: currentBooking.booking.machines,
    };

    const calculatePrice = async () => {
      try {
        const response = await axiosInstance.post(
          "currency/calculate-price",
          calPriceData
        );
        setPrice(response.data);
        console.log(response.data);
      } catch (error) {
        console.log("error: ", error);
      }
    };
    calculatePrice();
  }, [endTime, startTime]);

  const handleSubmit = async () => {
    try {
      const data = {
        bookingID,
        paymentType: payment,
        endTime: endTime,
      };
      // API call to create a transaction
      await axiosInstance.put("bookings/end-booking", data);
    } catch (error) {
      console.error("Error creating transaction:", error);
    }
  };

  const handleEndBooking = async () => {
    setIsConfirming(true);
    try {
      await handleSubmit(); // Update Booking
      await dispatch(fetchMachineStatus(statusData)); // Fetch machine status after ending
      await dispatch(fetchFirstAndNextBooking(bookingData)); // Fetch first and next booking after cancellation
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
            {formatTo12Hour(startTime)}
          </p>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500 dark:text-gray-300">End Time</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {formatTo12Hour(endTime)} (Now)
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
            Rs. {price}
          </p>
        </div>
      </div>

      {currentBooking.transaction.status === "pending" && (
        <div className="flex justify-center items-center gap-10">
          {paymentType.map((type) => (
            <div
              key={type}
              className={`flex flex-col justify-center items-center gap-1 border w-20 h-20 rounded-lg cursor-pointer hover:bg-primary/10 ${
                type === payment && "bg-primary/30"
              }`}
              onClick={() => setPayment(type)}
            >
              {paymentIcons[type]}
              <div>{type}</div>
            </div>
          ))}
        </div>
      )}

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
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 transition"
          disabled={isConfirming}
        >
          {isConfirming ? "Ending Booking..." : "Confirm End Booking"}
        </Button>
      </div>
    </div>
  );
};

export default BookingModals;
