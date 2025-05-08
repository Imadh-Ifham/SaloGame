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
    <div className="py-2 px-4 flex flex-col gap-4 h-[calc(100vh-2rem)] shadow-lg dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="text-base font-poppins font-semibold dark:text-primary">
        Booking Mode
      </div>
      <div className="grid grid-cols-5 gap-4 h-[calc(100%-2rem)]">
        <div className="grid grid-rows-5 col-span-2 gap-4 h-[calc(100vh-6rem)]">
          {/* Check Availability */}
          <div className="row-span-2">
            <CheckAvailability />
          </div>
          {/* Upcoming Bookings */}
          <div className="row-span-3">
            <UpcomingBooking />
          </div>
        </div>
        <div className="col-span-3 max-h-[80vh] border dark:border-gray-600 rounded-xl my-auto overflow-y-auto scrollbar-hide">
          {/* Current Booking Status */}
          {selectedMachine ? (
            <div className="">
              {currentBooking ? (
                <CurrentBookingDetails
                  currentBooking={currentBooking}
                  nextBooking={nextBooking ? nextBooking : null}
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
