import { baseApi } from "../base/baseApi";

export const cmsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSettings: builder.query({
      query: () => "/settings",
      providesTags: ["Setting"],
    }),
    updateSettings: builder.mutation({
      query: (data) => ({
        url: "/settings",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Setting"],
    }),
    getPolicy: builder.query({
      query: (slug) => `/cms/policies/${slug}`,
      providesTags: ["Policy"],
    }),
    updatePolicy: builder.mutation({
      query: ({ slug, ...data }) => ({
        url: `/cms/policies/${slug}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Policy"],
    }),
    getRoutines: builder.query({
      query: () => "/routines",
      providesTags: ["Routine"],
    }),
    createRoutine: builder.mutation({
      query: (data) => ({
        url: "/routines",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Routine"],
    }),
    updateRoutine: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/routines/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Routine"],
    }),
    deleteRoutine: builder.mutation({
      query: (id) => ({
        url: `/routines/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Routine"],
    }),
  }),
});

export const {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useGetPolicyQuery,
  useUpdatePolicyMutation,
  useGetRoutinesQuery,
  useCreateRoutineMutation,
  useUpdateRoutineMutation,
  useDeleteRoutineMutation,
} = cmsApi;
