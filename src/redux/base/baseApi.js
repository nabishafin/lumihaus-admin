import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout } from "../slice/authSlice";

const getBaseUrl = () => {
  const envUrl =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";
  const trimmed = envUrl.replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

const rawBaseQuery = fetchBaseQuery({
  baseUrl: getBaseUrl(),
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token =
      getState()?.auth?.token ||
      localStorage.getItem("lumihaus_admin_token") ||
      localStorage.getItem("admin_token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("lumihaus_token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  const status = result?.error?.status;
  const message =
    result?.error?.data?.message ||
    result?.data?.message ||
    "";

  const isAuthError =
    status === 401 ||
    status === 403 ||
    (typeof message === "string" &&
      (message.toLowerCase().includes("authentication required") ||
        message.toLowerCase().includes("invalid or expired token") ||
        message.toLowerCase().includes("admin access required") ||
        message.toLowerCase().includes("jwt expired")));

  if (isAuthError) {
    const url = typeof args === "string" ? args : args?.url || "";
    const isLoginEndpoint = url.includes("login");

    if (!isLoginEndpoint) {
      // Clear Redux state
      api.dispatch(logout());

      // Clear all possible local auth tokens
      if (typeof window !== "undefined") {
        localStorage.removeItem("lumihaus_admin_token");
        localStorage.removeItem("admin_token");
        localStorage.removeItem("token");
        localStorage.removeItem("lumihaus_admin_user");

        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
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

