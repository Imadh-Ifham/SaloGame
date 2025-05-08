import { selectSelectedMachine } from "@/store/selectors/machineSelector";
import {
  selectFormData,
  selectMachineStatus,
  updateBookingForm,
} from "@/store/slices/bookingSlice";
import { selectMachine } from "@/store/slices/machineSlice";
import { availabilityBgColors, Machine } from "@/types/machine";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectIsMoreMachineClicked } from "@/store/slices/layoutSlice";

interface ConsoleProp {
  machine: Machine;
}

const Console: React.FC<ConsoleProp> = ({ machine }) => {
  const dispatch = useDispatch();
  const selectedMachine = useSelector(selectSelectedMachine);
  const allMachineStatus = useSelector(selectMachineStatus);
  const isMoreMachineClicked = useSelector(selectIsMoreMachineClicked);
  const formData = useSelector(selectFormData);

  if (!allMachineStatus[machine._id]) {
    return (
      <div className="w-full h-32 border border-gray-300 dark:border-gray-500 rounded-md bg-gray-300 animate-pulse" />
    );
  }

  const handleMachineSelect = () => {
    if (isMoreMachineClicked) {
      if (allMachineStatus[machine._id].status !== "Available") {
        return; // Only allow selection of machines with status "Available"
      }

      const isSelected = formData.machines.some(
        (m) => m.machineID === machine._id
      );
      const updatedMachines = isSelected
        ? formData.machines.filter((m) => m.machineID !== machine._id)
        : [...formData.machines, { machineID: machine._id, userCount: 1 }];

      dispatch(updateBookingForm({ machines: updatedMachines }));
    } else {
      dispatch(updateBookingForm({ machines: [] }));
      dispatch(selectMachine(machine._id));
    }
  };

  const isSelected = formData.machines.some((m) => m.machineID === machine._id);
  const isAvailable = allMachineStatus[machine._id].status === "Available";

  return (
    <div
      onClick={handleMachineSelect}
      className={`w-full h-32 border rounded-2xl border-gray-300 dark:border-gray-500 hover:bg-gray-200 dark:bg-gray-700 hover:scale-105 shadow-xl
    transition-transform duration-300 ease-in-out overflow-hidden flex flex-col items-center cursor-pointer ${
      selectedMachine?.serialNumber === machine.serialNumber &&
      !isMoreMachineClicked
        ? "bg-gray-300 dark:bg-gray-800 scale-105 shadow-lg"
        : ""
    } ${isSelected ? "bg-gray-200" : ""} ${
        !isAvailable && isMoreMachineClicked
          ? "opacity-50 !cursor-default hover:scale-100"
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
            allMachineStatus[machine._id].status === "Available"
              ? availabilityBgColors.Available
              : allMachineStatus[machine._id].status === "Booked"
              ? availabilityBgColors.Booked
              : allMachineStatus[machine._id].status === "InUse"
              ? availabilityBgColors.InUse
              : availabilityBgColors.Maintenance
          }`}
        />
      </div>

      {/* Console Representation */}
      <div className="w-full flex items-center flex-grow gap-4">
        {/* Screen with slight depth */}
        <div id="screen" className="w-1/2 h-16 flex items-center relative">
          <div className="w-1 h-10 bg-slate-600 dark:bg-gray-500 rounded-l-lg shadow-md" />
          <div className="w-1 h-full bg-slate-700 dark:bg-gray-400 rounded-sm shadow-md" />
        </div>

        {/* Sofa with better depth */}
        <div
          id="sofa"
          className="h-[90%] flex flex-col items-center bg-slate-300 dark:bg-gray-500 rounded-md overflow-hidden shadow-md"
        >
          <div className="w-8 h-2 bg-slate-500 dark:bg-gray-800 rounded-l-sm rounded-tr-md shadow-sm" />
          <div className="flex flex-grow">
            <div className="w-6 h-full" />
            <div className="w-2 h-full bg-slate-500 dark:bg-gray-800 shadow-sm" />
          </div>
          <div className="w-8 h-2 bg-slate-500 dark:bg-gray-800 rounded-l-sm rounded-br-md shadow-sm" />
        </div>
      </div>
    </div>
  );
};

export default Console;
