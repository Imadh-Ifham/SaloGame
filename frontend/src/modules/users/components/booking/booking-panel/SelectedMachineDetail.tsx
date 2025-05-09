import { selectMachines } from "@/store/selectors/machineSelector";
import { selectFormData, updateBookingForm } from "@/store/slices/bookingSlice";
import { AppDispatch } from "@/store/store";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaGamepad, FaDesktop, FaExclamationCircle } from "react-icons/fa";

interface SelectedMachineDetailProps {
    setActiveTab: (tab: string) => void;
}

const SelectedMachineDetail: React.FC<SelectedMachineDetailProps> = ({setActiveTab}) => {
  const dispatch = useDispatch<AppDispatch>();
  const formData = useSelector(selectFormData);
  const machines = useSelector(selectMachines);

  const consoleMachines = formData.machines.filter(
    (machine) =>
      machines.find((m) => m._id === machine.machineID)?.machineCategory ===
      "Console"
  );
  const otherMachines = formData.machines.filter(
    (machine) =>
      machines.find((m) => m._id === machine.machineID)?.machineCategory !==
      "Console"
  );

  const getMachineSerialNumber = (machineID: string) => {
    const machine = machines.find((m) => m._id === machineID);
    return machine ? machine.serialNumber : machineID;
  };

  const handleUserCountChange = (index: number, userCount: number) => {
    const updatedMachines = [...formData.machines];
    updatedMachines[index] = {
      ...updatedMachines[index],
      userCount: userCount,
    };
    dispatch(updateBookingForm({ machines: updatedMachines }));
  };

  return (
    <div className="mt-10 mb-4 text-sm space-y-6">
      <div className="text-gray-800 dark:text-gray-100 font-bold text-lg">
        Selected Machines
      </div>

      {/* No Machines Selected */}
      {formData.machines.length === 0 && (
        <div className="flex flex-col items-center justify-center text-gray-600 dark:text-gray-300 py-12">
          <FaExclamationCircle className="text-5xl mb-3 text-gray-400 dark:text-gray-500" />
          <p className="text-center text-base font-medium">No machines selected</p>
        </div>
      )}

      {/* Other Machines (PC) */}
      {otherMachines.length > 0 && (
        <div className="flex flex-wrap gap-4">
          {otherMachines.map((machine, index) => (
            <div
              key={index}
              className="flex flex-col items-center bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 shadow-md w-24"
            >
              <FaDesktop className="h-8 w-8 text-green-500" />
              <span className="mt-1 text-center text-xs text-gray-700 dark:text-gray-200 font-semibold">
                {getMachineSerialNumber(machine.machineID)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Console Machines with User Count */}
      {consoleMachines.length > 0 && (
        <div className="space-y-4">
          {consoleMachines.map((machine, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <FaGamepad className="h-12 w-12 text-green-500" />
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {getMachineSerialNumber(machine.machineID)}
                </span>
              </div>
              <div className="flex gap-2">
                {[1, 2, 4].map((count) => (
                  <button
                    key={count}
                    onClick={() => {
                        const actualIndex = formData.machines.findIndex((m) => m.machineID === machine.machineID);
                        handleUserCountChange(actualIndex, count);
                      }}
                    className={`rounded-full px-3 py-1 text-sm font-semibold border transition-all duration-200 ${
                      machine.userCount === count
                        ? "bg-green-800 text-white shadow-md"
                        : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-500"
                    }`}
                  >
                    {count}P
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

    {/* Sticky Next Button */}
    <div className="absolute bottom-0 right-0 p-4 bg-gradient-to-t from-white dark:from-gray-900 w-full flex justify-end">
        <button
            disabled={
            !formData.startTime ||
            !formData.duration ||
            formData.machines.length === 0
            }
            className={`px-6 py-2 rounded-xl text-white font-semibold transition-all duration-200 ${
            !formData.startTime ||
            !formData.duration ||
            formData.machines.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
            onClick={() => {
                setActiveTab("customer-details");
            }}
        >
            Next
        </button>
    </div>


    </div>
  );
};

export default SelectedMachineDetail;
