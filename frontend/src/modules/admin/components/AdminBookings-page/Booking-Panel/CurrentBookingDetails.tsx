import React from "react";
import dayjs from "dayjs";
import { useDispatch } from "react-redux";
import { setBookingModal } from "@/store/slices/bookingSlice";
import BookingModals from "./BookingModals";
import BookingDetail from "../Booking-History/BookingDetail";
import { NewCustomerBooking } from "@/types/booking";

interface CurrentBookingDetailsProps {
  currentBooking: NewCustomerBooking;
  nextBooking: NewCustomerBooking | null;
}

const CurrentBookingDetails: React.FC<CurrentBookingDetailsProps> = ({
  currentBooking,
  nextBooking,
}) => {
  const dispatch = useDispatch();

  return (
    <>
      {/* Booking Info */}
      <BookingDetail selectedBooking={currentBooking} />

      {/* Action Buttons */}
      <div className="my-4 mx-6 flex justify-center gap-3">
        <button
          className="px-4 py-2 flex-1 bg-red-500 text-white rounded-lg shadow hover:bg-red-600"
          onClick={() => dispatch(setBookingModal("cancel"))}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 flex-1 bg-gray-200 text-gray-800 rounded-lg shadow hover:bg-gray-300"
          onClick={() => dispatch(setBookingModal("extend"))}
        >
          Extend
        </button>
        {currentBooking?.booking.status === "Booked" ? (
          <button
            className="px-4 py-2 flex-1 bg-green-500 text-white rounded-lg shadow hover:bg-green-600"
            onClick={() => dispatch(setBookingModal("start"))}
          >
            Start
          </button>
        ) : null}
        {currentBooking?.booking.status === "InUse" ? (
          <button
            className="px-4 py-2 flex-1 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
            onClick={() => dispatch(setBookingModal("end"))}
          >
            End
          </button>
        ) : null}
      </div>

      {/* Next Booking */}
      {nextBooking && (
        <div className="mt-5 p-4 bg-gray-50 rounded-lg shadow">
          <div className="text-gray-800 font-semibold">Upcoming Booking</div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">
              {nextBooking.booking.customerName}
            </span>{" "}
            -{" "}
            {dayjs(nextBooking.booking.startTime).format("MMM D, YYYY h:mm A")}
          </div>
        </div>
      )}
      <BookingModals bookingID={currentBooking.booking._id} />
    </>
  );
};

export default CurrentBookingDetails;
