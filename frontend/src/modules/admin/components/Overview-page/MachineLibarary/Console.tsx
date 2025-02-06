import { selectSelectedMachine } from "@/store/selectors/machineSelector";
import { selectAllMachineBookings } from "@/store/slices/bookingSlice";
import { selectMachine } from "@/store/slices/machineSlice";
import { availabilityBgColors, Machine } from "@/types/machine";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

interface ConsoleProp {
  machine: Machine;
}
const Console: React.FC<ConsoleProp> = ({ machine }) => {
  const dispatch = useDispatch();
  const handleMachineSelect = () => {
    dispatch(selectMachine(machine._id));
  };
  const selectedMachine = useSelector(selectSelectedMachine);
  const allMachineBookings = useSelector(selectAllMachineBookings);
  return (
    <div
      onClick={handleMachineSelect}
      className={`w-full h-32 border rounded-2xl border-gray-300 hover:bg-gray-200 hover:scale-105 hover:shadow-xl
    transition-transform duration-300 ease-in-out overflow-hidden flex flex-col items-center cursor-pointer ${
      selectedMachine?.serialNumber === machine.serialNumber
        ? "bg-gray-200 scale-105 shadow-lg"
        : ""
    }`}
    >
      {/* Machine Info */}
      <div className="flex justify-center items-center gap-x-2">
        <div className="text-gray-500 mt-1 font-semibold">
          {machine.serialNumber}
        </div>
        <div
          className={`w-3 h-3 rounded-full shadow-md ${
            allMachineBookings[machine._id].status === "Available"
              ? availabilityBgColors.Available
              : allMachineBookings[machine._id].status === "Booked"
              ? availabilityBgColors.Booked
              : allMachineBookings[machine._id].status === "InUse"
              ? availabilityBgColors.InUse
              : availabilityBgColors.Maintenance
          }`}
        />
      </div>

      {/* Console Representation */}
      <div className="w-full flex items-center flex-grow gap-4">
        {/* Screen with slight depth */}
        <div id="screen" className="w-1/2 h-16 flex items-center relative">
          <div className="w-1 h-10 bg-slate-700 rounded-l-lg shadow-md" />
          <div className="w-1 h-full bg-slate-700 rounded-sm shadow-md" />
        </div>

        {/* Sofa with better depth */}
        <div
          id="sofa"
          className="h-[90%] flex flex-col items-center bg-slate-300 rounded-md overflow-hidden shadow-md"
        >
          <div className="w-8 h-2 bg-slate-500 rounded-l-sm rounded-tr-md shadow-sm" />
          <div className="flex flex-grow">
            <div className="w-6 h-full" />
            <div className="w-2 h-full bg-slate-500 shadow-sm" />
          </div>
          <div className="w-8 h-2 bg-slate-500 rounded-l-sm rounded-br-md shadow-sm" />
        </div>
      </div>
    </div>
  );
};

export default Console;
