import { baseApi } from "../base/baseApi";

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.status && params.status !== "All") {
          queryParams.set("status", params.status);
        }
        if (params?.searchTerm || params?.search) {
          queryParams.set("searchTerm", params.searchTerm || params.search);
        }
        if (params?.page) queryParams.set("page", String(params.page));
        if (params?.limit) queryParams.set("limit", String(params.limit));
        if (params?.from) queryParams.set("from", String(params.from));
        if (params?.to) queryParams.set("to", String(params.to));

        const qs = queryParams.toString();
        return {
          url: `/admin/orders${qs ? `?${qs}` : ""}`,
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
      invalidatesTags: (result, error, { id }) => [
        "Order",
        "Dashboard",
        "Expense",
        "OrderProfit",
        { type: "Order", id },
        { type: "OrderProfit", id },
      ],
    }),
    verifyBkashPayment: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/orders/${id}/verify-payment`,
        method: "PATCH",
        body: data || { paymentStatus: "Verified" },
      }),
      invalidatesTags: (result, error, { id }) => [
        "Order",
        "Dashboard",
        "Expense",
        "OrderProfit",
        { type: "Order", id },
        { type: "OrderProfit", id },
      ],
    }),
    getOrderProfitBreakdown: builder.query({
      query: (id) => `/admin/orders/${id}/profit-breakdown`,
      providesTags: (result, error, id) => [
        { type: "OrderProfit", id },
        "OrderProfit",
      ],
    }),
    refundOrder: builder.mutation({
      query: ({ id, reason, amount }) => ({
        url: `/admin/orders/${id}/refund`,
        method: "POST",
        body: { reason, amount: Number(amount) },
      }),
      invalidatesTags: (result, error, { id }) => [
        "Order",
        "Dashboard",
        "Expense",
        "OrderProfit",
        { type: "Order", id },
        { type: "OrderProfit", id },
      ],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
  useVerifyBkashPaymentMutation,
  useGetOrderProfitBreakdownQuery,
  useRefundOrderMutation,
} = orderApi;
