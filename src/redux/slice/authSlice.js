import { createSlice } from "@reduxjs/toolkit";

const savedToken = typeof window !== "undefined" ? localStorage.getItem("lumihaus_admin_token") : null;
const savedUser = typeof window !== "undefined" ? localStorage.getItem("lumihaus_admin_user") : null;

const initialState = {
  user: savedUser ? JSON.parse(savedUser) : null,
  token: savedToken || null,
  isAuthenticated: !!savedToken,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;

      if (typeof window !== "undefined") {
        localStorage.setItem("lumihaus_admin_token", token);
        localStorage.setItem("lumihaus_admin_user", JSON.stringify(user));
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;

      if (typeof window !== "undefined") {
        localStorage.removeItem("lumihaus_admin_token");
        localStorage.removeItem("lumihaus_admin_user");
      }
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
