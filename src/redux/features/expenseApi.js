import { baseApi } from "../base/baseApi";

export const expenseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Primary Unified 4-Card Summary: GET /admin/expenses/summary
    getExpenseSummary: builder.query({
      query: (params) => {
        const cleanParams = {};
        if (params?.from) cleanParams.from = params.from;
        if (params?.to) cleanParams.to = params.to;
        if (params?.month) cleanParams.month = params.month;
        return {
          url: "/admin/expenses/summary",
          params: Object.keys(cleanParams).length > 0 ? cleanParams : undefined,
        };
      },
      providesTags: ["Expense", "Payment", "Order"],
    }),

    // Individual card endpoints (also supported by backend)
    getTotalExpensesSummary: builder.query({
      query: (params) => ({
        url: "/admin/expenses/summary/total-expenses",
        params: params?.from && params?.to ? { from: params.from, to: params.to } : undefined,
      }),
      providesTags: ["Expense"],
    }),

    getThisMonthExpensesSummary: builder.query({
      query: (month) => ({
        url: "/admin/expenses/summary/this-month",
        params: month ? { month } : undefined,
      }),
      providesTags: ["Expense"],
    }),

    getTopCategorySummary: builder.query({
      query: (params) => ({
        url: "/admin/expenses/summary/top-category",
        params: params?.from && params?.to ? { from: params.from, to: params.to } : undefined,
      }),
      providesTags: ["Expense"],
    }),

    getNetProfitSummary: builder.query({
      query: (params) => ({
        url: "/admin/expenses/summary/net-profit",
        params: params?.from && params?.to ? { from: params.from, to: params.to } : undefined,
      }),
      providesTags: ["Expense", "Payment", "Order"],
    }),

    // 2. Cost Breakdown by Category: GET /admin/expenses/category-breakdown
    getCategoryBreakdown: builder.query({
      query: (params) => ({
        url: "/admin/expenses/category-breakdown",
        params: params?.from && params?.to ? { from: params.from, to: params.to } : undefined,
      }),
      providesTags: ["Expense"],
    }),

    // 3. Main Expenses Table: GET /admin/expenses
    getExpenses: builder.query({
      query: (params = {}) => {
        const cleanParams = {};
        if (params.search) cleanParams.search = params.search;
        if (params.category && params.category !== "All Categories" && params.category !== "all") {
          cleanParams.category = params.category;
        }
        if (params.sort) cleanParams.sort = params.sort;
        if (params.page) cleanParams.page = params.page;
        if (params.limit) cleanParams.limit = params.limit;
        if (params.from) cleanParams.from = params.from;
        if (params.to) cleanParams.to = params.to;

        return {
          url: "/admin/expenses",
          params: cleanParams,
        };
      },
      providesTags: ["Expense"],
    }),

    // 4. Dropdowns
    getExpenseCategories: builder.query({
      query: () => "/admin/expenses/categories",
      providesTags: ["Expense"],
    }),

    getExpensePaymentMethods: builder.query({
      query: () => "/admin/expenses/payment-methods",
      providesTags: ["Expense"],
    }),

    // 5. Details
    getExpenseById: builder.query({
      query: (id) => `/admin/expenses/${id}`,
      providesTags: (result, error, id) => [{ type: "Expense", id }],
    }),

    // 6. Mutations (Add / Edit / Delete)
    createExpense: builder.mutation({
      query: (body) => ({
        url: "/admin/expenses",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Expense", "Dashboard", "Order", "OrderProfit"],
    }),

    updateExpense: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/expenses/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Expense", id },
        "Expense",
        "Dashboard",
        "Order",
        "OrderProfit",
      ],
    }),

    deleteExpense: builder.mutation({
      query: (id) => ({
        url: `/admin/expenses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Expense", "Dashboard", "Order", "OrderProfit"],
    }),
  }),
});

export const {
  useGetExpenseSummaryQuery,
  useGetTotalExpensesSummaryQuery,
  useGetThisMonthExpensesSummaryQuery,
  useGetTopCategorySummaryQuery,
  useGetNetProfitSummaryQuery,
  useGetCategoryBreakdownQuery,
  useGetExpensesQuery,
  useGetExpenseCategoriesQuery,
  useGetExpensePaymentMethodsQuery,
  useGetExpenseByIdQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} = expenseApi;
