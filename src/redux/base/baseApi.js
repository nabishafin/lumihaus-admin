import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const trimmed = envUrl.replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

const baseQuery = fetchBaseQuery({
  baseUrl: getBaseUrl(),
  prepareHeaders: (headers, { getState }) => {
    const token =
      getState()?.auth?.token ||
      localStorage.getItem("token") ||
      localStorage.getItem("admin_token") ||
      localStorage.getItem("lumihaus_admin_token") ||
      localStorage.getItem("lumihaus_token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: [
    "Auth",
    "Product",
    "Category",
    "Brand",
    "Order",
    "PreOrder",
    "Coupon",
    "Banner",
    "Setting",
    "Policy",
    "User",
    "Dashboard",
    "Routine",
  ],
  endpoints: () => ({}),
});

export const apiSlice = baseApi;
export default baseApi;
