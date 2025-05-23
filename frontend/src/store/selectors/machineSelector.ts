import { RootState } from "../store";

export const selectMachines = (state: RootState) => state.machine.machines;
export const selectSelectedMachine = (state: RootState) =>
  state.machine.selectedMachine;
export const selectFetched = (state: RootState) => state.machine.fetched;
export const selectMachineStatus = (state: RootState) => state.machine;
export const selectMachineLoading = (state: RootState) => state.machine.loading;
export const selectMachineModalCommand = (state: RootState) =>
  state.machine.machineModalCommand;
