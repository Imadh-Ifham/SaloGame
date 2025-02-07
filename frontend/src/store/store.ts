// src/redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import machineReducer from "./slices/machineSlice";
import bookingReducer from "./slices/bookingSlice";
import xpReducer from "./slices/XPslice";

const store = configureStore({
  reducer: {
    machine: machineReducer,
    booking: bookingReducer,
    xp: xpReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
