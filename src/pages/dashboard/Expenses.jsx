import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  Trash2,
  Edit3,
  Download,
  Calendar,
  Wallet,
  TrendingDown,
  TrendingUp,
  Tag,
  Receipt,
  FileText,
  DollarSign,
  PieChart,
  CheckCircle2,
  X,
  ArrowUpRight,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import confirmToast from "../../utils/confirmToast";
import { useAdminUI } from "../../context/AdminUIContext";
import {
  useGetExpenseSummaryQuery,
  useGetCategoryBreakdownQuery,
  useGetExpensesQuery,
  useGetExpenseCategoriesQuery,
  useGetExpensePaymentMethodsQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} from "../../redux/features/expenseApi";

const DEFAULT_CATEGORIES = [
  "Product Sourcing",
  "Shipping & Customs",
  "Marketing & Ads",
  "Packaging & Supplies",
  "Domestic Courier",
  "Software & Hosting",
  "Office & Staff",
  "Miscellaneous",
];

const DEFAULT_PAYMENT_METHODS = [
  "Credit Card",
  "Bank Transfer",
  "bKash Merchant",
  "Nagad",
  "Cash",
  "Wise (Euro)",
];

export default function Expenses() {
  const { notify } = useAdminUI();

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [dateSort, setDateSort] = useState("newest");
  const [page, setPage] = useState(1);
  const limit = 20;

  // Optional date bounds for summary reports
  const [reportDateRange, setReportDateRange] = useState({ from: "", to: "" });

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPage(1); // Reset page on new search
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset page on category or sort change
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setPage(1);
  };

  const handleSortChange = (e) => {
    setDateSort(e.target.value);
    setPage(1);
  };

  // 1. Unified 4-Stats-Cards Query: GET /admin/expenses/summary
  const {
    data: summaryRes,
    isLoading: isSummaryLoading,
    refetch: refetchSummary,
  } = useGetExpenseSummaryQuery(
    reportDateRange.from && reportDateRange.to ? reportDateRange : undefined
  );

  // 2. Cost Breakdown Section: GET /admin/expenses/category-breakdown
  const {
    data: breakdownRes,
    isLoading: isBreakdownLoading,
    refetch: refetchBreakdown,
  } = useGetCategoryBreakdownQuery(
    reportDateRange.from && reportDateRange.to ? reportDateRange : undefined
  );

  // 6. Main Expenses List Query
  const {
    data: expensesRes,
    isLoading: isExpensesLoading,
    isFetching: isExpensesFetching,
    refetch: refetchExpenses,
  } = useGetExpensesQuery({
    search: debouncedSearch,
    category: selectedCategory,
    sort: dateSort,
    page,
    limit,
    from: reportDateRange.from || undefined,
    to: reportDateRange.to || undefined,
  });

  // 7. Dynamic Category & Payment Options
  const { data: categoriesRes } = useGetExpenseCategoriesQuery();
  const { data: paymentMethodsRes } = useGetExpensePaymentMethodsQuery();

  // Mutations
  const [createExpense, { isLoading: isCreating }] = useCreateExpenseMutation();
  const [updateExpense, { isLoading: isUpdating }] = useUpdateExpenseMutation();
  const [deleteExpense, { isLoading: isDeleting }] = useDeleteExpenseMutation();

  // Categories list for dropdown
  const categoryOptions = useMemo(() => {
    if (Array.isArray(categoriesRes?.data) && categoriesRes.data.length > 0) {
      return categoriesRes.data;
    }
    if (Array.isArray(categoriesRes) && categoriesRes.length > 0) {
      return categoriesRes;
    }
    return DEFAULT_CATEGORIES;
  }, [categoriesRes]);

  // Payment methods list for dropdown
  const paymentMethodOptions = useMemo(() => {
    if (Array.isArray(paymentMethodsRes?.data) && paymentMethodsRes.data.length > 0) {
      return paymentMethodsRes.data;
    }
    if (Array.isArray(paymentMethodsRes) && paymentMethodsRes.length > 0) {
      return paymentMethodsRes;
    }
    return DEFAULT_PAYMENT_METHODS;
  }, [paymentMethodsRes]);

  // Modal & Form State
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    category: "Product Sourcing",
    treatment: "operating",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    paymentMethod: "Credit Card",
    vendor: "",
    note: "",
  });

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingExpense(null);
    setFormData({
      title: "",
      category: categoryOptions[0] || "Product Sourcing",
      treatment: "operating",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      paymentMethod: paymentMethodOptions[0] || "Credit Card",
      vendor: "",
      note: "",
    });
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setEditingExpense(item);
    setFormData({
      title: item.title || "",
      category: item.category || categoryOptions[0] || "Product Sourcing",
      treatment: item.treatment || item.expenseType || (item.category === "Product Sourcing" || item.category === "Shipping & Customs" ? "inventory" : "operating"),
      amount: item.amount || "",
      date: item.date ? item.date.split("T")[0] : new Date().toISOString().split("T")[0],
      paymentMethod: item.paymentMethod || paymentMethodOptions[0] || "Credit Card",
      vendor: item.vendor || "",
      note: item.note || "",
    });
    setShowModal(true);
  };

  // Delete Expense
  const handleDelete = (id, title) => {
    confirmToast({
      title: "Delete Expense Record?",
      message: `Are you sure you want to permanently delete expense record "${title}"? This cannot be undone.`,
      confirmLabel: "Yes, Delete",
      onConfirm: async () => {
        try {
          await deleteExpense(id).unwrap();
          notify(`Expense record "${title}" deleted successfully`);
        } catch (err) {
          notify(err?.data?.message || err?.message || "Failed to delete expense", "error");
        }
      },
    });
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.amount) {
      notify("Please provide expense title and amount", "error");
      return;
    }

    const payload = {
      title: formData.title.trim(),
      category: formData.category,
      treatment: formData.treatment,
      expenseType: formData.treatment,
      amount: Number(formData.amount),
      date: formData.date,
      paymentMethod: formData.paymentMethod.trim(),
      vendor: formData.vendor.trim(),
      note: formData.note.trim(),
    };

    try {
      if (editingExpense) {
        const expenseId = editingExpense._id || editingExpense.expenseNumber || editingExpense.id;
        await updateExpense({ id: expenseId, ...payload }).unwrap();
        notify("Expense record updated successfully");
      } else {
        await createExpense(payload).unwrap();
        notify(`New expense of ৳${Number(formData.amount).toLocaleString("en-BD")} created`);
      }
      setShowModal(false);
    } catch (err) {
      notify(err?.data?.message || err?.message || "Failed to save expense", "error");
    }
  };

  // Export CSV via Backend GET /admin/expenses/export
  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const token =
        localStorage.getItem("lumihaus_admin_token") ||
        localStorage.getItem("admin_token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("lumihaus_token");

      const envUrl =
        import.meta.env.VITE_API_BASE_URL ||
        import.meta.env.VITE_API_URL ||
        "http://localhost:5000/api";
      const baseUrl = envUrl.replace(/\/+$/, "").endsWith("/api")
        ? envUrl.replace(/\/+$/, "")
        : `${envUrl.replace(/\/+$/, "")}/api`;

      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (selectedCategory && selectedCategory !== "All Categories") {
        params.set("category", selectedCategory);
      }
      if (dateSort) params.set("sort", dateSort);
      if (reportDateRange.from) params.set("from", reportDateRange.from);
      if (reportDateRange.to) params.set("to", reportDateRange.to);

      const res = await fetch(`${baseUrl}/admin/expenses/export?${params.toString()}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error(errorJson.message || `Export failed with status ${res.status}`);
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `LumiHaus_Expenses_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
      notify("Expenses CSV exported successfully");
    } catch (err) {
      notify(err.message || "Failed to export CSV", "error");
    } finally {
      setIsExporting(false);
    }
  };

  // Unpack Data from 3 Section Queries
  const summaryPayload = summaryRes?.data || summaryRes || {};
  const totalExpensesData = summaryPayload.totalExpenses?.totalExpenses !== undefined
    ? summaryPayload.totalExpenses
    : (summaryPayload.totalExpenses || {});
  const thisMonthData = summaryPayload.thisMonth || {};
  const topCategoryData = summaryPayload.topCategory || {};
  const netProfitData = summaryPayload.netProfit || {};
  const breakdownList = breakdownRes?.data?.categories || breakdownRes?.categories || [];

  // Cost indicators from backend
  const hasMissingCosts = Boolean(
    netProfitData?.missingCosts ||
    netProfitData?.hasMissingCosts ||
    (netProfitData?.missingCostCount && netProfitData.missingCostCount > 0) ||
    netProfitData?.costStatus === "incomplete"
  );
  const hasCogsData = netProfitData?.cogs !== undefined && netProfitData?.cogs !== null;

  const expensesList = expensesRes?.data?.expenses || expensesRes?.expenses || [];
  const pagination = expensesRes?.data?.pagination || expensesRes?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  };
  const totalRecords = expensesRes?.data?.totalRecords ?? expensesRes?.totalRecords ?? 0;

  return (
    <>
      <title>LumiHaus Admin · Expenses & Cost Tracking</title>

      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <span className="page-kicker">FINANCIAL COST MANAGEMENT</span>
          <h2>Expenses & Cost Tracker</h2>
          <p>
            Real-time business expenditures, air freight, customs duties, packaging, and ad spend synced directly with backend.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="button secondary flex items-center gap-1.5"
            title="Download CSV Report"
          >
            {isExporting ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
            <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="button flex items-center gap-1.5 shadow-md shadow-[#26382E]/20"
          >
            <Plus size={16} />
            <span>+ Add Expense</span>
          </button>
        </div>
      </div>

      {/* Missing Costs Warning Banner */}
      {hasMissingCosts && (
        <div className="rounded-2xl border-2 border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/40 p-4 mb-6 text-amber-900 dark:text-amber-200 flex items-start justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <AlertCircle size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-black text-amber-950 dark:text-amber-100 text-sm">
                Profit incomplete — purchase costs missing
              </strong>
              <p className="mt-0.5 leading-relaxed text-amber-800 dark:text-amber-300 font-medium">
                One or more products sold in this period lack recorded unit purchase costs (costPrice).
                Final gross & net profit cannot be determined accurately until all unit costs are recorded in Product Catalog.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold bg-amber-200/80 dark:bg-amber-900/60 px-3 py-1 rounded-lg shrink-0 border border-amber-300 dark:border-amber-700">
            Partial Tracking
          </span>
        </div>
      )}

      {/* KPI Cards Grid (GET /api/admin/expenses/summary) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Card 1: Total Expenses */}
        <div className="rounded-2xl border-2 border-[#DCD6CB] dark:border-white/10 bg-white dark:bg-[#222620] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#2E4235] dark:text-[#D2DDD6] uppercase tracking-wide">
              Total Expenses
            </span>
            <div className="h-10 w-10 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400">
              <TrendingDown size={20} />
            </div>
          </div>
          <div className="mt-2">
            {isSummaryLoading ? (
              <div className="h-8 w-32 bg-neutral-200 dark:bg-white/10 rounded animate-pulse my-1" />
            ) : (
              <h3 className="text-2xl font-black text-[#141f17] dark:text-white">
                ৳{Number(totalExpensesData.totalExpenses || 0).toLocaleString("en-BD")}
              </h3>
            )}
            <p className="text-xs font-semibold text-[#2E4235] dark:text-[#D2DDD6] mt-1">
              Across {totalExpensesData.count ?? 0} recorded line items
            </p>
          </div>
        </div>

        {/* Card 2: This Month */}
        <div className="rounded-2xl border-2 border-[#DCD6CB] dark:border-white/10 bg-white dark:bg-[#222620] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#2E4235] dark:text-[#D2DDD6] uppercase tracking-wide">
              This Month
            </span>
            <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-center justify-center text-amber-700 dark:text-amber-400">
              <Calendar size={20} />
            </div>
          </div>
          <div className="mt-2">
            {isSummaryLoading ? (
              <div className="h-8 w-32 bg-neutral-200 dark:bg-white/10 rounded animate-pulse my-1" />
            ) : (
              <h3 className="text-2xl font-black text-[#141f17] dark:text-white">
                ৳{Number(thisMonthData.totalExpenses || 0).toLocaleString("en-BD")}
              </h3>
            )}
            <p className="text-xs font-semibold text-[#2E4235] dark:text-[#D2DDD6] mt-1">
              {thisMonthData.label || "Current Month"} ({thisMonthData.count ?? 0} entries)
            </p>
          </div>
        </div>

        {/* Card 3: Top Expense Category */}
        <div className="rounded-2xl border-2 border-[#DCD6CB] dark:border-white/10 bg-white dark:bg-[#222620] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#2E4235] dark:text-[#D2DDD6] uppercase tracking-wide">
              Top Expense Category
            </span>
            <div className="h-10 w-10 rounded-xl bg-[#EEF3EF] dark:bg-[#8FAF9A]/15 border border-[#8FAF9A]/30 flex items-center justify-center text-[#26382E] dark:text-[#8FAF9A]">
              <Tag size={20} />
            </div>
          </div>
          <div className="mt-2">
            {isSummaryLoading ? (
              <div className="h-8 w-32 bg-neutral-200 dark:bg-white/10 rounded animate-pulse my-1" />
            ) : topCategoryData.category ? (
              <>
                <h3 className="text-xl font-black text-[#141f17] dark:text-white truncate">
                  {topCategoryData.category}
                </h3>
                <p className="text-xs font-semibold text-[#2E4235] dark:text-[#D2DDD6] mt-1">
                  ৳{Number(topCategoryData.amount || 0).toLocaleString("en-BD")} ({topCategoryData.percentage ?? 0}% of total)
                </p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-black text-[#141f17] dark:text-white">None</h3>
                <p className="text-xs font-semibold text-[#2E4235] dark:text-[#D2DDD6] mt-1">
                  No recorded expenses yet
                </p>
              </>
            )}
          </div>
        </div>

        {/* Card 4: Est. Net Profit */}
        <div className="rounded-2xl border-2 border-[#8FAF9A]/40 dark:border-[#8FAF9A]/30 bg-gradient-to-br from-[#EEF3EF] to-white dark:from-[#222620] dark:to-[#1A1D1B] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#26382E] dark:text-[#8FAF9A] uppercase tracking-wide">
              {hasCogsData ? "Net Profit (Accrual COGS)" : "Est. Net Position"}
            </span>
            <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="mt-2">
            {isSummaryLoading ? (
              <div className="h-8 w-32 bg-neutral-200 dark:bg-white/10 rounded animate-pulse my-1" />
            ) : (
              <h3 className={`text-2xl font-black ${
                Number(netProfitData.estimatedNetProfit || 0) < 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-emerald-800 dark:text-emerald-400"
              }`}>
                ৳{Number(netProfitData.estimatedNetProfit || 0).toLocaleString("en-BD")}
              </h3>
            )}
            <div className="flex items-center justify-between gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-1">
              <span className="flex items-center gap-1">
                <ArrowUpRight size={14} />
                {netProfitData.netMarginPercentage !== null && netProfitData.netMarginPercentage !== undefined
                  ? `~${netProfitData.netMarginPercentage}% Margin`
                  : "Margin N/A"}
              </span>
              <span className="text-[10px] text-[#2E4235]/70 dark:text-[#D2DDD6]/70 font-medium">
                {hasCogsData
                  ? "Gross − OpEx"
                  : netProfitData.revenueBasis === "collected"
                  ? "Cash Collections Basis"
                  : "Collections Basis"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Statement & Calculation Basis Card */}
      <div className="rounded-2xl border border-[#DCD6CB] dark:border-white/10 bg-white dark:bg-[#222620] p-5 mb-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#DCD6CB] dark:border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <Receipt size={17} className="text-[#8FAF9A]" />
            <h3 className="text-sm font-black text-[#141f17] dark:text-white">
              Financial Statement & Calculation Basis
            </h3>
          </div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#EEF3EF] dark:bg-white/10 text-[#26382E] dark:text-[#8FAF9A]">
            {hasCogsData ? "Accrual COGS Method" : "Cash Collections Method"}
          </span>
        </div>

        {hasCogsData ? (
          /* Accrual COGS Statement: Net Sales − COGS = Gross Profit − OpEx = Net Profit */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
            <div className="p-3 rounded-xl bg-[#F9F6EF] dark:bg-white/5 border border-[#DCD6CB] dark:border-white/10">
              <span className="text-[11px] font-bold text-[#2E4235]/80 dark:text-[#D2DDD6]/80 block">Net Sales</span>
              <strong className="text-sm font-black text-[#141f17] dark:text-white block mt-1">
                ৳{Number(netProfitData.netSales || 0).toLocaleString("en-BD")}
              </strong>
            </div>

            <div className="p-3 rounded-xl bg-[#F9F6EF] dark:bg-white/5 border border-[#DCD6CB] dark:border-white/10">
              <span className="text-[11px] font-bold text-red-700 dark:text-red-400 block">Less: COGS</span>
              <strong className="text-sm font-black text-red-700 dark:text-red-400 block mt-1">
                ৳{Number(netProfitData.cogs || 0).toLocaleString("en-BD")}
              </strong>
              <span className="text-[9px] text-gray-400 block mt-0.5">(Sold units only)</span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block">= Gross Profit</span>
              <strong className="text-sm font-black text-emerald-800 dark:text-emerald-300 block mt-1">
                ৳{Number(netProfitData.grossProfit || 0).toLocaleString("en-BD")}
              </strong>
            </div>

            <div className="p-3 rounded-xl bg-[#F9F6EF] dark:bg-white/5 border border-[#DCD6CB] dark:border-white/10">
              <span className="text-[11px] font-bold text-red-700 dark:text-red-400 block">Less: OpEx</span>
              <strong className="text-sm font-black text-red-700 dark:text-red-400 block mt-1">
                ৳{Number(netProfitData.operatingExpenses || totalExpensesData.totalExpenses || 0).toLocaleString("en-BD")}
              </strong>
              <span className="text-[9px] text-gray-400 block mt-0.5">(Overheads)</span>
            </div>

            <div className="p-3 rounded-xl bg-[#26382E] dark:bg-[#8FAF9A] text-white dark:text-[#17251C]">
              <span className="text-[11px] font-bold opacity-85 block">= Net Profit</span>
              <strong className="text-sm font-black block mt-1">
                ৳{Number(netProfitData.estimatedNetProfit || 0).toLocaleString("en-BD")}
              </strong>
            </div>

            <div className="p-3 rounded-xl bg-[#F9F6EF] dark:bg-white/5 border border-[#DCD6CB] dark:border-white/10">
              <span className="text-[11px] font-bold text-[#2E4235]/80 dark:text-[#D2DDD6]/80 block">Net Margin</span>
              <strong className="text-sm font-black text-[#141f17] dark:text-white block mt-1">
                {netProfitData.netMarginPercentage !== null ? `${netProfitData.netMarginPercentage}%` : "N/A"}
              </strong>
            </div>
          </div>
        ) : (
          /* Cash Collections Statement: Received − Refunded = Net Collections − Expenses = Net Cash */
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div className="p-3 rounded-xl bg-[#F9F6EF] dark:bg-white/5 border border-[#DCD6CB] dark:border-white/10">
                <span className="text-[11px] font-bold text-[#2E4235]/80 dark:text-[#D2DDD6]/80 block">Collections Received</span>
                <strong className="text-sm font-black text-emerald-700 dark:text-emerald-400 block mt-1">
                  ৳{Number(netProfitData.paymentsReceived || 0).toLocaleString("en-BD")}
                </strong>
              </div>

              <div className="p-3 rounded-xl bg-[#F9F6EF] dark:bg-white/5 border border-[#DCD6CB] dark:border-white/10">
                <span className="text-[11px] font-bold text-red-600 dark:text-red-400 block">Less: Refunds</span>
                <strong className="text-sm font-black text-red-600 dark:text-red-400 block mt-1">
                  ৳{Number(netProfitData.refunded || 0).toLocaleString("en-BD")}
                </strong>
              </div>

              <div className="p-3 rounded-xl bg-[#F9F6EF] dark:bg-white/5 border border-[#DCD6CB] dark:border-white/10">
                <span className="text-[11px] font-bold text-[#2E4235]/80 dark:text-[#D2DDD6]/80 block">= Net Collections</span>
                <strong className="text-sm font-black text-[#141f17] dark:text-white block mt-1">
                  ৳{Number(netProfitData.netRevenue || 0).toLocaleString("en-BD")}
                </strong>
              </div>

              <div className="p-3 rounded-xl bg-[#F9F6EF] dark:bg-white/5 border border-[#DCD6CB] dark:border-white/10">
                <span className="text-[11px] font-bold text-red-700 dark:text-red-400 block">Less: Recorded Expenses</span>
                <strong className="text-sm font-black text-red-700 dark:text-red-400 block mt-1">
                  ৳{Number(totalExpensesData.totalExpenses || 0).toLocaleString("en-BD")}
                </strong>
              </div>

              <div className="p-3 rounded-xl bg-[#26382E] dark:bg-[#8FAF9A] text-white dark:text-[#17251C]">
                <span className="text-[11px] font-bold opacity-85 block">= Est. Cash Position</span>
                <strong className="text-sm font-black block mt-1">
                  ৳{Number(netProfitData.estimatedNetProfit || 0).toLocaleString("en-BD")}
                </strong>
              </div>
            </div>
            <p className="text-[11px] text-[#2E4235]/70 dark:text-[#D2DDD6]/70 mt-3 font-medium">
              ℹ️ <strong>Cash Collections Basis:</strong> This reflects actual customer payment collections minus verified refunds and recorded business expenditures.
              Product-level COGS snapshots will reflect as sold units are processed by the updated backend calculation contract.
            </p>
          </div>
        )}
      </div>

      {/* Cost Breakdown by Category */}
      <div className="card mb-6">
        <div className="section-head">
          <div>
            <h2>Cost Breakdown by Category</h2>
            <p>Visual allocation of inventory sourcing, air freight, customs, packaging, and ads</p>
          </div>
        </div>

        {isBreakdownLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-neutral-100 dark:bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : breakdownList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {breakdownList.map((item) => (
              <div
                key={item.category}
                className="p-3.5 rounded-xl border border-[#DCD6CB] dark:border-white/10 bg-[#F9F6EF] dark:bg-[#1A1D1B] flex flex-col justify-between"
              >
                <div className="flex items-center justify-between gap-2">
                  <strong className="text-sm font-bold text-[#141f17] dark:text-white truncate">
                    {item.category}
                  </strong>
                  <span className="text-xs font-black text-[#26382E] dark:text-[#8FAF9A] bg-white dark:bg-[#222620] px-2 py-0.5 rounded-md border border-[#DCD6CB] dark:border-white/10 shrink-0">
                    {item.percentage}%
                  </span>
                </div>
                <div className="mt-3">
                  <div className="flex items-baseline justify-between text-xs mb-1">
                    <span className="text-[#2E4235] dark:text-[#D2DDD6] font-medium">
                      {item.count} items
                    </span>
                    <strong className="font-bold text-[#141f17] dark:text-white">
                      ৳{Number(item.amount || 0).toLocaleString("en-BD")}
                    </strong>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#DCD6CB]/40 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#26382E] to-[#8FAF9A]"
                      style={{ width: `${Math.min(item.percentage || 0, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#2E4235] dark:text-[#D2DDD6] py-3">
            No category expenses recorded yet.
          </p>
        )}
      </div>

      {/* Main Expenses Table Card */}
      <div className="card">
        {/* Toolbar & Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 pb-4 border-b border-[#DCD6CB] dark:border-white/10 mb-4">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {/* Search */}
            <div className="table-search max-w-sm">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search expense, vendor, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5">
              <Filter size={15} className="text-[#2E4235] dark:text-[#D2DDD6] shrink-0" />
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="py-1.5 px-2.5 text-xs font-bold rounded-lg border border-[#DCD6CB] dark:border-white/10 bg-white dark:bg-[#222620] text-[#141f17] dark:text-white outline-none cursor-pointer"
              >
                <option value="All Categories">All Categories</option>
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <select
              value={dateSort}
              onChange={handleSortChange}
              className="py-1.5 px-2.5 text-xs font-bold rounded-lg border border-[#DCD6CB] dark:border-white/10 bg-white dark:bg-[#222620] text-[#141f17] dark:text-white outline-none cursor-pointer"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="highest">Sort: Highest Amount</option>
              <option value="lowest">Sort: Lowest Amount</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={() => {
                refetchExpenses();
                refetchSummary();
                refetchBreakdown();
              }}
              className="p-1.5 rounded-lg border border-[#DCD6CB] dark:border-white/10 text-[#2E4235] dark:text-[#D2DDD6] hover:bg-neutral-100 dark:hover:bg-white/10 transition cursor-pointer"
              title="Refresh All Sections"
            >
              <RefreshCw size={14} className={isExpensesFetching ? "animate-spin" : ""} />
            </button>
          </div>

          <div className="result-count font-bold text-xs">
            Showing {expensesList.length} of {pagination.total ?? totalRecords} matching records
            {totalRecords > 0 && ` (${totalRecords} total records)`}
          </div>
        </div>

        {/* Expenses Table */}
        <div className="table-wrap relative">
          {isExpensesFetching && !isExpensesLoading && (
            <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-xs flex items-center justify-center z-10">
              <Loader2 size={24} className="animate-spin text-[#8FAF9A]" />
            </div>
          )}
          <table>
            <thead>
              <tr>
                <th>Expense ID</th>
                <th>Description / Title</th>
                <th>Category</th>
                <th>Amount (BDT)</th>
                <th>Date</th>
                <th>Payment Method</th>
                <th>Vendor / Reference</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isExpensesLoading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    <td colSpan={8} className="py-4">
                      <div className="h-6 bg-neutral-100 dark:bg-white/5 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : expensesList.length > 0 ? (
                expensesList.map((exp) => {
                  const expDisplayId = exp.expenseNumber || exp.id || exp._id;
                  const expDate = exp.date ? exp.date.split("T")[0] : "—";
                  return (
                    <tr key={exp._id || expDisplayId} className="hover:bg-[#F3EDE2] dark:hover:bg-[#2A2E2B] transition">
                      <td>
                        <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-[#EEF3EF] dark:bg-[#8FAF9A]/15 text-[#26382E] dark:text-[#8FAF9A] border border-[#DCD6CB] dark:border-white/10">
                          {expDisplayId}
                        </span>
                      </td>
                      <td>
                        <div>
                          <strong className="text-sm font-bold text-[#141f17] dark:text-white block">
                            {exp.title}
                          </strong>
                          {exp.note && (
                            <span className="text-xs text-[#2E4235] dark:text-[#D2DDD6] block mt-0.5 line-clamp-1">
                              {exp.note}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-col gap-1 items-start">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-white dark:bg-[#1A1D1B] border border-[#DCD6CB] dark:border-white/10 text-[#26382E] dark:text-[#D2DDD6]">
                            <Tag size={12} className="text-[#8FAF9A]" />
                            {exp.category}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                              (exp.treatment || exp.expenseType) === "inventory"
                                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                                : "bg-[#EEF3EF] dark:bg-[#8FAF9A]/15 text-[#26382E] dark:text-[#8FAF9A] border border-[#DCD6CB] dark:border-white/10"
                            }`}
                          >
                            {(exp.treatment || exp.expenseType) === "inventory"
                              ? "Inventory / Asset"
                              : "Operating Overhead"}
                          </span>
                        </div>
                      </td>
                      <td>
                        <strong className="text-sm font-black text-red-700 dark:text-red-400">
                          ৳{Number(exp.amount || 0).toLocaleString("en-BD")}
                        </strong>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2E4235] dark:text-[#D2DDD6]">
                          <Calendar size={13} className="text-[#8FAF9A]" />
                          <span>{expDate}</span>
                        </div>
                      </td>
                      <td>
                        <span className="text-xs font-bold text-[#2E4235] dark:text-[#D2DDD6]">
                          {exp.paymentMethod || "Direct"}
                        </span>
                      </td>
                      <td>
                        <span className="text-xs text-[#2E4235] dark:text-[#D2DDD6]">
                          {exp.vendor || "—"}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(exp)}
                            className="p-1.5 rounded-lg border border-[#DCD6CB] dark:border-white/10 text-[#26382E] dark:text-[#8FAF9A] hover:bg-[#EEF3EF] dark:hover:bg-white/10 transition cursor-pointer"
                            title="Edit Expense"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(exp._id || expDisplayId, exp.title)}
                            disabled={isDeleting}
                            className="p-1.5 rounded-lg border border-[#DCD6CB] dark:border-white/10 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
                            title="Delete Expense"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-[#2E4235] dark:text-[#D2DDD6]">
                    <Receipt size={36} className="mx-auto text-[#8FAF9A] mb-2 opacity-60" />
                    <p className="text-sm font-bold">No expense records found matching your filters.</p>
                    <button
                      onClick={handleOpenAdd}
                      className="mt-3 button secondary text-xs font-bold"
                    >
                      + Add New Expense
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-[#DCD6CB] dark:border-white/10 mt-4 text-xs font-bold">
            <div className="text-[#2E4235] dark:text-[#D2DDD6]">
              Page {pagination.page} of {pagination.pages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || isExpensesFetching}
                className="px-3 py-1.5 rounded-lg border border-[#DCD6CB] dark:border-white/10 bg-white dark:bg-[#222620] text-[#141f17] dark:text-white disabled:opacity-40 hover:bg-neutral-50 dark:hover:bg-white/5 transition flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft size={14} />
                <span>Prev</span>
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page >= pagination.pages || isExpensesFetching}
                className="px-3 py-1.5 rounded-lg border border-[#DCD6CB] dark:border-white/10 bg-white dark:bg-[#222620] text-[#141f17] dark:text-white disabled:opacity-40 hover:bg-neutral-50 dark:hover:bg-white/5 transition flex items-center gap-1 cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#222620] p-6 shadow-2xl border border-[#DCD6CB] dark:border-white/10 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCD6CB] dark:border-white/10 mb-4">
              <div>
                <h3 className="text-lg font-black text-[#141f17] dark:text-white">
                  {editingExpense ? "Edit Expense Record" : "Add New Expense"}
                </h3>
                <p className="text-xs text-[#2E4235] dark:text-[#D2DDD6]">
                  Record purchase invoice, air cargo freight, customs or marketing expenditure
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-[#2E4235] dark:text-[#D2DDD6] hover:bg-neutral-100 dark:hover:bg-white/10 rounded-lg transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-xs font-bold text-[#141f17] dark:text-white mb-1">
                  Expense Title / Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DHL Air Cargo freight clearance or dm.de Bulk Serums"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-[#DCD6CB] dark:border-white/10 bg-white dark:bg-[#1A1D1B] text-[#141f17] dark:text-white outline-none focus:border-[#8FAF9A] font-semibold"
                />
              </div>

              {/* Expense Treatment Selector */}
              <div className="p-3 rounded-xl border border-[#DCD6CB] dark:border-white/10 bg-[#FAF7F2] dark:bg-[#1A1D1B]">
                <label className="block text-xs font-bold text-[#141f17] dark:text-white mb-1">
                  Expense Treatment / Accounting Classification *
                </label>
                <select
                  value={formData.treatment}
                  onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-[#DCD6CB] dark:border-white/10 bg-white dark:bg-[#222620] text-[#141f17] dark:text-white outline-none focus:border-[#8FAF9A] font-bold cursor-pointer"
                >
                  <option value="operating">
                    Operating Expense (OpEx — marketing, salaries, rent, general overhead)
                  </option>
                  <option value="inventory">
                    Inventory Purchase / Capitalized Cost (Stock purchases, freight & import duties)
                  </option>
                </select>
                <p className="text-[11px] text-[#2E4235] dark:text-[#D2DDD6] mt-1.5 leading-relaxed">
                  ⚠️ <strong>Important:</strong> Costs already allocated to product &quot;Cost per Unit&quot; must NOT be deducted again as operating expenses. Capitalized inventory costs enter the P&amp;L only when sold via Cost of Goods Sold (COGS).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#141f17] dark:text-white mb-1">
                    Amount in BDT *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 font-bold text-[#26382E] dark:text-[#8FAF9A]">
                      ৳
                    </span>
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      placeholder="e.g. 45000"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full p-2.5 pl-7 text-xs rounded-xl border border-[#DCD6CB] dark:border-white/10 bg-white dark:bg-[#1A1D1B] text-[#141f17] dark:text-white outline-none focus:border-[#8FAF9A] font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#141f17] dark:text-white mb-1">
                    Expense Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-[#DCD6CB] dark:border-white/10 bg-white dark:bg-[#1A1D1B] text-[#141f17] dark:text-white outline-none focus:border-[#8FAF9A] font-bold cursor-pointer"
                  >
                    {categoryOptions.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#141f17] dark:text-white mb-1">
                    Date of Expense *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-[#DCD6CB] dark:border-white/10 bg-white dark:bg-[#1A1D1B] text-[#141f17] dark:text-white outline-none focus:border-[#8FAF9A] font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#141f17] dark:text-white mb-1">
                    Payment Method
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-[#DCD6CB] dark:border-white/10 bg-white dark:bg-[#1A1D1B] text-[#141f17] dark:text-white outline-none focus:border-[#8FAF9A] font-semibold cursor-pointer"
                  >
                    {paymentMethodOptions.map((pm) => (
                      <option key={pm} value={pm}>
                        {pm}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#141f17] dark:text-white mb-1">
                  Vendor / Supplier / Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. DHL Express, dm-drogerie markt, Meta Ads, GreenPack BD"
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-[#DCD6CB] dark:border-white/10 bg-white dark:bg-[#1A1D1B] text-[#141f17] dark:text-white outline-none focus:border-[#8FAF9A] font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#141f17] dark:text-white mb-1">
                  Notes / Invoice Details
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Invoice #DE-9824 clearance fees, tracking #DHL9928"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-[#DCD6CB] dark:border-white/10 bg-white dark:bg-[#1A1D1B] text-[#141f17] dark:text-white outline-none focus:border-[#8FAF9A] font-medium leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#DCD6CB] dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-[#DCD6CB] dark:border-white/10 text-[#2E4235] dark:text-[#D2DDD6] hover:bg-neutral-50 dark:hover:bg-white/10 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-[#26382E] dark:bg-[#8FAF9A] text-white dark:text-[#17251C] hover:bg-[#17251C] transition shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {isCreating || isUpdating ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={15} />
                  )}
                  <span>{editingExpense ? "Update Expense" : "Save Expense Record"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
