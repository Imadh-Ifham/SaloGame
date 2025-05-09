import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FileTextOutlined,
  PhoneOutlined,
  UserOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  selectFormData,
  setShowBookingForm,
  updateBookingForm,
  setInitialMachines,
  selectBookingStatus,
} from "@/store/slices/bookingSlice";
import { AppDispatch } from "@/store/store";
import dayjs from "dayjs";
import { fromUTC, getCurrentUTC, toUTC } from "@/utils/date.util";
import {
  selectSelectedMachine,
  selectMachines,
} from "@/store/selectors/machineSelector";
import {
  resetMoreMachine,
  selectIsMoreMachineClicked,
  toggleMoreMachine,
} from "@/store/slices/layoutSlice";
import {
  createBooking,
  fetchFirstAndNextBooking,
  fetchMachineStatus,
} from "@/store/thunks/bookingThunk";
import { FaDesktop, FaGamepad } from "react-icons/fa";

const NewBookingForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const formData = useSelector(selectFormData);
  const selectedMachine = useSelector(selectSelectedMachine);
  const machines = useSelector(selectMachines);
  const isPlusButtonSelected = useSelector(selectIsMoreMachineClicked);
  const { error } = useSelector(selectBookingStatus);
  const userTimezone = dayjs.tz.guess(); // Automatically detect user's timezone

  useEffect(() => {
    if (selectedMachine) {
      dispatch(setInitialMachines(selectedMachine._id));
    }
  }, [selectedMachine, dispatch]);

  useEffect(() => {
    if (error) {
      alert(error);
    }
  }, [error]);

  const handleStartBooking = async () => {
    dispatch(resetMoreMachine());
    dispatch(setShowBookingForm(false));

    await dispatch(createBooking(formData))
      .then(() => {
        if (selectedMachine) {
          dispatch(
            fetchFirstAndNextBooking({
              startTime: formData.startTime
                ? toUTC(formData.startTime)
                : getCurrentUTC(),
              duration: formData.duration,
              machineID: selectedMachine._id,
            })
          );
        }
      })
      .then(() => {
        dispatch(
          fetchMachineStatus({
            startTime: formData.startTime,
            duration: formData.duration,
          })
        );
      })
      .catch((error) => {
        console.error("Booking failed:", error);
      });
  };

  // Convert UTC times to user's local timezone
  const localStartTime = fromUTC(formData.startTime, userTimezone);
  const localEndTime = formData.endTime
    ? fromUTC(formData.endTime, userTimezone)
    : "";

  // Format time to 'h:mm A' format (e.g., "9:00 PM")
  const formattedStartTime = dayjs(localStartTime).format("h:mm A");
  const formattedEndTime = dayjs(localEndTime).format("h:mm A");

  const handleUserCountChange = (index: number, userCount: number) => {
    const updatedMachines = [...formData.machines];
    updatedMachines[index] = {
      ...updatedMachines[index],
      userCount: userCount,
    };
    dispatch(updateBookingForm({ machines: updatedMachines }));
  };

  const getMachineSerialNumber = (machineID: string) => {
    const machine = machines.find((m) => m._id === machineID);
    return machine ? machine.serialNumber : machineID;
  };

  const handlePlusButtonClick = () => {
    dispatch(toggleMoreMachine());
  };

  // Separate machines into consoles and others
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

  return (
    <div className="text-gray-700 dark:text-gray-50 p-6 w-full max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-4 dark:text-primary">
        New Booking
      </h3>

      <div className="mb-4 flex justify-between">
        <div className="text-gray-700 dark:text-gray-300 text-sm">
          <strong>Start Time:</strong> {formattedStartTime}
        </div>
        {localEndTime && (
          <div className="text-gray-700 dark:text-gray-300 text-sm">
            <strong>End Time:</strong> {formattedEndTime}
          </div>
        )}
      </div>

      <div className="mb-4 text-sm space-y-2">
        <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
          <strong>Selected Machines:</strong>
          <button
            onClick={handlePlusButtonClick}
            className={`w-6 h-6 flex items-center justify-center rounded-full transition-colors duration-300 ${
              isPlusButtonSelected ? "bg-green-600" : "bg-gray-400"
            }`}
          >
            <PlusOutlined className="text-white" />
          </button>
        </div>
        {/* Other Machines (PC) */}
        {otherMachines.length > 0 && (
          <div className="flex flex-wrap gap-4">
            {otherMachines.map((machine, index) => (
              <div
                key={index}
                className="flex flex-col items-center bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-2 py-1 shadow-md w-16"
              >
                <FaDesktop className="h-6 w-6 text-green-500" />
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
                className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl py-2 px-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <FaGamepad className="h-8 w-8 text-green-500" />
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
                          ? "bg-green-500 text-white shadow-md"
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
      </div>

      <div className="space-y-4">
        {/* Customer Name Input */}
        <div className="relative">
          <UserOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Customer Name"
            required
            className="w-full pl-10 pr-4 py-2 border dark:border-gray-500 dark:bg-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.customerName}
            onChange={(e) =>
              dispatch(updateBookingForm({ customerName: e.target.value }))
            }
          />
        </div>

        {/* Contact Number Input */}
        <div className="relative">
          <PhoneOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="tel"
            maxLength={10}
            minLength={10}
            pattern="[0-9]{10}"
            placeholder="Contact Number"
            required
            className="w-full pl-10 pr-4 py-2 border dark:border-gray-500 dark:bg-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.phoneNumber ? formData.phoneNumber : ""}
            onKeyDown={(e) => {
              // Only allow number keys, backspace, delete, arrow keys, and tab
              if (
                !/[0-9]/.test(e.key) && // Allow numbers only
                e.key !== "Backspace" && // Allow backspace
                e.key !== "Delete" && // Allow delete
                e.key !== "ArrowLeft" && // Allow left arrow
                e.key !== "ArrowRight" // Allow right arrow
              ) {
                e.preventDefault(); // Block the input if it's not a number
              }
            }}
            onChange={(e) =>
              dispatch(updateBookingForm({ phoneNumber: e.target.value }))
            }
          />
        </div>

        {/* Notes Input */}
        <div className="relative">
          <FileTextOutlined className="absolute left-3 top-3 text-gray-500" />
          <textarea
            placeholder="Notes (optional)"
            rows={3}
            className="w-full pl-10 pr-4 py-2 border dark:border-gray-500 dark:bg-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            value={formData.notes ? formData.notes : ""}
            onChange={(e) =>
              dispatch(updateBookingForm({ notes: e.target.value }))
            }
          />
        </div>

        {/* Start Booking Button */}
        <button
          onClick={handleStartBooking}
          disabled={
            !formData.customerName ||
            !formData.phoneNumber ||
            !/^[0-9]{10}$/.test(formData.phoneNumber) // Ensure phone number is in the correct format
          }
          className={`w-full py-2 text-white dark:text-black font-semibold rounded-lg transition duration-300 ${
            formData.customerName &&
            formData.phoneNumber &&
            /^[0-9]{10}$/.test(formData.phoneNumber)
              ? "bg-blue-600 dark:bg-primary hover:bg-blue-700 dark:hover:bg-primary-dark"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Start Booking
        </button>
      </div>
    </div>
  );
};

export default NewBookingForm;
