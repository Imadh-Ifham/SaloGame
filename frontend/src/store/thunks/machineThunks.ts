import axiosInstance from "@/axios.config";
import { Machine } from "@/types/machine";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchMachines = createAsyncThunk<Machine[]>(
  "machines/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/machine/get-all");
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch machines"
      );
    }
  }
);
