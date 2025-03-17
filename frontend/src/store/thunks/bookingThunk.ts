import axiosInstance from "@/axios.config";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { AllMachineBookings, CustomerBooking } from "../slices/bookingSlice";

export const fetchFirstAndNextBookings = createAsyncThunk<
  AllMachineBookings, // The type of the data returned
  { startTime: String; duration: Number }, // The type of the argument (startTime and duration)
  { rejectValue: string } // The type of the error message on failure
>(
  "bookings/fetchFirstAndNext",
  async ({ startTime, duration }, { rejectWithValue }) => {
    try {
      // Make sure the data is correctly passed to the API
      const response = await axiosInstance.post(
        `/bookings/get-first-and-next/`, // Use POST request
        { inputStartTime: startTime, duration: duration } // Pass the body
      );
      return response.data.data; // Return the data from the API
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch bookings"
      );
    }
  }
);

// Define the createBookingThunk
export const createBooking = createAsyncThunk(
  "booking/createBooking",
  async (formData: CustomerBooking, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/bookings/", formData);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        // Request made and server responded
        console.error("Error response:", error.response.data);
        return rejectWithValue(error.response.data.message);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Error request:", error.request);
        return rejectWithValue("No response received from the server.");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error message:", error.message);
        return rejectWithValue("An unexpected error occurred.");
      }
    }
  }
);

// Define the updateBookingStatusThunk
export const updateBookingStatus = createAsyncThunk(
  "booking/updateBookingStatus",
  async (data: { bookingID: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        "/bookings/update-status",
        data
      );
      return response.data.message;
    } catch (error: any) {
      if (error.response) {
        // Request made and server responded
        console.error("Error response:", error.response.data);
        return rejectWithValue(error.response.data.message);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Error request:", error.request);
        return rejectWithValue("No response received from the server.");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error message:", error.message);
        return rejectWithValue("An unexpected error occurred.");
      }
    }
  }
);
