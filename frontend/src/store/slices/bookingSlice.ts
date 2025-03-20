/**
 * Booking Slice - Manages booking state for game lounge machines.
 *
 * Handles booking creation, updates, and retrieval.
 * Uses async thunks for API calls and stores customer booking details.
 */

import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import {
  createBooking,
  fetchFirstAndNextBooking,
  fetchMachineStatus,
} from "../thunks/bookingThunk";
import { calculateEndTime, toUTC } from "@/utils/date.util";

interface IMachineBooking {
  machineID: string;
  userCount: number;
}

export type CustomerBooking = {
  _id?: string;
  customerName: string;
  phoneNumber?: string | null;
  notes?: string | null;
  startTime: string; // Booking start time in UTC format
  endTime?: string; // Auto-calculated based on duration
  duration: number; // Booking duration in minutes
  machines: IMachineBooking[]; // List of machines booked
  totalPrice?: number;
  status: bookingStatusString;
};

export interface MachineBooking {
  firstBooking: CustomerBooking | null; // Current booking
  status: bookingStatusString; // Machine status
  nextBooking: CustomerBooking | null; // Upcoming booking
}

export interface MachineStatus {
  [machineID: string]: {
    status: bookingStatusString;
  };
}

type bookingModalString = "cancel" | "extend" | "end" | "start";
export type bookingStatusString =
  | "Booked"
  | "InUse"
  | "Completed"
  | "Cancelled"
  | "Available";

interface BookingState {
  formData: CustomerBooking;
  machineBooking: MachineBooking | null;
  machineStatus: MachineStatus;
  showBookingForm: boolean;
  bookingModel: bookingModalString | null;
  activeNav: "Now" | "Later";
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
    status: "InUse",
  },
  machineBooking: null,
  machineStatus: {},
  showBookingForm: false, // Booking form starts hidden
  bookingModel: null,
  activeNav: "Now",
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

    // Set booking modal type
    setBookingModal(state, action: PayloadAction<bookingModalString>) {
      state.bookingModel = action.payload;
    },

    // Reset booking modal state
    resetBookingModal(state) {
      state.bookingModel = null;
    },

    // Set active navigation tab
    setActiveNav(state, action: PayloadAction<"Now" | "Later">) {
      state.activeNav = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch bookings - Start loading, hide form
      .addCase(fetchFirstAndNextBooking.pending, (state) => {
        state.showBookingForm = false;
        state.loading = true;
        state.error = null;
      })
      // Fetch bookings - Store results and show form
      .addCase(
        fetchFirstAndNextBooking.fulfilled,
        (state, action: PayloadAction<MachineBooking>) => {
          state.showBookingForm = true;
          state.loading = false;
          state.machineBooking = action.payload;
        }
      )
      // Fetch failed - Store error, hide form
      .addCase(fetchFirstAndNextBooking.rejected, (state, action) => {
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
      })

      // fecthMachineStatus - Start loading
      .addCase(fetchMachineStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // Fetch machine statuses - Store results
      .addCase(
        fetchMachineStatus.fulfilled,
        (
          state,
          action: PayloadAction<{
            [machineID: string]: { status: bookingStatusString };
          }>
        ) => {
          state.machineStatus = action.payload;
          state.loading = false;
        }
      )
      // Fetch failed - Store error
      .addCase(fetchMachineStatus.rejected, (state, action) => {
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
  setBookingModal,
  resetBookingModal,
  setActiveNav,
} = bookingSlice.actions;

// Reducer export
export default bookingSlice.reducer;

// Selectors for retrieving specific parts of the state
export const selectFormData = (state: RootState) => state.booking.formData;
export const selectMachineBooking = (state: RootState) =>
  state.booking.machineBooking;
export const selectBookingModal = (state: RootState) =>
  state.booking.bookingModel;
export const selectActiveNav = (state: RootState) => state.booking.activeNav;
export const selectMachineStatus = (state: RootState) =>
  state.booking.machineStatus;

const selectBookingState = (state: RootState) => state.booking;
export const selectBookingStatus = createSelector(
  [selectBookingState],
  (bookingState) => ({
    loading: bookingState.loading,
    error: bookingState.error,
    showBookingForm: bookingState.showBookingForm,
  })
);
