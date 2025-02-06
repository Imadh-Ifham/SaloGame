import React, { useEffect } from "react";
import Console from "./MachineLibarary/Console";
import PC from "./MachineLibarary/PC";
import { useSelector, useDispatch } from "react-redux";
import {
  selectMachines,
  selectMachineStatus,
} from "@/store/selectors/machineSelector";
import { Machine } from "@/types/machine";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  selectFormData,
  toggleMachineSelection,
} from "@/store/slices/bookingSlice";

const LayoutSection: React.FC = () => {
  const dispatch = useDispatch();

  // Access the machines array from the Redux store
  const machines: Machine[] = useSelector(selectMachines);
  const { loading, error } = useSelector(selectMachineStatus);

  // Retrieve the booking form data to check which machines are selected
  const formData = useSelector(selectFormData);

  // Helper function to check if a machine is selected (checkbox)
  const isMachineSelected = (machineId: string) => {
    return formData.machines.some((m) => m.machineID === machineId);
  };

  // Toggle machine selection in Redux
  const handleCheckboxChange = (machineId: string) => {
    dispatch(toggleMachineSelection({ machineID: machineId }));
  };

  // Function to render a skeleton loader for machines
  const renderSkeletonMachines = (count: number, type?: string) => {
    return Array.from({ length: count }).map((_, index) => (
      <div key={index} className="flex items-center justify-center w-full">
        {/* Adjust skeleton size based on type */}
        <Skeleton
          width={type === "Console" ? 120 : 70}
          height={type === "Console" ? 120 : 70}
          borderRadius={10}
        />
      </div>
    ));
  };

  useEffect(() => {
    if (error) {
      alert(error);
    }
  }, [error]);

  return (
    <div className="box-border flex flex-col justify-between h-full">
      <div className=""></div>
      <div className="text-lg font-bold mx-auto">2D Lodge Layout</div>

      <div id="frame" className="w-full py-7 overflow-auto">
        <div className="border border-slate-400 min-w-96 max-w-[400px] rounded-lg bg-slate-200 overflow-hidden box-border p-1 m-auto">
          <div className="border border-slate-400 w-full bg-slate-100 rounded-lg box-border overflow-hidden flex pb-16">
            {/* Left section: BlockA */}
            <section
              id="BlockA"
              className="flex flex-col w-[40%] max-h-[85%] justify-between p-2 gap-4"
            >
              <div />
              {loading
                ? renderSkeletonMachines(3, "Console")
                : machines.map((machine) =>
                    machine.machineCategory === "Console" ? (
                      <div
                        key={machine._id}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="checkbox"
                          checked={isMachineSelected(machine._id)}
                          onChange={() => handleCheckboxChange(machine._id)}
                        />
                        <Console machine={machine} />
                      </div>
                    ) : null
                  )}
              <div />
            </section>

            <div className="w-1 h-96 bg-slate-300" />

            {/* Right section: BlockB */}
            <section
              id="BlockB"
              className="flex flex-grow max-h-[85%] p-2 gap-4"
            >
              {/* Left subsection of BlockB: BlockB1 */}
              <div
                id="BlockB1"
                className="flex flex-col gap-2 flex-grow justify-between"
              >
                <div />
                {loading
                  ? renderSkeletonMachines(4)
                  : machines.map((machine) =>
                      machine.machineCategory === "PC-L" ? (
                        <div
                          key={machine._id}
                          className="flex items-center gap-2"
                        >
                          <input
                            type="checkbox"
                            checked={isMachineSelected(machine._id)}
                            onChange={() => handleCheckboxChange(machine._id)}
                          />
                          <PC machine={machine} rotate={0} />
                        </div>
                      ) : null
                    )}
                <div />
              </div>

              {/* Right subsection of BlockB: BlockB2 */}
              <div
                id="BlockB2"
                className="flex flex-col gap-2 flex-grow justify-between items-end"
              >
                <div />
                {loading
                  ? renderSkeletonMachines(5)
                  : machines.map((machine) =>
                      machine.machineCategory === "PC-R" ? (
                        <div
                          key={machine._id}
                          className="flex items-center gap-2"
                        >
                          <input
                            type="checkbox"
                            checked={isMachineSelected(machine._id)}
                            onChange={() => handleCheckboxChange(machine._id)}
                          />
                          <PC machine={machine} rotate={180} />
                        </div>
                      ) : null
                    )}
                <div />
              </div>
            </section>
          </div>
        </div>
      </div>

      <div className=""></div>
    </div>
  );
};

export default LayoutSection;
