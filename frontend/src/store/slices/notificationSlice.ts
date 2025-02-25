// frontend/src/store/slices/notificationSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/axios.config";

export interface Notification {
  id: string;
  type: string;
  severity: "low" | "medium" | "high";
  title: string;
  message: string;
  expiresIn?: number;
  subscriptionId?: string;
  read: boolean;
}

interface NotificationState {
  items: Notification[];
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchUserNotifications = createAsyncThunk(
  "notifications/fetchUserNotifications",
  async () => {
    const response = await axiosInstance.get("/subscriptions/my-expiring");
    // Add read property to each notification
    return response.data.data.map((notification: any) => ({
      ...notification,
      read: false,
    }));
  }
);

export const renewFromNotification = createAsyncThunk(
  "notifications/renewFromNotification",
  async (subscriptionId: string) => {
    const response = await axiosInstance.post(
      `/subscriptions/${subscriptionId}/renew`
    );
    return response.data;
  }
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    markAsRead: (state, action) => {
      const notification = state.items.find(
        (item) => item.id === action.payload
      );
      if (notification) {
        notification.read = true;
      }
    },
    clearNotification: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchUserNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch notifications";
      })
      .addCase(renewFromNotification.fulfilled, (state, action) => {
        // Remove the renewal notification after successful renewal
        state.items = state.items.filter(
          (item) =>
            item.type !== "renewal" || item.subscriptionId !== action.meta.arg
        );
      });
  },
});

export const { markAsRead, clearNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
