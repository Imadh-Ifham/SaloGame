// src/redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import machineReducer from "./slices/machineSlice";
import membershipReducer from "./slices/membershipSlice";
import offerReducer from "./slices/offerSlice";
import bookingReducer from "./slices/bookingSlice";

const store = configureStore({
  reducer: {
    machine: machineReducer,
    membership: membershipReducer,
    offer: offerReducer,
    booking: bookingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
