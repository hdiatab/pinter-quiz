import { createSlice } from "@reduxjs/toolkit";

const getInitialState = () => {
  let loggedInUserId = localStorage.getItem("loggedInUser") || sessionStorage.getItem("loggedInUser");

  if (!loggedInUserId) return { user: null, isAuthenticated: false };

  loggedInUserId = loggedInUserId.trim();

  const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");

  const foundUser = existingUsers.find((user: { id: string }) => user.id.trim() === loggedInUserId);

  if (foundUser) {
    return { user: foundUser, isAuthenticated: true };
  }
};

let initialState = getInitialState();

export const counterSlice = createSlice({
  name: "auth",
  initialState: {
    user: initialState?.user || {},
    isAuthenticated: initialState?.isAuthenticated || false,
  },
  reducers: {
    setAuthenticated: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = {};
      state.isAuthenticated = false;
      localStorage.removeItem("loggedInUser");
      sessionStorage.removeItem("loggedInUser");
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
});

export const { setAuthenticated, logout, setUser } = counterSlice.actions;

const { reducer: authReducer } = counterSlice;

export default authReducer;
