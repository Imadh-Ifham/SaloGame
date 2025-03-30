import React, { useState, useEffect } from "react";
import axiosInstance from "../../../../axios.config";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Check, X, Loader2 } from "lucide-react";

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
  const [categories, setCategories] = useState<string[]>([]);

  // Fetch all machines
  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const response = await axiosInstance.get("/machine/get-all");
        if (response.data.success && Array.isArray(response.data.data)) {
          const machinesData = response.data.data as Machine[];
          setMachines(machinesData);
          
          // Extract unique categories
          const uniqueCategories = [...new Set(machinesData.map(machine => machine.machineCategory))];
          setCategories(uniqueCategories);
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
    <Card className="w-full max-w-[1200px] mx-auto bg-card shadow-lg border-0 dark:bg-gray-800/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-medium text-gamer-green flex items-center">
          <span>Assign Machines to {game.name}</span>
        </CardTitle>
      </CardHeader>
      <Separator className="mb-0" />
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => {
              const categoryMachines = machines.filter(
                (machine) => machine.machineCategory === category
              );
              
              return categoryMachines.length > 0 ? (
                <div key={category} className="space-y-2">
                  <h3 className="text-sm font-medium text-gamer-green mb-2">{category}</h3>
                  <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                    {categoryMachines.map((machine) => (
                      <div
                        key={machine._id}
                        className={`
                          flex items-center space-x-2 rounded-md border p-2
                          ${selectedMachines.includes(machine._id) 
                            ? 'border-transparent bg-gamer-green/5 shadow-sm' 
                            : 'border-input bg-gray-50/5'}
                          transition-all duration-200 hover:shadow-md hover:scale-[1.01]
                        `}
                      >
                        <Checkbox
                          id={machine._id}
                          checked={selectedMachines.includes(machine._id)}
                          onCheckedChange={() => handleMachineSelect(machine._id)}
                          className="data-[state=checked]:bg-gamer-green data-[state=checked]:text-white"
                        />
                        <Label
                          htmlFor={machine._id}
                          className="flex-1 cursor-pointer font-medium text-sm"
                        >
                          {machine.serialNumber}
                        </Label>
                        <span 
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            machine.status === 'online' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                        >
                          {machine.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null;
            })}
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 p-2 rounded-md text-xs flex items-start space-x-2">
              <X className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-2">
            <Button
              type="button"
              onClick={onCancel}
              variant="cancel"
              className="flex items-center"
              disabled={loading}
              size="sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gamer"
              className="flex items-center"
              disabled={loading}
              size="sm"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-3 w-3" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AssignMachinesForm;
