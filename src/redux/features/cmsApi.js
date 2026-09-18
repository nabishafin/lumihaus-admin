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
    getPolicies: builder.query({
      query: () => "/cms/policies",
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
    getGermanRitual: builder.query({
      query: () => "/cms/german-ritual",
      providesTags: ["GermanRitual"],
    }),
    updateGermanRitual: builder.mutation({
      query: (data) => ({
        url: "/cms/german-ritual",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["GermanRitual"],
    }),
    getCampaignBanner: builder.query({
      query: () => "/cms/banner-campaign",
      providesTags: ["BannerCampaign"],
    }),
    updateCampaignBanner: builder.mutation({
      query: (data) => ({
        url: "/cms/banner-campaign",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["BannerCampaign", "Setting"],
    }),
    getFaqs: builder.query({
      query: () => "/cms/faqs",
      providesTags: ["FAQ"],
    }),
    createFaq: builder.mutation({
      query: (data) => ({
        url: "/cms/faqs",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["FAQ"],
    }),
    updateFaq: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/cms/faqs/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["FAQ"],
    }),
    getAboutUs: builder.query({
      query: () => "/cms/about-us",
      providesTags: ["AboutUs"],
    }),
    updateAboutUs: builder.mutation({
      query: (data) => ({
        url: "/cms/about-us",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["AboutUs"],
    }),
    deleteFaq: builder.mutation({
      query: (id) => ({
        url: `/cms/faqs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["FAQ"],
    }),
  }),
});

export const {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useGetPolicyQuery,
  useGetPoliciesQuery,
  useUpdatePolicyMutation,
  useGetRoutinesQuery,
  useCreateRoutineMutation,
  useUpdateRoutineMutation,
  useDeleteRoutineMutation,
  useGetGermanRitualQuery,
  useUpdateGermanRitualMutation,
  useGetCampaignBannerQuery,
  useUpdateCampaignBannerMutation,
  useGetFaqsQuery,
  useCreateFaqMutation,
  useUpdateFaqMutation,
  useDeleteFaqMutation,
  useGetAboutUsQuery,
  useUpdateAboutUsMutation,
} = cmsApi;

