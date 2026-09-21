import { baseApi } from "../base/baseApi";

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Customers and admins come from the same collection; `role` filters it.
    getUsers: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams();
        qs.set("page", String(params.page || 1));
        // Backend caps limit at 100.
        qs.set("limit", String(Math.min(Number(params.limit) || 10, 100)));
        if (params.search) qs.set("search", params.search);
        if (params.role && params.role !== "All") qs.set("role", params.role);
        if (params.sort) qs.set("sort", params.sort);
        return { url: `/admin/users?${qs.toString()}` };
      },
      providesTags: ["User"],
    }),

    getUserById: builder.query({
      query: (id) => `/admin/users/${id}`,
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),

    // super_admin only. Creates an admin/super_admin account directly, without
    // the customer self-registration flow.
    createAdmin: builder.mutation({
      query: (body) => ({
        url: "/admin/users",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    // super_admin only. Promotes or demotes between customer/admin/super_admin.
    updateUserRole: builder.mutation({
      query: ({ id, role }) => ({
        url: `/admin/users/${id}/role`,
        method: "PATCH",
        body: { role },
      }),
      invalidatesTags: (result, error, { id }) => ["User", { type: "User", id }],
    }),

    // Blocking keeps the account and its order history; deleting does not.
    updateUserStatus: builder.mutation({
      query: ({ id, isBlocked }) => ({
        url: `/admin/users/${id}/status`,
        method: "PATCH",
        body: { isBlocked },
      }),
      invalidatesTags: (result, error, { id }) => ["User", { type: "User", id }],
    }),

    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User", "Order"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateAdminMutation,
  useUpdateUserRoleMutation,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
} = userApi;
