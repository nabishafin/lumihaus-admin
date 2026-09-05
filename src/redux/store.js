import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "./base/baseApi";
import authReducer from "./slice/authSlice";

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

export default store;
