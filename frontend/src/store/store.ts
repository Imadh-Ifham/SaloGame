// src/redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import machineReducer from "./slices/machineSlice";
import membershipReducer from "./slices/membershipSlice";
import offerReducer from "./slices/offerSlice";
import bookingReducer from "./slices/bookingSlice";
import notificationReducer from "./slices/notificationSlice";
import xpReducer from "./slices/XPslice";
import layoutReducer from "./slices/layoutSlice";
import revenueReducer from "./slices/revenueSlice";
import transactionReducer from "./slices/transactionSlice";
import { setupRevenueWebSocketListeners } from "./slices/revenueSlice";
import { setupTransactionWebSocketListeners } from "./slices/transactionSlice";
import bookingHistoryReducer from "./slices/transactionSlice";

const store = configureStore({
  reducer: {
    machine: machineReducer,
    membership: membershipReducer,
    offer: offerReducer,
    booking: bookingReducer,
    notification: notificationReducer,
    xp: xpReducer,
    layout: layoutReducer,
    revenue: revenueReducer,
    transactions: transactionReducer,
    bookingHistory: bookingHistoryReducer,
  },
});

// Set up WebSocket listeners
setupRevenueWebSocketListeners(store.dispatch);
setupTransactionWebSocketListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
