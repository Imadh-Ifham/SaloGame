import axiosInstance from "@/axios.config";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { AllMachineBookings } from "../slices/bookingSlice";

export const fetchFirstAndNextBookings = createAsyncThunk<
  AllMachineBookings, // The type of the data returned
  { startTime: String; duration: Number }, // The type of the argument (startTime and duration)
  { rejectValue: string } // The type of the error message on failure
>(
  "bookings/fetchFirstAndNext",
  async ({ startTime, duration }, { rejectWithValue }) => {
    console.log("Start Time: ", startTime, " Duration: ", duration);
    try {
      // Make sure the data is correctly passed to the API
      const response = await axiosInstance.post(
        `/bookings/get-first-and-next/`, // Use POST request
        { inputStartTime: startTime, duration: duration } // Pass the body
      );
      console.log(response.data.data);
      return response.data.data; // Return the data from the API
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch bookings"
      );
    }
  }
);
