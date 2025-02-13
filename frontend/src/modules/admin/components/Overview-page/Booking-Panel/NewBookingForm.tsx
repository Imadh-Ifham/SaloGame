import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FileTextOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  selectFormData,
  setShowBookingForm,
  updateBookingForm,
  setInitialMachines,
} from "@/store/slices/bookingSlice";
import { AppDispatch } from "@/store/store";
import dayjs from "dayjs";
import { fromUTC } from "@/utils/date.util";
import {
  selectSelectedMachine,
  selectMachines,
} from "@/store/selectors/machineSelector";

const NewBookingForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const formData = useSelector(selectFormData);
  const selectedMachine = useSelector(selectSelectedMachine);
  const machines = useSelector(selectMachines);
  const userTimezone = dayjs.tz.guess(); // Automatically detect user's timezone

  useEffect(() => {
    if (selectedMachine) {
      dispatch(setInitialMachines(selectedMachine._id));
    }
  }, [selectedMachine, dispatch]);

  const handleStartBooking = () => {
    dispatch(setShowBookingForm(false));
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

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md mx-auto">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">New Booking</h3>

      <div className="mb-4 flex justify-between">
        <div className="text-gray-700 text-sm">
          <strong>Start Time:</strong> {formattedStartTime}
        </div>
        {localEndTime && (
          <div className="text-gray-700 text-sm">
            <strong>End Time:</strong> {formattedEndTime}
          </div>
        )}
      </div>

      <div className="mb-4 text-sm">
        <strong>Selected Machines:</strong>
        <div className="space-y-2 mt-2">
          {formData.machines.map((machine, index) => (
            <div key={index} className="flex items-center gap-2">
              <span>{getMachineSerialNumber(machine.machineID)}</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((count) => (
                  <button
                    key={count}
                    className={`px-3 py-1 rounded-md border ${
                      machine.userCount === count
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-600 border-gray-300"
                    }`}
                    onClick={() => handleUserCountChange(index, count)}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {/* Customer Name Input */}
        <div className="relative">
          <UserOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Customer Name"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            placeholder="Contact Number"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.phoneNumber ? formData.phoneNumber : ""}
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
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            value={formData.notes ? formData.notes : ""}
            onChange={(e) =>
              dispatch(updateBookingForm({ notes: e.target.value }))
            }
          />
        </div>

        {/* Start Booking Button */}
        <button
          onClick={handleStartBooking}
          disabled={!formData.customerName}
          className={`w-full py-2 text-white rounded-lg transition duration-300 ${
            formData.customerName
              ? "bg-blue-600 hover:bg-blue-700"
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
