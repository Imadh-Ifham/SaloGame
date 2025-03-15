/**
 * Booking Slice - Manages booking state for game lounge machines.
 *
 * Handles booking creation, updates, and retrieval.
 * Uses async thunks for API calls and stores customer booking details.
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { dummyData } from "@/types/machine";
import {
  createBooking,
  fetchFirstAndNextBookings,
} from "../thunks/bookingThunk";
import { calculateEndTime, toUTC } from "@/utils/date.util";

interface IMachineBooking {
  machineID: string;
  userCount: number;
}

export type CustomerBooking = {
  customerName: string;
  phoneNumber?: string | null;
  notes?: string | null;
  startTime: string; // Booking start time in UTC format
  endTime?: string; // Auto-calculated based on duration
  duration: number; // Booking duration in minutes
  machines: IMachineBooking[]; // List of machines booked
  totalPrice?: number;
  status: "Booked" | "InUse" | "Completed" | "Cancelled" | "Available";
};

export interface MachineBooking {
  firstBooking: CustomerBooking | null; // Current booking
  status: "Booked" | "InUse" | "Maintenance" | "Available";
  nextBooking: CustomerBooking | null; // Upcoming booking
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

// Initial Redux state
const initialState: BookingState = {
  formData: {
    customerName: "",
    startTime: toUTC(new Date().toISOString()), // Defaults to current UTC time
    endTime: calculateEndTime(toUTC(new Date().toISOString()), 60), // Auto-calculate based on duration
    duration: 60,
    machines: [], // Machines will be added when selected
    status: "Booked",
  },
  allMachineBookings: dummyData, // Dummy data for testing
  showBookingForm: false, // Booking form starts hidden
  error: null,
  loading: false,
};

// Slice definition
const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    // Reset form data to default values
    resetForm(state) {
      state.formData = { ...initialState.formData };
      state.formData.endTime = calculateEndTime(
        initialState.formData.startTime,
        initialState.formData.duration
      );
    },

    // Update booking form fields dynamically
    updateBookingForm(state, action: PayloadAction<Partial<CustomerBooking>>) {
      state.formData = { ...state.formData, ...action.payload };

      // If startTime or duration is updated, recalculate endTime
      if (action.payload.startTime || action.payload.duration) {
        const { startTime, duration } = state.formData;
        state.formData.endTime = calculateEndTime(startTime, duration);
      }
    },

    // Toggle booking form visibility
    setShowBookingForm(state, action: PayloadAction<boolean>) {
      state.showBookingForm = action.payload;
    },

    // Set selected machine for a new booking
    setInitialMachines(state, action: PayloadAction<string>) {
      state.formData.machines = [{ machineID: action.payload, userCount: 1 }];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch bookings - Start loading, hide form
      .addCase(fetchFirstAndNextBookings.pending, (state) => {
        state.showBookingForm = false;
        state.loading = true;
        state.error = null;
      })
      // Fetch bookings - Store results and show form
      .addCase(
        fetchFirstAndNextBookings.fulfilled,
        (state, action: PayloadAction<AllMachineBookings>) => {
          state.showBookingForm = true;
          state.loading = false;
          state.allMachineBookings = action.payload;
        }
      )
      // Fetch failed - Store error, hide form
      .addCase(fetchFirstAndNextBookings.rejected, (state, action) => {
        state.loading = false;
        state.showBookingForm = false;
        state.error = action.payload as string;
      })

      // Create booking - Start loading
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // Booking successful - Reset form
      .addCase(createBooking.fulfilled, (state) => {
        state.loading = false;
        state.formData = {
          ...initialState.formData,
          startTime: state.formData.startTime,
          endTime: state.formData.endTime,
          duration: state.formData.duration,
        };
      })
      // Booking failed - Store error
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
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

// Selectors for retrieving specific parts of the state
export const selectFormData = (state: RootState) => state.booking.formData;
export const selectAllMachineBookings = (state: RootState) =>
  state.booking.allMachineBookings;
export const selectBookingStatus = (state: RootState) => ({
  loading: state.booking.loading,
  error: state.booking.error,
  showBookingForm: state.booking.showBookingForm,
});
