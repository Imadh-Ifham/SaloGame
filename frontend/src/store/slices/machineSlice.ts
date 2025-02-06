import { machineStatus } from "./../../types/machine";
// src/redux/slices/machineSlice.ts
import { Machine } from "@/types/machine";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchMachines } from "../thunks/machineThunks";

interface MachineStatus {
  [machineId: string]: "Booked" | "Available" | "InUse" | "Maintenance";
}

type MachineState = {
  machines: Machine[];
  selectedMachine: Machine | null;
  machineStatus: MachineStatus;
  fetched: boolean;
  loading: boolean;
  error: string | null;
};

const initialState: MachineState = {
  machines: [],
  selectedMachine: null,
  machineStatus: machineStatus,
  fetched: false,
  loading: false,
  error: null,
};

const machineSlice = createSlice({
  name: "machine",
  initialState,
  reducers: {
    // Action to select a machine
    selectMachine(state, action: PayloadAction<string>) {
      state.selectedMachine =
        state.machines.find((machine) => machine._id === action.payload) ||
        null;
    },

    resetFetched: (state) => {
      state.fetched = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMachines.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMachines.fulfilled, (state, action) => {
        state.loading = false;
        state.fetched = true;
        state.machines = action.payload;
      })
      .addCase(fetchMachines.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { selectMachine, resetFetched } = machineSlice.actions;

export default machineSlice.reducer;
