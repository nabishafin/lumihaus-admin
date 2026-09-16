import { baseApi } from "../base/baseApi";

export const preOrderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPreOrders: builder.query({
      query: (params) => ({
        url: "/admin/pre-orders",
        params,
      }),
      providesTags: ["PreOrder"],
    }),
    getPreOrderById: builder.query({
      query: (id) => `/admin/pre-orders/${id}`,
      providesTags: (result, error, id) => [{ type: "PreOrder", id }],
    }),
    createPreOrder: builder.mutation({
      query: (data) => ({
        url: "/admin/pre-orders",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["PreOrder"],
    }),
    updatePreOrderStatus: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/pre-orders/${id}/status`,
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
