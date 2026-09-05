import { baseApi } from "../base/baseApi";

export const preOrderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPreOrders: builder.query({
      query: (params) => ({
        url: "/pre-orders",
        params,
      }),
      providesTags: ["PreOrder"],
    }),
    getPreOrderById: builder.query({
      query: (id) => `/pre-orders/${id}`,
      providesTags: (result, error, id) => [{ type: "PreOrder", id }],
    }),
    createPreOrder: builder.mutation({
      query: (data) => ({
        url: "/pre-orders",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["PreOrder"],
    }),
    updatePreOrderStatus: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/pre-orders/${id}/status`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["PreOrder"],
    }),
  }),
});

export const {
  useGetPreOrdersQuery,
  useGetPreOrderByIdQuery,
  useCreatePreOrderMutation,
  useUpdatePreOrderStatusMutation,
} = preOrderApi;
