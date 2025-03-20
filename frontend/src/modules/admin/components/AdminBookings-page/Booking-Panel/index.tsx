import React from "react";
import {
  selectBookingStatus,
  selectMachineBooking,
} from "@/store/slices/bookingSlice";
import { useSelector } from "react-redux";
import { selectSelectedMachine } from "@/store/selectors/machineSelector";
import CheckAvailability from "./CheckAvailability";
import NewBookingForm from "./NewBookingForm";
import CurrentBookingDetails from "./CurrentBookingDetails";
import UpcomingBooking from "./UpcomingBooking";

const BookingPanel: React.FC = () => {
  const selectedMachine = useSelector(selectSelectedMachine);
  const selectedMachineBookings = useSelector(selectMachineBooking);
  const { showBookingForm } = useSelector(selectBookingStatus);
  var currentBooking = null;
  var nextBooking = null;

  if (selectedMachine) {
    currentBooking = selectedMachineBookings?.firstBooking;
    nextBooking = selectedMachineBookings?.nextBooking;
  }

  return (
    <div className="py-2 px-4 flex flex-col gap-4 h-screen shadow-lg">
      <div className="text-base font-poppins font-semibold">Booking Mode</div>
      <div className="grid grid-cols-5 gap-4 h-screen">
        <div className="grid grid-rows-5 col-span-2 gap-4 h-[calc(100vh-4rem)]">
          {/* Check Availability */}
          <div className="row-span-2">
            <CheckAvailability />
          </div>
          {/* Upcoming Bookings */}
          <div className="row-span-3">
            <UpcomingBooking />
          </div>
        </div>
        <div className="col-span-3 max-h-[90vh] overflow-y-auto">
          {/* Current Booking Status */}
          {selectedMachine ? (
            <div className="border rounded-lg p-4 w-full">
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
      </div>
    </div>
  );
};

export default BookingPanel;
