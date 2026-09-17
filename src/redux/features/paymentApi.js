import { baseApi } from "../base/baseApi";

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPaymentsSummary: builder.query({
      query: (params) => {
        const qs = new URLSearchParams();
        if (params?.from) qs.set("from", params.from);
        if (params?.to) qs.set("to", params.to);
        const search = qs.toString();
        return { url: `/admin/payments/summary${search ? `?${search}` : ""}` };
      },
      providesTags: ["Payment"],
    }),

    getPaymentTransactions: builder.query({
      query: (params) => {
        const qs = new URLSearchParams();
        qs.set("page", String(params?.page || 1));
        // Backend caps limit at 100; keep the client honest about that too.
        qs.set("limit", String(Math.min(Number(params?.limit) || 20, 100)));
        if (params?.method) qs.set("method", params.method);
        if (params?.status) qs.set("status", params.status);
        if (params?.search) qs.set("search", params.search);
        if (params?.from) qs.set("from", params.from);
        if (params?.to) qs.set("to", params.to);
        return { url: `/admin/payments/transactions?${qs.toString()}` };
      },
      providesTags: ["Payment"],
    }),

    // Records a refund that was already completed manually (bKash / courier).
    // It does not move any money on its own.
    recordRefund: builder.mutation({
      query: ({ orderId, amount, reason }) => ({
        url: `/admin/orders/${orderId}/refund`,
        method: "POST",
        body: {
          reason,
          // Omit `amount` entirely for a full refund — never send "" or a
          // formatted currency string.
          ...(amount === undefined || amount === null ? {} : { amount }),
        },
      }),
      invalidatesTags: ["Payment", "Order", "Dashboard"],
    }),
  }),
});

export const {
  useGetPaymentsSummaryQuery,
  useGetPaymentTransactionsQuery,
  useRecordRefundMutation,
} = paymentApi;
