import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { dummyData } from "@/types/machine";
import { fetchFirstAndNextBookings } from "../thunks/bookingThunk";
import { calculateEndTime, toUTC } from "@/utils/date.util";

interface IMachineBooking {
  machineID: string;
  userCount: number;
}

export type CustomerBooking = {
  customerName: string;
  phoneNumber?: string | null;
  notes?: string | null;
  startTime: string;
  endTime?: string;
  duration: number;
  machines: IMachineBooking[];
  totalPrice?: number;
  status: "Booked" | "InUse" | "Completed" | "Cancelled" | "Available";
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
  showBookingForm: boolean;
  error: string | null;
  loading: boolean;
}

// Initial state
const initialState: BookingState = {
  formData: {
    customerName: "",
    startTime: toUTC(new Date().toISOString()),
    endTime: calculateEndTime(toUTC(new Date().toISOString()), 60),
    duration: 60,
    machines: [], // Initialize as an empty array
    status: "Booked",
  },
  allMachineBookings: dummyData,
  showBookingForm: false,
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
      state.formData.endTime = calculateEndTime(
        initialState.formData.startTime,
        initialState.formData.duration
      );
    },

    updateBookingForm(state, action: PayloadAction<Partial<CustomerBooking>>) {
      state.formData = {
        ...state.formData,
        ...action.payload,
      };

      // Recalculate endTime if startTime or duration is updated
      if (action.payload.startTime || action.payload.duration) {
        const { startTime, duration } = state.formData;
        state.formData.endTime = calculateEndTime(startTime, duration);
      }
    },

    setShowBookingForm(state, action: PayloadAction<boolean>) {
      state.showBookingForm = action.payload;
    },

    setInitialMachines(state, action: PayloadAction<string>) {
      state.formData.machines = [{ machineID: action.payload, userCount: 1 }];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFirstAndNextBookings.pending, (state) => {
        state.showBookingForm = false;
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchFirstAndNextBookings.fulfilled,
        (state, action: PayloadAction<AllMachineBookings>) => {
          state.showBookingForm = true;
          state.loading = false;
          state.allMachineBookings = action.payload;
        }
      )
      .addCase(fetchFirstAndNextBookings.rejected, (state, action) => {
        state.loading = false;
        state.showBookingForm = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  resetForm,
  updateBookingForm,
  setShowBookingForm,
  setInitialMachines,
} = bookingSlice.actions;

// Reducer export
export default bookingSlice.reducer;

// Selector for formData
export const selectFormData = (state: RootState) => state.booking.formData;
export const selectAllMachineBookings = (state: RootState) =>
  state.booking.allMachineBookings;
export const selectBookingStatus = (state: RootState) => ({
  loading: state.booking.loading,
  error: state.booking.error,
  showBookingForm: state.booking.showBookingForm,
});
