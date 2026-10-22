import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  Trash2,
  Edit3,
  Download,
  Calendar,
  TrendingDown,
  TrendingUp,
  Tag,
  Receipt,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  Link2,
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
import { useGetOrdersQuery } from "../../redux/features/orderApi";
import { todayDhaka } from "../../utils/format";

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

// Shared classes for the add/edit expense modal.
const MODAL_LABEL = "block mb-1.5 text-sm font-medium text-[#141f17] dark:text-white";
const MODAL_OPTIONAL = "ml-1 text-xs font-normal text-[#2E4235]/60 dark:text-[#D2DDD6]/60";
const MODAL_HINT = "mt-1.5 text-xs text-[#2E4235]/70 dark:text-[#D2DDD6]/70";
const MODAL_FIELD =
  "w-full px-3 py-2.5 text-sm rounded-xl border border-[#DCD6CB] dark:border-white/10 bg-white dark:bg-[#1A1D1B] text-[#141f17] dark:text-white outline-none focus:border-[#8FAF9A]";

const DEFAULT_PAYMENT_METHODS = [
  "Credit Card",
  "Bank Transfer",
  "bKash Merchant",
  "Nagad",
  "Cash",
  "Wise (Euro)",
];

// Shared classes for the page body.
const CARD = "rounded-xl border border-[#DCD6CB] dark:border-white/10 bg-white dark:bg-[#222620]";
const MUTED_XS = "text-xs text-[#2E4235]/70 dark:text-[#D2DDD6]/70";
const TH =
  "normal-case! tracking-normal! text-xs! font-medium! text-[#2E4235]/70! dark:text-[#D2DDD6]/70! bg-transparent! dark:bg-transparent! border-[#DCD6CB]! dark:border-white/10!";
const FILTER_SELECT =
  "h-9 py-0! pl-3! pr-7! text-sm! rounded-lg! border! border-[#DCD6CB]! dark:border-white/10! bg-white! dark:bg-[#222620]! text-[#141f17]! dark:text-white! outline-none cursor-pointer";
const ICON_BUTTON =
  "h-9 w-9 inline-flex items-center justify-center rounded-lg border border-[#DCD6CB] dark:border-white/10 text-[#2E4235]/70 dark:text-[#D2DDD6]/70 hover:bg-[#F3EDE2] dark:hover:bg-white/10 transition cursor-pointer";
const PAGER_BUTTON =
  "px-3 py-1.5 text-xs rounded-lg border border-[#DCD6CB] dark:border-white/10 bg-white dark:bg-[#222620] text-[#141f17] dark:text-white disabled:opacity-40 hover:bg-[#F9F6EF] dark:hover:bg-white/5 transition flex items-center gap-1 cursor-pointer";

function StatCard({ icon: Icon, label, value, note, loading, negative }) {
  return (
    <div className={`${CARD} px-4 py-4`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-[#2E4235]/70 dark:text-[#D2DDD6]/70 truncate">{label}</span>
        <Icon size={16} className="shrink-0 text-[#2E4235]/60 dark:text-[#D2DDD6]/60" />
      </div>
      {loading ? (
        <div className="h-7 w-28 mt-2 bg-neutral-100 dark:bg-white/10 rounded animate-pulse" />
      ) : (
        <div
          className={`mt-1.5 text-xl font-semibold tabular-nums truncate ${
            negative ? "text-red-600 dark:text-red-400" : "text-[#141f17] dark:text-white"
          }`}
        >
          {value}
        </div>
      )}
      <p className={`m-0 mt-1 truncate ${MUTED_XS}`}>{note}</p>
    </div>
  );
}

export default function Expenses() {
  const { notify } = useAdminUI();

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [dateSort, setDateSort] = useState("newest");
  const [page, setPage] = useState(1);
  const limit = 10;

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
    reportDateRange.from || reportDateRange.to ? reportDateRange : undefined
  );

  // 2. Cost Breakdown Section: GET /admin/expenses/category-breakdown
  const {
    data: breakdownRes,
    isLoading: isBreakdownLoading,
    refetch: refetchBreakdown,
  } = useGetCategoryBreakdownQuery(
    reportDateRange.from || reportDateRange.to ? reportDateRange : undefined
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

  // Search orders for linking
  const [orderSearchTerm, setOrderSearchTerm] = useState("");
  const { data: orderSearchRes, isFetching: isSearchingOrders } = useGetOrdersQuery(
    { search: orderSearchTerm.trim() || undefined, page: 1, limit: 10 },
    { skip: !showModal }
  );
  const searchableOrders = orderSearchRes?.data || [];

  const [formData, setFormData] = useState({
    title: "",
    category: "Product Sourcing",
    treatment: "operating",
    amount: "",
    date: todayDhaka(),
    paymentMethod: "Credit Card",
    vendor: "",
    note: "",
    orderId: null,
  });

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingExpense(null);
    setOrderSearchTerm("");
    setFormData({
      title: "",
      category: categoryOptions[0] || "Product Sourcing",
      treatment: "operating",
      amount: "",
      date: todayDhaka(),
      paymentMethod: paymentMethodOptions[0] || "Credit Card",
      vendor: "",
      note: "",
      orderId: null,
    });
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setEditingExpense(item);
    setOrderSearchTerm("");
    setFormData({
      title: item.title || "",
      category: item.category || categoryOptions[0] || "Product Sourcing",
      treatment: item.treatment || item.expenseType || (item.category === "Product Sourcing" || item.category === "Shipping & Customs" ? "inventory" : "operating"),
      amount: item.amount || "",
      date: item.date ? item.date.split("T")[0] : todayDhaka(),
      paymentMethod: item.paymentMethod || paymentMethodOptions[0] || "Credit Card",
      vendor: item.vendor || "",
      note: item.note || "",
      orderId: item.orderId?._id || item.orderId || null,
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
      orderId: formData.orderId || null,
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
        __BASE_URL__ ||
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
      a.download = `LumiHaus_Expenses_${todayDhaka()}.csv`;
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
  const totalExpensesData = {
    totalExpenses: summaryPayload.totalExpenses ?? 0,
    count: summaryPayload.expenseCount ?? 0,
  };
  const thisMonthData = summaryPayload.thisMonth || {};
  const topCategoryData = summaryPayload.topCategory || {};

  // Canonical profit statement from response.data.profit
  const canonicalProfit = summaryPayload.profit || {};
  const hasCanonicalProfit = Boolean(summaryPayload.profit);

  const netProfitData = {
    ...summaryPayload,
    ...canonicalProfit,
    estimatedNetProfit: hasCanonicalProfit ? canonicalProfit.netProfit : summaryPayload.netProfit,
    netMarginPercentage: hasCanonicalProfit ? canonicalProfit.netMarginPercentage : summaryPayload.netMargin,
    cogs: hasCanonicalProfit ? canonicalProfit.cogs : summaryPayload.cogs,
    operatingExpenses: hasCanonicalProfit ? canonicalProfit.operatingExpenses : summaryPayload.operatingExpenses,
    netSales: hasCanonicalProfit ? canonicalProfit.netSales : summaryPayload.netSales,
    grossProfit: hasCanonicalProfit
      ? (canonicalProfit.netSales != null && canonicalProfit.cogs != null ? canonicalProfit.netSales - canonicalProfit.cogs : null)
      : summaryPayload.grossProfit,
    // Cash view: profit.customerDeliveryCollected is only the delivery-charge
    // share, so collections always come from the cash totals.
    paymentsReceived: summaryPayload.totalCollected,
    refunded: summaryPayload.totalRefunded,
    netRevenue: summaryPayload.netCollections,
    revenueBasis: "collected",
  };
  const breakdownList = breakdownRes?.data?.categories || breakdownRes?.categories || [];

  // Cost indicators from backend
  const hasMissingCosts = Boolean(
    hasCanonicalProfit
      ? (canonicalProfit.isProfitComplete === false || (canonicalProfit.missingCostsCount && canonicalProfit.missingCostsCount > 0) || canonicalProfit.netProfit === null)
      : (netProfitData?.missingCosts ||
        netProfitData?.hasMissingCosts ||
        (netProfitData?.missingCostCount && netProfitData.missingCostCount > 0) ||
        netProfitData?.costStatus === "incomplete")
  );
  const hasCogsData = netProfitData?.cogs !== undefined && netProfitData?.cogs !== null;

  const expensesList = expensesRes?.data?.expenses || expensesRes?.expenses || [];
  const pagination = expensesRes?.data?.pagination || expensesRes?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  };
  const totalRecords = expensesRes?.data?.totalRecords ?? expensesRes?.totalRecords ?? 0;

  const linkedOrder = searchableOrders.find((o) => o._id === formData.orderId);
  const linkedOrderLabel = linkedOrder?.orderNumber
    ? `#${linkedOrder.orderNumber} · ${linkedOrder.customer?.name || "Customer"}`
    : editingExpense?.orderId?.orderNumber
      ? `#${editingExpense.orderId.orderNumber}`
      : `#${formData.orderId}`;

  const statementItems = hasCogsData
    ? [
        { label: "Net sales", value: `৳${Number(netProfitData.netSales || 0).toLocaleString("en-BD")}` },
        { op: "−", label: "COGS", value: `৳${Number(netProfitData.cogs || 0).toLocaleString("en-BD")}` },
        { op: "=", label: "Gross profit", value: `৳${Number(netProfitData.grossProfit || 0).toLocaleString("en-BD")}` },
        { op: "−", label: "Operating costs", value: `৳${Number(netProfitData.operatingExpenses ?? 0).toLocaleString("en-BD")}` },
        {
          op: "=",
          label: "Net profit",
          value: `৳${Number(netProfitData.estimatedNetProfit || 0).toLocaleString("en-BD")}`,
          total: true,
          negative: Number(netProfitData.estimatedNetProfit || 0) < 0,
        },
        {
          label: "Net margin",
          value:
            netProfitData.netMarginPercentage != null && !isNaN(netProfitData.netMarginPercentage)
              ? `${netProfitData.netMarginPercentage}%`
              : netProfitData.netSales > 0 && netProfitData.estimatedNetProfit != null
              ? `${Math.round((netProfitData.estimatedNetProfit / netProfitData.netSales) * 100)}%`
              : "N/A",
        },
      ]
    : [
        { label: "Collections", value: `৳${Number(netProfitData.paymentsReceived || 0).toLocaleString("en-BD")}` },
        { op: "−", label: "Refunds", value: `৳${Number(netProfitData.refunded || 0).toLocaleString("en-BD")}` },
        { op: "=", label: "Net collections", value: `৳${Number(netProfitData.netRevenue || 0).toLocaleString("en-BD")}` },
        { op: "−", label: "Expenses", value: `৳${Number(totalExpensesData.totalExpenses || 0).toLocaleString("en-BD")}` },
        {
          op: "=",
          label: "Cash position",
          value: `৳${Number(netProfitData.cashNetProfit ?? 0).toLocaleString("en-BD")}`,
          total: true,
          negative: Number(netProfitData.cashNetProfit ?? 0) < 0,
        },
      ];

  const netProfitValue = Number(netProfitData.estimatedNetProfit || 0);

  return (
    <>
      <title>LumiHaus Admin · Expenses & Cost Tracking</title>

      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <h2>Expenses</h2>
          <p>Track costs and your cash position.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="button secondary"
            title="Download CSV"
          >
            {isExporting ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
            <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
          </button>
          <button onClick={handleOpenAdd} className="button">
            <Plus size={16} />
            <span>Add expense</span>
          </button>
        </div>
      </div>

      {/* Missing Costs Warning */}
      {hasMissingCosts && (
        <div
          role="status"
          className="mb-5 flex items-start gap-2.5 rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="m-0 text-amber-900 dark:text-amber-200">
            <span className="font-medium">Profit is incomplete.</span>{" "}
            Some sold products have no purchase cost — add it in Products to see final profit.
          </p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard icon={TrendingDown} label="Total expenses" loading={isSummaryLoading}
          value={`৳${Number(totalExpensesData.totalExpenses || 0).toLocaleString("en-BD")}`}
          note={`${totalExpensesData.count ?? 0} entries`}
        />
        <StatCard icon={Calendar} label="This month" loading={isSummaryLoading}
          value={`৳${Number(thisMonthData.totalExpenses || 0).toLocaleString("en-BD")}`}
          note={`${thisMonthData.label || "Current month"} · ${thisMonthData.count ?? 0} entries`}
        />
        <StatCard icon={Tag} label="Top category" loading={isSummaryLoading}
          value={topCategoryData.category || "None"}
          note={
            topCategoryData.category
              ? `৳${Number(topCategoryData.amount || 0).toLocaleString("en-BD")} · ${topCategoryData.percentage ?? 0}% of total`
              : "No expenses yet"
          }
        />
        <StatCard
          icon={TrendingUp}
          label={hasMissingCosts ? "Net profit (cost missing)" : hasCogsData ? "Net profit" : "Est. net position"}
          loading={isSummaryLoading}
          value={hasMissingCosts ? "Cost missing" : `৳${Number(netProfitData.estimatedNetProfit ?? 0).toLocaleString("en-BD")}`}
          negative={!hasMissingCosts && netProfitValue < 0}
          note={`${
            !hasMissingCosts && netProfitData.netMarginPercentage !== null && netProfitData.netMarginPercentage !== undefined
              ? `~${netProfitData.netMarginPercentage}% margin`
              : "Margin N/A"
          } · ${
            hasCogsData
              ? "Gross − OpEx"
              : netProfitData.revenueBasis === "collected"
              ? "Cash basis"
              : "Collections basis"
          }`}
        />
      </div>

      {/* Financial Statement */}
      <section className={`${CARD} px-5 py-4 mb-5`}>
        <div className="flex items-baseline justify-between gap-3 mb-3">
          <h3 className="m-0 text-sm font-semibold text-[#141f17] dark:text-white">
            {hasCogsData ? "Profit statement" : "Cash statement"}
          </h3>
          <span className={MUTED_XS}>{hasCogsData ? "Accrual basis" : "Cash basis"}</span>
        </div>
        <dl
          className={`m-0 grid grid-cols-1 divide-y divide-[#DCD6CB] dark:divide-white/10 lg:divide-y-0 lg:divide-x ${
            hasCogsData ? "lg:grid-cols-6" : "lg:grid-cols-5"
          }`}
        >
          {statementItems.map((item) => (
            <div
              key={item.label}
              className="flex items-baseline justify-between gap-3 py-2.5 lg:block lg:py-1 lg:px-4 lg:first:pl-0"
            >
              <dt className={`${MUTED_XS} whitespace-nowrap`}>
                {item.op && <span className="mr-1">{item.op}</span>}
                {item.label}
              </dt>
              <dd
                className={`m-0 lg:mt-1 tabular-nums ${
                  item.total ? "text-base font-semibold" : "text-sm"
                } ${
                  item.negative ? "text-red-600 dark:text-red-400" : "text-[#141f17] dark:text-white"
                }`}
              >
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Cost Breakdown by Category */}
      <section className={`${CARD} p-5 mb-5`}>
        <h3 className="m-0 mb-3 text-sm font-semibold text-[#141f17] dark:text-white">By category</h3>

        {isBreakdownLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[72px] bg-neutral-100 dark:bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : breakdownList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {breakdownList.map((item) => (
              <div
                key={item.category}
                className="p-3 rounded-lg border border-[#DCD6CB] dark:border-white/10"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm text-[#141f17] dark:text-white truncate">{item.category}</span>
                  <span className={`${MUTED_XS} shrink-0 tabular-nums`}>{item.percentage}%</span>
                </div>
                <div className="mt-1 flex items-baseline justify-between gap-2">
                  <span className="text-sm font-medium text-[#141f17] dark:text-white tabular-nums">
                    ৳{Number(item.amount || 0).toLocaleString("en-BD")}
                  </span>
                  <span className={MUTED_XS}>{item.count} items</span>
                </div>
                <div className="mt-2 h-1 w-full rounded-full bg-[#DCD6CB]/50 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#26382E] dark:bg-[#8FAF9A]"
                    style={{ width: `${Math.min(item.percentage || 0, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={`${MUTED_XS} m-0 py-2`}>No expenses recorded yet.</p>
        )}
      </section>

      {/* Main Expenses Table */}
      <section className={`${CARD} p-4 sm:p-5`}>
        {/* Toolbar & Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <div className="table-search max-w-sm">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search expense, vendor, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              aria-label="Category"
              className={FILTER_SELECT}
            >
              <option value="All Categories">All categories</option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={dateSort}
              onChange={handleSortChange}
              aria-label="Sort"
              className={FILTER_SELECT}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="highest">Highest amount</option>
              <option value="lowest">Lowest amount</option>
            </select>

            <button
              onClick={() => {
                refetchExpenses();
                refetchSummary();
                refetchBreakdown();
              }}
              className={ICON_BUTTON}
              title="Refresh"
              aria-label="Refresh"
            >
              <RefreshCw size={15} className={isExpensesFetching ? "animate-spin" : ""} />
            </button>
          </div>

          <div className={`${MUTED_XS} whitespace-nowrap`}>
            Showing {expensesList.length} of {pagination.total ?? totalRecords}
            {totalRecords > 0 && ` · ${totalRecords} total`}
          </div>
        </div>

        {/* Expenses Table */}
        <div className="table-wrap relative -mx-4 sm:-mx-5 border-t border-[#DCD6CB] dark:border-white/10">
          {isExpensesFetching && !isExpensesLoading && (
            <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-xs flex items-center justify-center z-10">
              <Loader2 size={22} className="animate-spin text-[#2E4235]/60 dark:text-[#D2DDD6]/60" />
            </div>
          )}
          <table className="[&_td]:border-[#ECE7DE]! dark:[&_td]:border-white/10!">
            <thead>
              <tr>
                <th className={TH}>ID</th>
                <th className={TH}>Expense</th>
                <th className={TH}>Category</th>
                <th className={TH}>Order</th>
                <th className={TH}>Amount</th>
                <th className={TH}>Date</th>
                <th className={TH}>Paid with</th>
                <th className={TH}>Vendor</th>
                <th className={`${TH} text-right!`}>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {isExpensesLoading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    <td colSpan={9} className="py-4">
                      <div className="h-5 bg-neutral-100 dark:bg-white/5 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : expensesList.length > 0 ? (
                expensesList.map((exp) => {
                  const expDisplayId = exp.expenseNumber || exp.id || exp._id;
                  const expDate = exp.date ? exp.date.split("T")[0] : "—";
                  const linkedOrderNum =
                    typeof exp.orderId === "object" && exp.orderId !== null
                      ? exp.orderId.orderNumber || exp.orderId._id
                      : exp.orderId;

                  return (
                    <tr key={exp._id || expDisplayId} className="hover:bg-[#F9F6EF] dark:hover:bg-white/5 transition">
                      <td>
                        <span className={`font-mono ${MUTED_XS}`}>{expDisplayId}</span>
                      </td>
                      <td>
                        <span className="block text-sm font-medium text-[#141f17] dark:text-white">
                          {exp.title}
                        </span>
                        {exp.note && (
                          <span className={`block mt-0.5 line-clamp-1 max-w-xs whitespace-normal ${MUTED_XS}`}>
                            {exp.note}
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="block text-sm text-[#141f17] dark:text-white">{exp.category}</span>
                        <span className={`block mt-0.5 ${MUTED_XS}`}>
                          {(exp.treatment || exp.expenseType) === "inventory" ? "Inventory" : "Operating"}
                        </span>
                      </td>
                      <td>
                        {linkedOrderNum ? (
                          <span className="inline-flex items-center gap-1 font-mono text-xs text-[#141f17] dark:text-white">
                            <Link2 size={12} className="text-[#2E4235]/60 dark:text-[#D2DDD6]/60" />
                            #{linkedOrderNum}
                          </span>
                        ) : (
                          <span className="text-xs text-[#2E4235]/40 dark:text-[#D2DDD6]/40">—</span>
                        )}
                      </td>
                      <td>
                        <span className="text-sm font-medium tabular-nums text-[#141f17] dark:text-white">
                          ৳{Number(exp.amount || 0).toLocaleString("en-BD")}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm tabular-nums text-[#2E4235]/70 dark:text-[#D2DDD6]/70">{expDate}</span>
                      </td>
                      <td>
                        <span className="text-sm text-[#2E4235]/70 dark:text-[#D2DDD6]/70">
                          {exp.paymentMethod || "Direct"}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm text-[#2E4235]/70 dark:text-[#D2DDD6]/70">
                          {exp.vendor || "—"}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(exp)}
                            className="p-1.5 rounded-lg text-[#2E4235]/70 dark:text-[#D2DDD6]/70 hover:text-[#141f17] dark:hover:text-white hover:bg-[#F3EDE2] dark:hover:bg-white/10 transition cursor-pointer"
                            title="Edit"
                            aria-label="Edit expense"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(exp._id || expDisplayId, exp.title)}
                            disabled={isDeleting}
                            className="p-1.5 rounded-lg text-[#2E4235]/70 dark:text-[#D2DDD6]/70 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
                            title="Delete"
                            aria-label="Delete expense"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="text-center py-12">
                    <Receipt size={28} className="mx-auto mb-2 text-[#2E4235]/40 dark:text-[#D2DDD6]/40" />
                    <p className="m-0 text-sm text-[#2E4235]/70 dark:text-[#D2DDD6]/70">No expenses found.</p>
                    <button onClick={handleOpenAdd} className="mt-3 button secondary">
                      <Plus size={15} />
                      <span>Add expense</span>
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-[#DCD6CB] dark:border-white/10 -mx-4 sm:-mx-5 px-4 sm:px-5">
            <div className={MUTED_XS}>
              Page {pagination.page} of {pagination.pages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || isExpensesFetching}
                className={PAGER_BUTTON}
              >
                <ChevronLeft size={14} />
                <span>Prev</span>
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page >= pagination.pages || isExpensesFetching}
                className={PAGER_BUTTON}
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Add / Edit Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-[#222620] shadow-2xl border border-[#DCD6CB] dark:border-white/10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#DCD6CB] dark:border-white/10">
              <h3 className="text-base font-semibold text-[#141f17] dark:text-white">
                {editingExpense ? "Edit expense" : "Add expense"}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                aria-label="Close"
                className="p-1.5 text-[#2E4235] dark:text-[#D2DDD6] hover:bg-neutral-100 dark:hover:bg-white/10 rounded-lg transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                <div>
                  <label className={MODAL_LABEL}>Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DHL air cargo clearance"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={MODAL_FIELD}
                  />
                </div>

                <div>
                  <label className={MODAL_LABEL}>Type</label>
                  <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#F3EDE2] dark:bg-[#1A1D1B]" role="group">
                    {[
                      ["operating", "Operating"],
                      ["inventory", "Inventory"],
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={formData.treatment === value}
                        onClick={() => setFormData({ ...formData, treatment: value })}
                        className={`py-2 text-sm rounded-lg transition cursor-pointer ${
                          formData.treatment === value
                            ? "bg-white dark:bg-[#2A2E2B] text-[#141f17] dark:text-white font-medium shadow-sm"
                            : "text-[#2E4235] dark:text-[#D2DDD6] hover:text-[#141f17] dark:hover:text-white"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <p className={MODAL_HINT}>
                    {formData.treatment === "inventory"
                      ? "Stock, freight and import duties. Counted in profit only when the product sells."
                      : "Marketing, salaries, rent and other running costs."}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={MODAL_LABEL}>Amount</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#2E4235] dark:text-[#D2DDD6]">৳</span>
                      <input
                        type="number"
                        required
                        min="1"
                        step="any"
                        placeholder="0"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        className={`${MODAL_FIELD} pl-7`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={MODAL_LABEL}>Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className={`${MODAL_FIELD} cursor-pointer`}
                    >
                      {categoryOptions.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={MODAL_LABEL}>Date</label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className={MODAL_FIELD}
                    />
                  </div>
                  <div>
                    <label className={MODAL_LABEL}>Paid with</label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className={`${MODAL_FIELD} cursor-pointer`}
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
                  <label className={MODAL_LABEL}>
                    Vendor <span className={MODAL_OPTIONAL}>optional</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DHL Express"
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                    className={MODAL_FIELD}
                  />
                </div>

                <div>
                  <label className={MODAL_LABEL}>
                    Notes <span className={MODAL_OPTIONAL}>optional</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Invoice or tracking number"
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    className={`${MODAL_FIELD} resize-y`}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className={MODAL_LABEL}>
                      Linked order <span className={MODAL_OPTIONAL}>optional</span>
                    </label>
                    {formData.orderId && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, orderId: null })}
                        className="mb-1.5 text-xs text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                      >
                        Unlink
                      </button>
                    )}
                  </div>

                  {formData.orderId ? (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#EEF3EF] dark:bg-white/5 text-sm text-[#141f17] dark:text-white">
                      <Link2 size={14} className="text-[#26382E] dark:text-[#8FAF9A]" />
                      <span>{linkedOrderLabel}</span>
                    </div>
                  ) : (
                    <>
                      <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2E4235]/60 dark:text-[#D2DDD6]/60" />
                        <input
                          type="text"
                          placeholder="Search order #, name or phone"
                          value={orderSearchTerm}
                          onChange={(e) => setOrderSearchTerm(e.target.value)}
                          className={`${MODAL_FIELD} pl-8`}
                        />
                      </div>
                      {orderSearchTerm.trim() && (
                        <div className="mt-1.5 max-h-36 overflow-y-auto border border-[#DCD6CB] dark:border-white/10 rounded-xl p-1 bg-white dark:bg-[#222620]">
                          {isSearchingOrders ? (
                            <div className="p-2 text-center text-xs text-[#2E4235]/60 dark:text-[#D2DDD6]/60">Searching...</div>
                          ) : searchableOrders.length > 0 ? (
                            searchableOrders.map((ord) => (
                              <button
                                key={ord._id}
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, orderId: ord._id });
                                  setOrderSearchTerm("");
                                }}
                                className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-[#EEF3EF] dark:hover:bg-white/5 flex items-center justify-between text-sm cursor-pointer"
                              >
                                <span className="text-[#141f17] dark:text-white">
                                  #{ord.orderNumber} · {ord.customer?.name || ord.customer?.phone || "Customer"}
                                </span>
                                <span className="text-[#2E4235] dark:text-[#D2DDD6]">৳{Number(ord.total ?? 0).toLocaleString("en-BD")}</span>
                              </button>
                            ))
                          ) : (
                            <div className="p-2 text-center text-xs text-[#2E4235]/60 dark:text-[#D2DDD6]/60">No matching orders</div>
                          )}
                        </div>
                      )}
                      <p className={MODAL_HINT}>Link courier bills to their order.</p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2.5 px-6 py-4 border-t border-[#DCD6CB] dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm rounded-xl border border-[#DCD6CB] dark:border-white/10 text-[#2E4235] dark:text-[#D2DDD6] hover:bg-neutral-50 dark:hover:bg-white/10 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-5 py-2 text-sm font-medium rounded-xl bg-[#26382E] dark:bg-[#8FAF9A] text-white dark:text-[#17251C] hover:bg-[#17251C] transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {(isCreating || isUpdating) && <Loader2 size={15} className="animate-spin" />}
                  <span>{editingExpense ? "Save changes" : "Save expense"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
