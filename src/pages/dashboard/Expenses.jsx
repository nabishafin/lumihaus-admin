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
} from "lucide-react";
import { useAdminUI } from "../../context/AdminUIContext";

const DEFAULT_EXPENSES = [
  {
    id: "EXP-101",
    title: "DHL Express Air Freight (Frankfurt to Dhaka)",
    category: "Shipping & Customs",
    amount: 145000,
    date: "2026-09-12",
    paymentMethod: "Bank Transfer (Wise)",
    vendor: "DHL Express Germany",
    note: "120kg German skincare cargo clearance",
  },
  {
    id: "EXP-102",
    title: "Balea & ISANA Bulk Purchase (dm.de invoice #DE-9824)",
    category: "Product Sourcing",
    amount: 380000,
    date: "2026-09-10",
    paymentMethod: "Credit Card (Euro)",
    vendor: "dm-drogerie markt GmbH",
    note: "Q3 stock replenish for serums and creams",
  },
  {
    id: "EXP-103",
    title: "Meta / Facebook & Instagram Ads (German Glow Campaign)",
    category: "Marketing & Ads",
    amount: 45000,
    date: "2026-09-08",
    paymentMethod: "Credit Card",
    vendor: "Meta Ads Ireland",
    note: "Conversions campaign for Routine Bundles",
  },
  {
    id: "EXP-104",
    title: "Eco-friendly Packaging Boxes & Bubble Wrap Roll",
    category: "Packaging & Supplies",
    amount: 18500,
    date: "2026-09-05",
    paymentMethod: "bKash Merchant",
    vendor: "GreenPack BD Ltd",
    note: "1000 custom printed mailer boxes",
  },
  {
    id: "EXP-105",
    title: "Pathao / Steadfast Courier Bulk Settlement",
    category: "Domestic Courier",
    amount: 32400,
    date: "2026-09-03",
    paymentMethod: "Bank Transfer",
    vendor: "Steadfast Courier",
    note: "Inside & Outside Dhaka delivery fees",
  },
  {
    id: "EXP-106",
    title: "Cloud Server Hosting & Domain Renewal (Vercel + AWS)",
    category: "Software & Hosting",
    amount: 12500,
    date: "2026-09-01",
    paymentMethod: "Credit Card",
    vendor: "Vercel Inc / AWS",
    note: "Annual storefront & admin hosting",
  },
];

const CATEGORIES = [
  "All Categories",
  "Product Sourcing",
  "Shipping & Customs",
  "Marketing & Ads",
  "Packaging & Supplies",
  "Domestic Courier",
  "Software & Hosting",
  "Office & Staff",
  "Miscellaneous",
];

const PAYMENT_METHODS = [
  "Credit Card",
  "Bank Transfer",
  "bKash Merchant",
  "Nagad",
  "Cash",
  "Wise (Euro)",
];

export default function Expenses() {
  const { notify } = useAdminUI();

  // Load from localStorage or default
  const [expenses, setExpenses] = useState(() => {
    try {
      const saved = localStorage.getItem("lumihaus_admin_expenses");
      return saved ? JSON.parse(saved) : DEFAULT_EXPENSES;
    } catch {
      return DEFAULT_EXPENSES;
    }
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("lumihaus_admin_expenses", JSON.stringify(expenses));
    } catch (e) {
      console.error("Failed to save expenses to localStorage:", e);
    }
  }, [expenses]);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [dateSort, setDateSort] = useState("newest");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    category: "Product Sourcing",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    paymentMethod: "Credit Card",
    vendor: "",
    note: "",
  });

  // Calculate Metrics
  const totalExpenseAmount = useMemo(() => {
    return expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [expenses]);

  const currentMonthExpenses = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    return expenses
      .filter((item) => (item.date || "").startsWith(currentMonth))
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [expenses]);

  // Estimated gross revenue from orders / store for net margin calculation
  const estimatedRevenue = 1248000; // ৳12.48L
  const netEstimatedProfit = Math.max(0, estimatedRevenue - totalExpenseAmount);
  const profitMarginPercent =
    estimatedRevenue > 0
      ? ((netEstimatedProfit / estimatedRevenue) * 100).toFixed(1)
      : "0";

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const map = {};
    expenses.forEach((item) => {
      const cat = item.category || "Miscellaneous";
      map[cat] = (map[cat] || 0) + (Number(item.amount) || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  // Filtered List
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((item) => {
        const matchesSearch =
          (item.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.vendor || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.id || "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory =
          selectedCategory === "All Categories" || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (dateSort === "newest") return new Date(b.date) - new Date(a.date);
        if (dateSort === "oldest") return new Date(a.date) - new Date(b.date);
        if (dateSort === "highest") return (b.amount || 0) - (a.amount || 0);
        if (dateSort === "lowest") return (a.amount || 0) - (b.amount || 0);
        return 0;
      });
  }, [expenses, searchQuery, selectedCategory, dateSort]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingExpense(null);
    setFormData({
      title: "",
      category: "Product Sourcing",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      paymentMethod: "Credit Card",
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
      category: item.category || "Product Sourcing",
      amount: item.amount || "",
      date: item.date || new Date().toISOString().split("T")[0],
      paymentMethod: item.paymentMethod || "Credit Card",
      vendor: item.vendor || "",
      note: item.note || "",
    });
    setShowModal(true);
  };

  // Delete Expense
  const handleDelete = (id, title) => {
    if (confirm(`Remove expense record "${title}"?`)) {
      setExpenses((prev) => prev.filter((item) => item.id !== id));
      notify("Expense record removed successfully");
    }
  };

  // Submit Form
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) {
      alert("Please fill in the expense title and amount.");
      return;
    }

    if (editingExpense) {
      setExpenses((prev) =>
        prev.map((item) =>
          item.id === editingExpense.id
            ? {
                ...item,
                title: formData.title,
                category: formData.category,
                amount: Number(formData.amount),
                date: formData.date,
                paymentMethod: formData.paymentMethod,
                vendor: formData.vendor,
                note: formData.note,
              }
            : item
        )
      );
      notify("Expense updated successfully");
    } else {
      const newId = `EXP-${Math.floor(100 + Math.random() * 900)}`;
      const newItem = {
        id: newId,
        title: formData.title,
        category: formData.category,
        amount: Number(formData.amount),
        date: formData.date,
        paymentMethod: formData.paymentMethod,
        vendor: formData.vendor,
        note: formData.note,
      };
      setExpenses((prev) => [newItem, ...prev]);
      notify(`New expense of ৳${Number(formData.amount).toLocaleString()} added`);
    }

    setShowModal(false);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["ID", "Expense Name", "Category", "Amount (BDT)", "Date", "Payment Method", "Vendor", "Notes"];
    const rows = filteredExpenses.map((exp) => [
      exp.id,
      `"${exp.title.replace(/"/g, '""')}"`,
      `"${exp.category}"`,
      exp.amount,
      exp.date,
      `"${exp.paymentMethod || ""}"`,
      `"${exp.vendor || ""}"`,
      `"${(exp.note || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `LumiHaus_Expenses_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify("Expenses report downloaded as CSV");
  };

  return (
    <>
      <title>LumiHaus Admin · Expenses & Cost Tracking</title>

      {/* Page Header */}
      <div className="page-heading">
        <div>
          <span className="page-kicker">FINANCIAL COST MANAGEMENT</span>
          <h2>Expenses & Cost Tracker</h2>
          <p>Record, manage, and calculate all business expenditures, German import freight, packaging, and ads.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="button secondary flex items-center gap-1.5"
            title="Download CSV Report"
          >
            <Download size={15} />
            <span>Export CSV</span>
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

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Expenses */}
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
            <h3 className="text-2xl font-black text-[#141f17] dark:text-white">
              ৳{totalExpenseAmount.toLocaleString("en-BD")}
            </h3>
            <p className="text-xs font-semibold text-[#2E4235] dark:text-[#D2DDD6] mt-1">
              Across {expenses.length} recorded line items
            </p>
          </div>
        </div>

        {/* This Month's Expenses */}
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
            <h3 className="text-2xl font-black text-[#141f17] dark:text-white">
              ৳{currentMonthExpenses.toLocaleString("en-BD")}
            </h3>
            <p className="text-xs font-semibold text-[#2E4235] dark:text-[#D2DDD6] mt-1">
              September 2026 operational cost
            </p>
          </div>
        </div>

        {/* Top Spending Category */}
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
            <h3 className="text-xl font-black text-[#141f17] dark:text-white truncate">
              {categoryBreakdown[0]?.[0] || "None"}
            </h3>
            <p className="text-xs font-semibold text-[#2E4235] dark:text-[#D2DDD6] mt-1">
              ৳{(categoryBreakdown[0]?.[1] || 0).toLocaleString("en-BD")} (
              {totalExpenseAmount > 0
                ? (((categoryBreakdown[0]?.[1] || 0) / totalExpenseAmount) * 100).toFixed(0)
                : 0}
              % of total)
            </p>
          </div>
        </div>

        {/* Net Estimated Profit */}
        <div className="rounded-2xl border-2 border-[#8FAF9A]/40 dark:border-[#8FAF9A]/30 bg-gradient-to-br from-[#EEF3EF] to-white dark:from-[#222620] dark:to-[#1A1D1B] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#26382E] dark:text-[#8FAF9A] uppercase tracking-wide">
              Est. Net Profit
            </span>
            <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-black text-emerald-800 dark:text-emerald-400">
              ৳{netEstimatedProfit.toLocaleString("en-BD")}
            </h3>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-1">
              <ArrowUpRight size={14} />
              <span>~{profitMarginPercent}% Net Margin</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown & Overview Card */}
      <div className="card mb-6">
        <div className="section-head">
          <div>
            <h2>Cost Breakdown by Category</h2>
            <p>Visual allocation of sourcing, air cargo, ad spend and packaging</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {categoryBreakdown.map(([catName, catTotal]) => {
            const percentage =
              totalExpenseAmount > 0 ? ((catTotal / totalExpenseAmount) * 100).toFixed(1) : 0;
            return (
              <div
                key={catName}
                className="p-3.5 rounded-xl border border-[#DCD6CB] dark:border-white/10 bg-[#F9F6EF] dark:bg-[#1A1D1B] flex flex-col justify-between"
              >
                <div className="flex items-center justify-between gap-2">
                  <strong className="text-sm font-bold text-[#141f17] dark:text-white truncate">
                    {catName}
                  </strong>
                  <span className="text-xs font-black text-[#26382E] dark:text-[#8FAF9A] bg-white dark:bg-[#222620] px-2 py-0.5 rounded-md border border-[#DCD6CB] dark:border-white/10 shrink-0">
                    {percentage}%
                  </span>
                </div>
                <div className="mt-3">
                  <div className="flex items-baseline justify-between text-xs mb-1">
                    <span className="text-[#2E4235] dark:text-[#D2DDD6] font-medium">Total Spent</span>
                    <strong className="font-bold text-[#141f17] dark:text-white">
                      ৳{catTotal.toLocaleString("en-BD")}
                    </strong>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#DCD6CB]/40 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#26382E] to-[#8FAF9A]"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Expenses Table Section */}
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
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="py-1.5 px-2.5 text-xs font-bold rounded-lg border border-[#DCD6CB] dark:border-white/10 bg-white dark:bg-[#222620] text-[#141f17] dark:text-white outline-none cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <select
              value={dateSort}
              onChange={(e) => setDateSort(e.target.value)}
              className="py-1.5 px-2.5 text-xs font-bold rounded-lg border border-[#DCD6CB] dark:border-white/10 bg-white dark:bg-[#222620] text-[#141f17] dark:text-white outline-none cursor-pointer"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="highest">Sort: Highest Amount</option>
              <option value="lowest">Sort: Lowest Amount</option>
            </select>
          </div>

          <div className="result-count font-bold">
            Showing {filteredExpenses.length} of {expenses.length} records
          </div>
        </div>

        {/* Expenses Table */}
        <div className="table-wrap">
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
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-[#F3EDE2] dark:hover:bg-[#2A2E2B] transition">
                    <td>
                      <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-[#EEF3EF] dark:bg-[#8FAF9A]/15 text-[#26382E] dark:text-[#8FAF9A] border border-[#DCD6CB] dark:border-white/10">
                        {exp.id}
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
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-white dark:bg-[#1A1D1B] border border-[#DCD6CB] dark:border-white/10 text-[#26382E] dark:text-[#D2DDD6]">
                        <Tag size={12} className="text-[#8FAF9A]" />
                        {exp.category}
                      </span>
                    </td>
                    <td>
                      <strong className="text-sm font-black text-red-700 dark:text-red-400">
                        ৳{Number(exp.amount || 0).toLocaleString("en-BD")}
                      </strong>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2E4235] dark:text-[#D2DDD6]">
                        <Calendar size={13} className="text-[#8FAF9A]" />
                        <span>{exp.date}</span>
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
                          onClick={() => handleDelete(exp.id, exp.title)}
                          className="p-1.5 rounded-lg border border-[#DCD6CB] dark:border-white/10 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
                          title="Delete Expense"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
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
                  Record purchase invoice, air freight, customs or marketing cost
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
                    {CATEGORIES.filter((c) => c !== "All Categories").map((cat) => (
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
                    {PAYMENT_METHODS.map((pm) => (
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
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-[#26382E] dark:bg-[#8FAF9A] text-white dark:text-[#17251C] hover:bg-[#17251C] transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 size={15} />
                  {editingExpense ? "Update Expense" : "Save Expense Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
