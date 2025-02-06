// src/redux/selectors/machineSelectors.ts
import { RootState } from "../store";

export const selectMachines = (state: RootState) => state.machine.machines;
export const selectSelectedMachine = (state: RootState) =>
  state.machine.selectedMachine;
export const selectMachineStatus = (state: RootState) =>
  state.machine.machineStatus;
export const selectFetched = (state: RootState) => state.machine.fetched;
