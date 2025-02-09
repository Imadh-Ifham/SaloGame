import React from "react";
import {
  selectAllMachineBookings,
  selectBookingStatus,
} from "@/store/slices/bookingSlice";
import { useSelector } from "react-redux";
import { selectSelectedMachine } from "@/store/selectors/machineSelector";
import CheckAvailability from "./Booking-Panel/CheckAvailability";
import NewBookingForm from "./Booking-Panel/NewBookingForm";
import CurrentBookingDetails from "./Booking-Panel/CurrentBookingDetails";

const BookingPanel: React.FC = () => {
  const selectedMachine = useSelector(selectSelectedMachine);
  const allMachineBookings = useSelector(selectAllMachineBookings);
  const { showBookingForm } = useSelector(selectBookingStatus);
  var currentBooking = null;
  var nextBooking = null;

  if (selectedMachine) {
    currentBooking = allMachineBookings?.[selectedMachine._id].firstBooking;
    nextBooking = allMachineBookings?.[selectedMachine._id].nextBooking;
  }

  return (
    <div className="col-span-5 row-span-1 lg:col-span-3 lg:row-span-2 py-2 px-4 flex flex-col gap-4">
      <div className="text-lg font-bold">Booking Mode</div>

      <CheckAvailability />

      {/* Current Booking Status */}
      {selectedMachine ? (
        <div className="border rounded-lg p-4 flex-grow overflow-y-auto">
          {currentBooking ? (
            <CurrentBookingDetails
              currentBooking={currentBooking}
              nextBooking={nextBooking}
            />
          ) : showBookingForm ? (
            <NewBookingForm />
          ) : (
            <div className={`relative opacity-50 pointer-events-none`}>
              <NewBookingForm />
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-gray-500">
          Select a machine to view booking status
        </div>
      )}
    </div>
  );
};

export default BookingPanel;
