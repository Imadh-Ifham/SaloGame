import React, { useState, useEffect } from "react";
import { Button } from "@headlessui/react";
import axiosInstance from "../../../../axios.config";

interface Game {
  _id: string;
  name: string;
}

interface Machine {
  _id: string;
  machineCategory: string;
  serialNumber: string;
  status: string;
}

interface AssignMachinesFormProps {
  game: Game;
  onSuccess: () => void;
  onCancel: () => void;
}

const AssignMachinesForm: React.FC<AssignMachinesFormProps> = ({
  game,
  onSuccess,
  onCancel,
}) => {
  const [machines, setMachines] = useState<Machine[]>([]);
  // selectedMachines holds the current checkbox selection
  const [selectedMachines, setSelectedMachines] = useState<string[]>([]);
  // initiallyAssigned holds the machines that were pre-assigned fetched from the backend
  const [initiallyAssigned, setInitiallyAssigned] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all machines
  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const response = await axiosInstance.get("/machine/get-all");
        if (response.data.success && Array.isArray(response.data.data)) {
          setMachines(response.data.data);
        } else {
          setError("Invalid response format while fetching machines");
        }
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            "An unexpected error occurred while fetching machines."
        );
      }
    };

    fetchMachines();
  }, []);

  // Fetch currently assigned machines for the game to pre-check them
  useEffect(() => {
    const fetchAssignedMachines = async () => {
      try {
        const response = await axiosInstance.get(
          `/machinegames/game/${game._id}/machines`
        );
        if (Array.isArray(response.data)) {
          // Assuming response data is an array of machine-game associations where each entry's machine field contains the machine details.
          const assignedIds = response.data.map((mg: any) => mg.machine._id);
          setInitiallyAssigned(assignedIds);
          setSelectedMachines(assignedIds);
        } else {
          setError("Invalid response format while fetching assigned machines");
        }
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            "An unexpected error occurred while fetching assigned machines."
        );
      }
    };

    fetchAssignedMachines();
  }, [game._id]);

  const handleMachineSelect = (machineId: string) => {
    setSelectedMachines((prev) =>
      prev.includes(machineId)
        ? prev.filter((id) => id !== machineId)
        : [...prev, machineId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Calculate differences compared to the initial assignments
    const machinesToAdd = selectedMachines.filter(
      (id) => !initiallyAssigned.includes(id)
    );
    const machinesToRemove = initiallyAssigned.filter(
      (id) => !selectedMachines.includes(id)
    );

    try {
      // If there are machines to add, assign them
      if (machinesToAdd.length > 0) {
        const assignResponse = await axiosInstance.post(
          "/machinegames/assign",
          {
            machineIds: machinesToAdd,
            gameId: game._id,
          }
        );
        if (!assignResponse.data.success) {
          setError(assignResponse.data.message || "Failed to assign machines.");
          setLoading(false);
          return;
        }
      }

      // If there are machines to remove, unassign them
      if (machinesToRemove.length > 0) {
        const removeResponse = await axiosInstance.post(
          "/machinegames/remove",
          {
            machineIds: machinesToRemove,
            gameId: game._id,
          }
        );
        if (!removeResponse.data.success) {
          setError(removeResponse.data.message || "Failed to remove machines.");
          setLoading(false);
          return;
        }
      }

      // After successful operations, update the initiallyAssigned state to match the current selection
      setInitiallyAssigned(selectedMachines);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Select Machines
        </label>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {machines.map((machine) => (
            <div key={machine._id} className="flex items-center">
              <input
                type="checkbox"
                id={machine._id}
                checked={selectedMachines.includes(machine._id)}
                onChange={() => handleMachineSelect(machine._id)}
                className="h-4 w-4 text-gamer-green border-gray-300 rounded focus:ring-gamer-green"
              />
              <label
                htmlFor={machine._id}
                className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                {machine.serialNumber} ({machine.machineCategory})
              </label>
            </div>
          ))}
        </div>
      </div>

      {error && <div className="text-red-500 text-sm text-center">{error}</div>}

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 bg-gamer-green text-white rounded hover:bg-gamer-green-dark transition ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
};

export default AssignMachinesForm;
