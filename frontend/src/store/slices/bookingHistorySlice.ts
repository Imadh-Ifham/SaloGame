import { createSlice } from "@reduxjs/toolkit";

interface Booking {
  id: string;
  customerName: string;
  startTime: string;
  endTime: string;
  duration: number;
  machines: string[];
  status: string;
}

interface BookingHistoryState {
  bookings: Booking[];
  selectedBooking: Booking | null;
  loading: boolean;
  error: string | null;
}

const initialState: BookingHistoryState = {
  bookings: [],
  selectedBooking: null,
  loading: false,
  error: null,
};

const bookingHistorySlice = createSlice({
  name: "bookingHistory",
  initialState,
  reducers: {},
});

export default bookingHistorySlice.reducer;
