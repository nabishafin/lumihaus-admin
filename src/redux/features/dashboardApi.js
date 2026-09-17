import { baseApi } from "../base/baseApi";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: (period = "daily") => ({
        url: "/admin/dashboard",
        params: { period: typeof period === "string" ? period.toLowerCase() : "daily" },
      }),
      providesTags: (result, error, period = "daily") => [
        { type: "Dashboard", id: typeof period === "string" ? period.toLowerCase() : "daily" },
        "Dashboard",
        "Order",
        "Product",
      ],
    }),
    getAnalyticsStats: builder.query({
      query: (params) => ({
        url: "/admin/analytics/stats",
        params,
      }),
      providesTags: ["Dashboard"],
    }),
    getRevenueAnalytics: builder.query({
      query: (period = "daily") => ({
        url: "/admin/analytics",
        params: { period },
      }),
      providesTags: ["Dashboard"],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetAnalyticsStatsQuery,
  useGetRevenueAnalyticsQuery,
} = dashboardApi;
