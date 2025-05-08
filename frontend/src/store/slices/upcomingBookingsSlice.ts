import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { fetchUpcomingBookings } from "../thunks/bookingThunk";

// Define the booking card interface
export interface BookingCardData {
  id: string;
  customerName: string;
  machines: { name: string; type: "pc" | "console" }[];
  startTime: string;
  duration: string;
  status: "Confirmed" | "Pending" | "Completed";
  description: string;
  price: string;
  paymentStatus: "Paid" | "Unpaid";
}

// Define the state structure
interface UpcomingBookingsState {
  today: BookingCardData[];
  tomorrow: BookingCardData[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: UpcomingBookingsState = {
  today: [],
  tomorrow: [],
  loading: false,
  error: null,
};

// Create the slice
const upcomingBookingsSlice = createSlice({
  name: "upcomingBookings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Handle pending state
      .addCase(fetchUpcomingBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      
      // Handle successful fetch
      .addCase(
        fetchUpcomingBookings.fulfilled,
        (state, action: PayloadAction<{ today: BookingCardData[]; tomorrow: BookingCardData[] }>) => {
          state.loading = false;
          state.today = action.payload.today;
          state.tomorrow = action.payload.tomorrow;
        }
      )
      
      // Handle failed fetch
      .addCase(fetchUpcomingBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export selectors
export const selectUpcomingBookings = (state: RootState) => ({
  today: state.upcomingBookings.today,
  tomorrow: state.upcomingBookings.tomorrow,
  loading: state.upcomingBookings.loading,
  error: state.upcomingBookings.error,
});

export default upcomingBookingsSlice.reducer; 