import axiosInstance from "@/axios.config";
import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  bookingStatusString,
  CustomerBooking,
  MachineBooking,
  NewCustomerBooking,
} from "@/types/booking";
import { BookingLog } from "../slices/bookingHistorySlice";

// Fetch the current and next booking for the selected machine
export const fetchFirstAndNextBooking = createAsyncThunk<
  MachineBooking, // The type of the data returned
  { startTime: String; duration: Number; machineID: String }, // The type of the argument (startTime and duration)
  { rejectValue: string } // The type of the error message on failure
>(
  "bookings/fetchFirstAndNext",
  async ({ startTime, duration, machineID }, { rejectWithValue }) => {
    try {
      // Make sure the data is correctly passed to the API
      const response = await axiosInstance.post(
        `/bookings/get-first-and-next/`, // Use POST request
        { inputStartTime: startTime, duration, machineID } // Pass the body
      );
      return response.data.data; // Return the data from the API
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch bookings"
      );
    }
  }
);

// Fetch all the bookings statuses for each machines
export const fetchMachineStatus = createAsyncThunk<
  { [machineID: string]: { status: bookingStatusString } }, // The return type (Machine ID → Status)
  { startTime: string; duration: number }, // The arguments type
  { rejectValue: string } // Error message type
>(
  "bookings/fetchMachineStatus",
  async ({ startTime, duration }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/bookings/machines-status", {
        inputStartTime: startTime,
        duration,
      });
      return response.data.data; // Return machine status object
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch machine statuses"
      );
    }
  }
);

// Define the createBookingThunk
export const createBooking = createAsyncThunk(
  "booking/createBooking",
  async (formData: CustomerBooking, { rejectWithValue }) => {
    try {
      const mode = "admin";
      const response = await axiosInstance.post(
        `/bookings/?mode=${mode}`,
        formData
      );
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

// Define the selectedBookingThunk
export const fetchSelectedBooking = createAsyncThunk<
  NewCustomerBooking, // The type of the data returned
  { bookingID: string }, // The type of the argument (startTime and duration)
  { rejectValue: string } // The type of the error message on failure
>(
  "bookings/fetchSelectedBooking",
  async ({ bookingID }, { rejectWithValue }) => {
    try {
      console.log("fetchbooking called ", bookingID);
      // Make sure the data is correctly passed to the API
      const response = await axiosInstance.post(
        `/bookings/get-booking/${bookingID}`, // Use POST request
        {} // Pass the body
      );
      return response.data.data; // Return the data from the API
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch bookings"
      );
    }
  }
);

interface FetchBookingLogsFilters {
  status: "Booked" | "Completed" | "InUse" | "Cancelled" | "";
  date: Date | null;
  filterType: "day" | "month" | "";
  count: number;
}

// Define the fetchBookingLogsThunk
export const fetchBookingLogs = createAsyncThunk<
  BookingLog[], // The return type
  FetchBookingLogsFilters, // No arguments
  { rejectValue: string } // Error message type
>("bookings/fetchBookingLogs", async (filters, { rejectWithValue }) => {
  try {
    const { status, date, filterType, count } = filters;

    // Construct the query parameters based on the filters
    const body: any = {
      status,
      count,
      date,
      filterType,
    };

    const response = await axiosInstance.post("/bookings/get-log", body);

    return response.data.data; // Return machine status object
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch booking logs"
    );
  }
});
