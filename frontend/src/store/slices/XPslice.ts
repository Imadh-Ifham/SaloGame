import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/axios.config";

interface XPState {
  xpBalance: number;
  loading: boolean;
}

const initialState: XPState = {
  xpBalance: 0,
  loading: true,
};

export const fetchXpBalance = createAsyncThunk(
  "xp/fetchXpBalance",
  async () => {
    const token = localStorage.getItem("token");
    if (token) {
      const response = await axiosInstance.get("/currency/balance", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.xp;
    }
    return 0;
  }
);

const xpSlice = createSlice({
  name: "xp",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchXpBalance.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchXpBalance.fulfilled, (state, action) => {
        state.xpBalance = action.payload;
        state.loading = false;
      })
      .addCase(fetchXpBalance.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default xpSlice.reducer;
