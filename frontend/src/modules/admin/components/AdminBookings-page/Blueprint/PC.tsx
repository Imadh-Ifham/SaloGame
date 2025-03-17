/**
 * PC Component - Represents a machine (PC) in the game lounge layout.
 *
 * This component visually displays a PC setup and handles user interaction for selection.
 * It allows both single and multiple machine selections based on the booking status.
 *
 * ## **Redux State & Usage**
 * - **selectedMachine** (`Machine | null`): Stores the currently selected machine.
 * - **allMachineBookings** (`Record<string, { status: string }>`): Stores the booking status of all machines.
 * - **isMoreMachineClicked** (`boolean`): Determines if multiple machines can be selected at once.
 * - **formData** (`{ machines: { machineID: string; userCount: number }[] }`):
 *   - Stores the currently selected machines for booking.
 *   - Used to add or remove machines when booking.
 * - **dispatch** (`Dispatch`): Handles updates to Redux state.
 *
 * ## **Component Props**
 * - **machine (`Machine`)**: Represents the machine's details such as serial number and booking status.
 * - **rotate (`number`)**: Determines the rotation of the PC layout in the UI.
 *
 * ## **Component Features**
 * - **Machine Selection (`handleMachineSelect`)**
 *   - Allows selection only if `isMoreMachineClicked` is enabled and the machine is "Available".
 *   - Toggles selection in the booking form.
 *   - Updates the selected machine in the Redux state.
 *
 * - **Dynamic Styling**
 *   - Highlights selected machines.
 *   - Grays out unavailable machines (`opacity-50` and `cursor-not-allowed`).
 *   - Shows machine availability status using colored dots.
 *   - Rotates the PC layout based on the `rotate` prop.
 *
 * ## **Rendered Components**
 * - **Machine Status Indicator**
 *   - Displays machine serial number.
 *   - Shows a colored status indicator based on availability.
 *
 * - **PC Layout**
 *   - Monitor and CPU represented visually.
 *   - A seat positioned beside the machine.
 *   - Uses Tailwind CSS for styling.
 */

import { selectSelectedMachine } from "@/store/selectors/machineSelector";
import {
  selectAllMachineBookings,
  selectFormData,
  updateBookingForm,
} from "@/store/slices/bookingSlice";
import { selectMachine } from "@/store/slices/machineSlice";
import { availabilityBgColors, Machine } from "@/types/machine";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectIsMoreMachineClicked } from "@/store/slices/layoutSlice";

interface PCProps {
  machine: Machine;
  rotate: number;
}

const PC: React.FC<PCProps> = ({ machine, rotate }) => {
  const dispatch = useDispatch();
  const selectedMachine = useSelector(selectSelectedMachine);
  const allMachineBookings = useSelector(selectAllMachineBookings);
  const isMoreMachineClicked = useSelector(selectIsMoreMachineClicked);
  const formData = useSelector(selectFormData);

  const handleMachineSelect = () => {
    if (isMoreMachineClicked) {
      if (allMachineBookings[machine._id].status !== "Available") {
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
      dispatch(updateBookingForm({ machines: [] })); // Clear multi-selection
      dispatch(selectMachine(machine._id));
    }
  };

  const isSelected = formData.machines.some((m) => m.machineID === machine._id);
  const isAvailable = allMachineBookings[machine._id].status === "Available";

  return (
    <div
      onClick={handleMachineSelect}
      className={`w-20 h-20 border border-gray-300 rounded-md hover:bg-gray-200 hover:scale-105 shadow-lg transition-transform duration-300 ease-in-out flex flex-col items-center cursor-pointer ${
        selectedMachine?.serialNumber === machine.serialNumber &&
        !isMoreMachineClicked
          ? "bg-gray-300 scale-105"
          : ""
      } ${isSelected ? "bg-gray-300" : ""} ${
        !isAvailable && isMoreMachineClicked
          ? "opacity-50 !cursor-default hover:scale-100"
          : ""
      }`}
    >
      <div className="flex justify-center items-center gap-x-2">
        <div className="text-gray-500 mt-[2px] text-xs">
          {machine.serialNumber}
        </div>
        <div
          className={`w-2 h-2 rounded-full ${
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
      <div
        className={`w-full h-full flex transform ${
          rotate === 90
            ? "rotate-90"
            : rotate === 180
            ? "rotate-180"
            : rotate === 270
            ? "rotate-270"
            : ""
        }`}
      >
        <div
          id="pc"
          className={`w-1/2 h-full flex justify-center items-center bg-gray-200 rounded-md`}
        >
          <div className="w-[2px] h-3 bg-slate-700 " />
          <div className="w-1 h-10 bg-slate-700 rounded-l-lg" />

          <div className="ml-1 h-10 flex flex-col justify-between items-center">
            <div className="w-[6px] h-[6px] bg-slate-600 rounded-[2px]" />
            <div className="w-3 h-8 bg-slate-400  rounded-[4px]" />
          </div>
        </div>
        <div
          id="seat"
          className="w-1/2 h-full flex justify-center items-center"
        >
          <div className="flex justify-end w-4 h-5 bg-slate-400 overflow-hidden rounded-l-[6px] rounded-r-[3px]">
            <div className="w-1 h-full bg-slate-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PC;
