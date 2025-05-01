import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: {
    token: null,
    username: null,
    userId: null,
    firstName: null,
    lastName: null,
    email: null,
    bio: null,
    avatar: null,
    followers: [],
    following: [],
  },
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action) => {
      state.value = {
        token: action.payload.token,
        username: action.payload.username,
        userId: action.payload.userId,
        firstName: action.payload.firstName,
        lastName: action.payload.lastName,
        email: action.payload.email,
        bio: action.payload.bio,
        avatar: action.payload.avatar,
        followers: action.payload.followers || [],
        following: action.payload.following || [],
      };
    },
    logout: (state) => {
      state.value = {
        token: null,
        username: null,
        userId: null,
        firstName: null,
        lastName: null,
        email: null,
        bio: null,
        avatar: null,
        followers: [],
        following: [],
      };
    },
  },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
