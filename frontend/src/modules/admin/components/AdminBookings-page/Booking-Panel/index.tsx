import React from "react";
import {
  selectAllMachineBookings,
  selectBookingStatus,
} from "@/store/slices/bookingSlice";
import { useSelector } from "react-redux";
import { selectSelectedMachine } from "@/store/selectors/machineSelector";
import CheckAvailability from "./CheckAvailability";
import NewBookingForm from "./NewBookingForm";
import CurrentBookingDetails from "./CurrentBookingDetails";

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
    <div className="py-2 px-4 flex flex-col gap-4 h-screen">
      <div className="text-lg font-bold">Booking Mode</div>
      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-2">
          {/* Check Availability */}
          <CheckAvailability />
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
