import axiosInstance from "@/axios.config";
import Modal from "@/components/Modal";
import {
  selectMachineLoading,
  selectMachineModalCommand,
} from "@/store/selectors/machineSelector";
import { resetMachineModalCommand } from "@/store/slices/machineSlice";
import { AppDispatch } from "@/store/store";
import { IMachineType } from "@/types/machine";
import { Button } from "@headlessui/react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";

const MachineModal: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const dispatch = useDispatch<AppDispatch>();
  const command = useSelector(selectMachineModalCommand);
  return (
    <Modal
      isOpen={command !== null}
      onClose={() => dispatch(resetMachineModalCommand())}
      title={
        command === "add"
          ? "Add Machine"
          : command === "remove"
          ? "Remove Machine"
          : ""
      }
    >
      {command === "add" && <AddMachineModal onSuccess={onSuccess} />}
      {command === "remove" && <RemoveMachineModal onSuccess={onSuccess} />}
    </Modal>
  );
};

const AddMachineModal: React.FC<{ onSuccess?: () => void }> = ({
  onSuccess,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector(selectMachineLoading);

  const [name, setName] = useState("");
  const [machineType, setMachineType] = useState<IMachineType[]>([]);
  const [selectedMachineType, setSelectedMachineType] =
    useState<IMachineType>();
  const [pcType, setPcType] = useState<"PC-L" | "PC-R" | "">("");

  const handleAdd = async () => {
    if (isAddDisabled) return;

    try {
      // Create machine object to send to backend
      const machineData = {
        machineType: selectedMachineType?._id,
        serialNumber: name,
        machineCategory:
          selectedMachineType?.name === "PC" ? pcType : "Console",
      };

      const response = await axiosInstance.post("/machine", machineData);

      if (response.data.success) {
        toast.success("Machine added successfully");
        dispatch(resetMachineModalCommand());
        if (onSuccess) onSuccess(); // Refresh machines list
      }
    } catch (error) {
      console.error("Error adding machine:", error);
      toast.error("Failed to add machine");
    }
  };

  useEffect(() => {
    const getAllMachineTypes = async () => {
      try {
        const response = await axiosInstance.get("/machine/type");
        // Check both possible response structures
        if (response.data.success && response.data.data) {
          setMachineType(response.data.data);
        } else if (Array.isArray(response.data)) {
          // If the response is directly an array
          setMachineType(response.data);
        } else if (response.data.status && response.data.data) {
          setMachineType(response.data.data);
        } else {
          console.error("Unexpected API response format:", response.data);
          toast.error("Could not load machine types, unexpected data format");
        }
      } catch (error) {
        console.error("Error fetching machine types:", error);
        toast.error("Failed to load machine types");
      }
    };
    getAllMachineTypes();
  }, []);

  // Debugging - log response for future reference
  useEffect(() => {
    console.log("Machine types loaded:", machineType);
  }, [machineType]);

  const isAddDisabled =
    !name ||
    !machineType?.length ||
    !selectedMachineType ||
    (selectedMachineType?.name === "PC" && !pcType);

  return (
    <div className="flex flex-col gap-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        Add Machine
      </h2>

      {/* Machine Name Input */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Machine Name
        </label>
        <input
          type="text"
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter machine name"
        />
      </div>

      {/* Machine Type Selection */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Machine Type
        </label>
        <div className="flex gap-4">
          {machineType && machineType.length > 0 ? (
            machineType.map((type) => (
              <div
                key={type._id}
                className={`px-4 py-2 border rounded-lg cursor-pointer transition-all ${
                  selectedMachineType?._id === type._id
                    ? "bg-primary/30 text-white"
                    : "bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                }`}
                onClick={() => setSelectedMachineType(type)}
              >
                {type.name}
              </div>
            ))
          ) : (
            <div className="text-gray-500 dark:text-gray-400">
              No machine types available
            </div>
          )}
        </div>
      </div>

      {/* PC Type Selection (Only visible if PC is selected) */}
      {selectedMachineType && selectedMachineType.name === "PC" && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            PC Type
          </label>
          <div className="flex gap-4">
            {["PC-L", "PC-R"].map((type) => (
              <div
                key={type}
                className={`px-4 py-2 border rounded-lg cursor-pointer transition-all ${
                  pcType === type
                    ? "bg-primary/30 text-white"
                    : "bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                }`}
                onClick={() => setPcType(type as "PC-L" | "PC-R")}
              >
                {type}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          onClick={() => dispatch(resetMachineModalCommand())}
          className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition cursor-pointer"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleAdd}
          className={`px-4 py-2 rounded transition ${
            isAddDisabled || loading
              ? "bg-gray-400 dark:bg-gray-600 text-gray-300 cursor-not-allowed"
              : "bg-primary/30 text-white hover:bg-blue-600 cursor-pointer"
          }`}
          disabled={isAddDisabled || loading}
        >
          {loading ? "Adding Machine..." : "Add"}
        </Button>
      </div>
    </div>
  );
};

const RemoveMachineModal: React.FC<{ onSuccess?: () => void }> = ({
  onSuccess,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector(selectMachineLoading);
  const [serialNumber, setSerialNumber] = useState("");

  const handleRemove = async () => {
    if (!serialNumber.trim()) return;

    try {
      const response = await axiosInstance.delete(`/machine/${serialNumber}`);

      if (response.data.success) {
        toast.success("Machine deleted successfully");
        dispatch(resetMachineModalCommand());
        if (onSuccess) onSuccess(); // Refresh machines list
      }
    } catch (error) {
      console.error("Error removing machine:", error);
      toast.error("Failed to remove machine");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Serial Number:
      </label>
      <input
        type="text"
        value={serialNumber}
        onChange={(e) => setSerialNumber(e.target.value)}
        placeholder="Enter serial number"
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          onClick={() => dispatch(resetMachineModalCommand())}
          className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleRemove}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          disabled={loading || !serialNumber.trim()} // Disable if loading or serialNumber is empty
        >
          {loading ? "Removing Machine..." : "Remove"}
        </Button>
      </div>
    </div>
  );
};

export default MachineModal;
