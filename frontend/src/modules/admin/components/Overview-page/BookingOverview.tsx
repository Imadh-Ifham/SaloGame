import { selectSelectedMachine } from "@/store/selectors/machineSelector";
import { availabilityBgColors } from "@/types/machine";
import React from "react";
import { useSelector } from "react-redux";
import BookedMachineLog from "./BookedMachineLog";
import { selectAllMachineBookings } from "@/store/slices/bookingSlice";

const BookingOverview: React.FC = () => {
  const machine = useSelector(selectSelectedMachine);
  const allMachineBookings = useSelector(selectAllMachineBookings);
  return (
    <div className="h-screen col-span-5 row-span-1 lg:col-span-2 lg:row-span-2 flex flex-col p-4 border-l shadow-md bg-white rounded-md">
      <h2 className="text-lg font-semibold text-gray-800">Machine Overview</h2>

      <div className=" h-[90%] grid grid-cols-1 grid-rows-7 gap-1 mt-4">
        {machine ? (
          <div className="col-span-1 row-span-2">
            <div className="text-center text-base font-medium text-gray-700">
              {machine?.serialNumber}
              <span className="italic text-gray-500">
                {" "}
                ({machine?.machineCategory})
              </span>
            </div>
            <div className="flex flex-col items-center justify-center mt-3">
              <div
                className={`text-sm font-medium px-4 py-1 rounded-full border shadow-sm text-white ${
                  availabilityBgColors[
                    allMachineBookings[machine._id].status
                  ] || "bg-gray-500"
                }`}
              >
                {allMachineBookings[machine._id].status}
              </div>
              {allMachineBookings[machine._id].status !== "Maintenance" && (
                <div className="mt-3 text-sm text-gray-600 space-y-1">
                  <div>
                    <span className="font-medium">Till:</span>{" "}
                    <span>10:00 AM</span>
                  </div>
                  <div>
                    <span className="font-medium">Next Booking:</span>{" "}
                    <span>12:00 PM</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="italic h-40 col-span-1 row-span-2 text-gray-500 text-sm text-center">
            Please select a machine from the layout...
          </div>
        )}
        {/* Booking Log & Controls */}
        <div className="flex col-span-1 row-span-5">
          <BookedMachineLog />
        </div>
      </div>
    </div>
  );
};

export default BookingOverview;
