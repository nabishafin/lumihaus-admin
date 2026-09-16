import { baseApi } from "../base/baseApi";

export const subscriberApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubscribers: builder.query({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.set("page", String(params.page));
        if (params?.limit) queryParams.set("limit", String(params.limit));
        if (params?.search) queryParams.set("search", params.search);
        const qs = queryParams.toString();
        return { url: `/admin/subscribers${qs ? `?${qs}` : ""}` };
      },
      providesTags: ["Subscriber"],
    }),
    unsubscribe: builder.mutation({
      query: (id) => ({
        url: `/admin/subscribers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Subscriber"],
    }),
  }),
});

export const { useGetSubscribersQuery, useUnsubscribeMutation } = subscriberApi;
