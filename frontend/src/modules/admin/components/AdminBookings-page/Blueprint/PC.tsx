import { selectSelectedMachine } from "@/store/selectors/machineSelector";
import { selectAllMachineBookings } from "@/store/slices/bookingSlice";
import { selectMachine } from "@/store/slices/machineSlice";
import { availabilityBgColors, Machine } from "@/types/machine";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

interface PCProps {
  machine: Machine;
  rotate: number;
}

const PC: React.FC<PCProps> = ({ machine, rotate }) => {
  const dispatch = useDispatch();
  const handleMachineSelect = () => {
    dispatch(selectMachine(machine._id));
  };
  const selectedMachine = useSelector(selectSelectedMachine);
  const allMachineBookings = useSelector(selectAllMachineBookings);
  return (
    <div
      onClick={handleMachineSelect}
      className={`w-20 h-20 border border-green-300 rounded-md hover:bg-gray-200 hover:scale-105 hover:shadow-lg transition-transform duration-300 ease-in-out flex flex-col items-center cursor-pointer ${
        selectedMachine?.serialNumber === machine.serialNumber
          ? "bg-gray-200 scale-105"
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
