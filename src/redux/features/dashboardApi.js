import { baseApi } from "../base/baseApi";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: () => "/admin/dashboard",
      providesTags: ["Dashboard", "Order", "Product"],
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
