import React, { useEffect } from "react";
import Console from "./Console"; // Component to render a console machine
import PC from "./PC"; // Component to render a PC machine
import { useDispatch, useSelector } from "react-redux"; // Redux hook to access the store's state
import {
  selectMachines,
  selectMachineStatus,
} from "@/store/selectors/machineSelector"; // Selector to get the list of machines
import { Machine } from "@/types/machine";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css"; // Import skeleton styles
import { MinusCircle, PlusCircle } from "lucide-react";
import MachineModal from "../MachineManagement/MachineModal";
import {
  setMachineModalCommand,
  resetFetched,
} from "@/store/slices/machineSlice";
import { AppDispatch } from "@/store/store";
import { fetchMachines } from "@/store/thunks/machineThunks";

const LayoutSection: React.FC = () => {
  // Access the machines array from the Redux store
  const machines: Machine[] = useSelector(selectMachines);
  const { loading, error } = useSelector(selectMachineStatus);

  const dispatch = useDispatch<AppDispatch>();

  // Function to render a skeleton loader for machines
  const renderSkeletonMachines = (count: number, type?: string) => {
    if (type === "Console") {
      return Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center justify-center w-full">
          <Skeleton width={120} height={120} borderRadius={10} />
        </div>
      ));
    } else {
      return Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center justify-center w-full">
          <Skeleton width={70} height={70} borderRadius={10} />
        </div>
      ));
    }
  };

  // Function to handle machine addtion
  const handleAddMachine = () => {
    dispatch(setMachineModalCommand("add"));
  };

  const handleRemoveMachine = () => {
    dispatch(setMachineModalCommand("remove"));
  };

  const refreshMachines = () => {
    dispatch(resetFetched());
    dispatch(fetchMachines());
  };

  useEffect(() => {
    if (error) {
      alert(error);
    }
  }, [error]);

  return (
    <>
      <div className="box-border flex flex-col justify-between h-full">
        {/* Header with title and action buttons */}
        <div className="flex items-center justify-between px-8 mt-1">
          <div className="text-base font-poppins font-semibold dark:text-primary">
            Lounge Layout
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleAddMachine}
              className="text-primary hover:text-blue-500"
            >
              <PlusCircle size={24} />
            </button>
            <button
              onClick={handleRemoveMachine}
              className="text-primary hover:text-red-500"
            >
              <MinusCircle size={24} />
            </button>
          </div>
        </div>
        {/* Outer container for the layout */}
        <div id="frame" className="w-full py-7 overflow-auto scrollbar-hide">
          {/* Container for the layout area */}
          <div className="border border-slate-400 dark:border-gray-500 min-w-96 max-w-[400px] rounded-lg bg-slate-200 dark:bg-gray-700 overflow-hidden box-border p-1 m-auto shadow-lg shadow-slate-400 dark:shadow-gray-700">
            {/* Inner frame with a border and rounded corners */}
            <div className="border border-slate-400 dark:border-gray-500 w-full bg-slate-100 dark:bg-gray-800 rounded-lg box-border overflow-hidden flex pb-16">
              {/* Left section: BlockA */}
              <section
                id="BlockA"
                className="flex flex-col w-[40%] max-h-[85%] justify-between p-2 gap-4"
              >
                <div className="text-center dark:text-gray-300">Console</div>
                {/* Show skeleton if loading */}
                {loading
                  ? renderSkeletonMachines(3, "Console") // 3 demo machines
                  : machines.map((machine) =>
                      machine.machineCategory === "Console" ? (
                        <Console key={machine._id} machine={machine} />
                      ) : null
                    )}
                <div />
              </section>
              {/* Divider between BlockA and BlockB */}
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
                  <div className="text-center dark:text-gray-300">PC-L</div>
                  {/* Show skeleton if loading */}
                  {loading
                    ? renderSkeletonMachines(4)
                    : machines.map((machine) =>
                        machine.machineCategory === "PC-L" ? (
                          <PC key={machine._id} machine={machine} rotate={0} />
                        ) : null
                      )}
                  <div />
                </div>
                {/* Right subsection of BlockB: BlockB2 */}
                <div
                  id="BlockB2"
                  className="flex flex-col gap-2 flex-grow justify-between items-end"
                >
                  <div className="text-center w-full dark:text-gray-300">
                    PC-R
                  </div>
                  {/* Show skeleton if loading */}
                  {loading
                    ? renderSkeletonMachines(5)
                    : machines.map((machine) =>
                        machine.machineCategory === "PC-R" ? (
                          <PC
                            key={machine._id}
                            machine={machine}
                            rotate={180}
                          />
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
      <MachineModal onSuccess={refreshMachines} />
    </>
  );
};

export default LayoutSection;
