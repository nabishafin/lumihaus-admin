import { baseApi } from "../base/baseApi";

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query({
      query: (params) => {
        const cleanParams = {};
        if (params?.status && params.status !== "All") {
          cleanParams.status = params.status;
        }
        if (params?.searchTerm || params?.search) {
          const s = params.searchTerm || params.search;
          cleanParams.searchTerm = s;
          cleanParams.search = s;
        }
        if (params?.page) cleanParams.page = params.page;
        if (params?.limit) cleanParams.limit = params.limit;

        return {
          url: "/admin/orders",
          params: cleanParams,
        };
      },
      providesTags: ["Order"],
    }),
    getOrderById: builder.query({
      query: (id) => `/admin/orders/${id}`,
      providesTags: (result, error, id) => [{ type: "Order", id }],
    }),
    createOrder: builder.mutation({
      query: (data) => ({
        url: "/orders",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Order", "Dashboard"],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/orders/${id}/status`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => ["Order", "Dashboard", { type: "Order", id }],
    }),
    verifyBkashPayment: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/orders/${id}/verify-payment`,
        method: "PATCH",
        body: data || { paymentStatus: "Verified" },
      }),
      invalidatesTags: (result, error, { id }) => ["Order", "Dashboard", { type: "Order", id }],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
  useVerifyBkashPaymentMutation,
} = orderApi;
