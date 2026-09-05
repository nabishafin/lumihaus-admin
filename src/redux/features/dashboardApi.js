import { baseApi } from "../base/baseApi";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      queryFn: async (arg, api, extraOptions, baseQuery) => {
        // Try /admin/dashboard first
        const res1 = await baseQuery("/admin/dashboard");
        if (!res1.error) {
          return { data: res1.data };
        }

        // If not found, try /admin/analytics/stats
        const res2 = await baseQuery("/admin/analytics/stats");
        if (!res2.error) {
          return { data: res2.data };
        }

        // Also try /analytics/stats or /analytics/dashboard
        const res3 = await baseQuery("/analytics/dashboard");
        if (!res3.error) {
          return { data: res3.data };
        }

        const res4 = await baseQuery("/analytics/stats");
        if (!res4.error) {
          return { data: res4.data };
        }

        return { error: res1.error || res2.error };
      },
      providesTags: ["Order", "Product", "Dashboard"],
    }),
    getAnalyticsStats: builder.query({
      query: (params) => ({
        url: "/admin/analytics/stats",
        params,
      }),
      providesTags: ["Dashboard"],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetAnalyticsStatsQuery,
} = dashboardApi;
