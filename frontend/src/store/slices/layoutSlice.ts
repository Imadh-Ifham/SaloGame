import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";

type LayoutState = {
  isMoreMachineClicked: boolean;
};

const initialState: LayoutState = {
  isMoreMachineClicked: false,
};

const layoutSlice = createSlice({
  name: "layout",
  initialState,
  reducers: {
    toggleMoreMachine(state) {
      state.isMoreMachineClicked = !state.isMoreMachineClicked;
    },
  },
});

export const { toggleMoreMachine } = layoutSlice.actions;

export default layoutSlice.reducer;

export const selectIsMoreMachineClicked = (state: RootState) =>
  state.layout.isMoreMachineClicked;
