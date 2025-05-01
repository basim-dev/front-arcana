import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: {
    show: false,
    message: "",
  },
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    showNotification: (state, action) => {
      state.value.show = true;
      state.value.message = action.payload;
    },
    hideNotification: (state) => {
      state.value.show = false;
      state.value.message = "";
    },
  },
});

export const { showNotification, hideNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
