import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../axios.config";
import socket from "../../utils/socket.util";

// Define interfaces for socket events
interface EarningsUpdateData {
  totalEarnings: number;
  period: string;
}

interface TransactionData {
  transactionId: string;
  amount: number;
  transactionType: string;
  status?: string;
}

// Define monthly revenue data interface
export interface MonthlyRevenueData {
  date: string;
  revenue: number;
}

// Define the state interface
interface RevenueState {
  last30DaysEarnings: number;
  monthlyRevenue: MonthlyRevenueData[];
  isLoading: boolean;
  isLoadingMonthly: boolean;
  error: string | null;
}

// Initial state
const initialState: RevenueState = {
  last30DaysEarnings: 0,
  monthlyRevenue: [],
  isLoading: false,
  isLoadingMonthly: false,
  error: null
};

// Async thunk to fetch the last 30 days earnings
export const fetchLast30DaysEarnings = createAsyncThunk(
  "revenue/fetchLast30DaysEarnings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/transactions/last-30-days-earnings");
      return response.data.totalEarnings;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch earnings data");
    }
  }
);

// Async thunk to fetch the last 6 months revenue data
export const fetchLastSixMonthsRevenue = createAsyncThunk(
  "revenue/fetchLastSixMonthsRevenue",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/transactions/monthly-revenue");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch monthly revenue data");
    }
  }
);

// Create the revenue slice
const revenueSlice = createSlice({
  name: "revenue",
  initialState,
  reducers: {
    // Action to update the last 30 days earnings (used with WebSocket updates)
    updateLast30DaysEarnings: (state, action) => {
      state.last30DaysEarnings = action.payload;
    },
    // Add a new transaction to the total (for real-time updates)
    addTransactionAmount: (state, action) => {
      if (action.payload.status === "completed") {
        state.last30DaysEarnings += action.payload.amount;
      }
    },
    // Update monthly revenue data from socket
    updateMonthlyRevenueData: (state, action) => {
      state.monthlyRevenue = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLast30DaysEarnings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLast30DaysEarnings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.last30DaysEarnings = action.payload;
      })
      .addCase(fetchLast30DaysEarnings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchLastSixMonthsRevenue.pending, (state) => {
        state.isLoadingMonthly = true;
        state.error = null;
      })
      .addCase(fetchLastSixMonthsRevenue.fulfilled, (state, action) => {
        state.isLoadingMonthly = false;
        state.monthlyRevenue = action.payload;
      })
      .addCase(fetchLastSixMonthsRevenue.rejected, (state, action) => {
        state.isLoadingMonthly = false;
        state.error = action.payload as string;
      });
  }
});

// Export actions
export const { updateLast30DaysEarnings, addTransactionAmount, updateMonthlyRevenueData } = revenueSlice.actions;

// Listen for WebSocket events to update the revenue data
export const setupRevenueWebSocketListeners = (dispatch: any) => {
  // Listen for earnings updates (from the periodic refresh)
  socket.on("earnings:update", (data: EarningsUpdateData) => {
    dispatch(updateLast30DaysEarnings(data.totalEarnings));
  });

  // Listen for new transactions
  socket.on("transaction:new", (data: TransactionData) => {
    dispatch(addTransactionAmount({
      amount: data.amount,
      status: "completed" // Assuming all new transactions are completed
    }));
  });

  // Listen for monthly revenue updates
  socket.on("revenue:monthly", (data: MonthlyRevenueData[]) => {
    dispatch(updateMonthlyRevenueData(data));
  });
};

export default revenueSlice.reducer; 