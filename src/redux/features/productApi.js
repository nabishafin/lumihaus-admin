import { baseApi } from "../base/baseApi";

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: (params) => {
        const cleanParams = {};
        if (params?.search || params?.searchTerm) {
          cleanParams.search = params.search || params.searchTerm;
        }
        if (params?.brand && params.brand !== "All") {
          cleanParams.brand = params.brand;
        }
        if (params?.category && params.category !== "All") {
          cleanParams.category = params.category;
        }
        if (params?.isNew !== undefined && params?.isNew !== null) {
          cleanParams.isNew = params.isNew;
        }
        if (params?.isBestSeller !== undefined && params?.isBestSeller !== null) {
          cleanParams.isBestSeller = params.isBestSeller;
        }
        if (params?.minPrice !== undefined && params?.minPrice !== null) {
          cleanParams.minPrice = params.minPrice;
        }
        if (params?.maxPrice !== undefined && params?.maxPrice !== null) {
          cleanParams.maxPrice = params.maxPrice;
        }
        if (params?.sort || params?.sortBy) {
          cleanParams.sort = params.sort || params.sortBy;
        }
        if (params?.page) cleanParams.page = params.page;
        if (params?.limit) cleanParams.limit = params.limit;

        return {
          url: "/products",
          params: cleanParams,
        };
      },
      providesTags: ["Product"],
    }),
    getProductById: builder.query({
      query: (id) => `/products/${id}`,
      providesTags: (result, error, id) => [{ type: "Product", id }],
    }),
    createProduct: builder.mutation({
      query: (data) => ({
        url: "/admin/products",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Product", "Dashboard"],
    }),
    updateProduct: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/products/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => ["Product", "Dashboard", { type: "Product", id }],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/admin/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product", "Dashboard"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi;
