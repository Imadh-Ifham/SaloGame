import { NewCustomerBooking } from "@/types/booking";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchBookingLogs, fetchSelectedBooking } from "../thunks/bookingThunk";
import { RootState } from "../store";

export interface BookingLog {
  _id: string;
  customerName: string;
  startTime: string;
  status: string;
  transactionType: string;
}
interface BookingHistoryState {
  bookingLogs: BookingLog[];
  selectedBooking: NewCustomerBooking | null;
  loading: boolean;
  error: string | null;
}

const initialState: BookingHistoryState = {
  bookingLogs: [],
  selectedBooking: null,
  loading: false,
  error: null,
};

const bookingHistorySlice = createSlice({
  name: "bookingHistory",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch bookings - Start loading, hide form
      .addCase(fetchSelectedBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // Fetch bookings - Store results and show form
      .addCase(
        fetchSelectedBooking.fulfilled,
        (state, action: PayloadAction<NewCustomerBooking>) => {
          state.loading = false;
          state.selectedBooking = action.payload;
        }
      )
      // Fetch failed - Store error, hide form
      .addCase(fetchSelectedBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch booking logs - Start loading, hide form
      .addCase(fetchBookingLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // Fetch booking logs - Store results and show form
      .addCase(
        fetchBookingLogs.fulfilled,
        (state, action: PayloadAction<BookingLog[]>) => {
          state.loading = false;
          state.bookingLogs = action.payload;
        }
      )
      // Fetch failed - Store error, hide form
      .addCase(fetchBookingLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default bookingHistorySlice.reducer;

export const selectSelectedBooking = (state: RootState) =>
  state.bookingHistory.selectedBooking;
export const selectBookingLog = (state: RootState) =>
  state.bookingHistory.bookingLogs;
export const selectBookingHistoryLoading = (state: RootState) =>
  state.bookingHistory.loading;
