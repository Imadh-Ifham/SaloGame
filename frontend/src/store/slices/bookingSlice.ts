import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { dummyData } from "@/types/machine";
import { fetchFirstAndNextBookings } from "../thunks/bookingThunk";

interface IMachineBooking {
  machineID: string;
  userCount: number;
}

export type CustomerBooking = {
  customerName: string;
  phoneNumber?: string | null;
  notes?: string | null;
  startTime: string;
  endTime: string;
  machines: IMachineBooking[];
  totalPrice?: number;
  status: "Booked" | "InUse" | "Completed" | "Cancelled";
};

export interface MachineBooking {
  firstBooking: CustomerBooking | null;
  status: "Booked" | "InUse" | "Maintenance" | "Available";
  nextBooking: CustomerBooking | null;
}

export interface AllMachineBookings {
  [machineId: string]: MachineBooking;
}

interface BookingState {
  formData: CustomerBooking;
  allMachineBookings: AllMachineBookings;
  error: string | null;
  loading: boolean;
}

// Initial state
const initialState: BookingState = {
  formData: {
    customerName: "",
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    machines: [],
    status: "Booked",
  },
  allMachineBookings: dummyData,
  error: null,
  loading: false,
};

// Slice definition
const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    // Action to reset the form
    resetForm(state) {
      state.formData = { ...initialState.formData };
    },

    updateBookingForm(state, action: PayloadAction<CustomerBooking>) {
      state.formData = action.payload;
    },

    // Toggle a machine's selection in the formData array
    toggleMachineSelection(
      state,
      action: PayloadAction<{ machineID: string }>
    ) {
      const { machineID } = action.payload;
      const existingIndex = state.formData.machines.findIndex(
        (m) => m.machineID === machineID
      );
      if (existingIndex >= 0) {
        // Machine is already selected; remove it
        state.formData.machines.splice(existingIndex, 1);
      } else {
        // Machine is not selected; add it
        state.formData.machines.push({
          machineID,
          userCount: 1,
        });
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFirstAndNextBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchFirstAndNextBookings.fulfilled,
        (state, action: PayloadAction<AllMachineBookings>) => {
          state.loading = false;
          state.allMachineBookings = action.payload;
        }
      )
      .addCase(fetchFirstAndNextBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const { resetForm, updateBookingForm, toggleMachineSelection } =
  bookingSlice.actions;

// Reducer export
export default bookingSlice.reducer;

// Selector for formData
export const selectFormData = (state: RootState) => state.booking.formData;
export const selectAllMachineBookings = (state: RootState) =>
  state.booking.allMachineBookings;
export const selectLoading = (state: RootState) => state.booking.loading;
