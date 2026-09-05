import { useState } from "react";
import toast from "react-hot-toast";
import {
  BarChart3,
  TrendingUp,
  Download,
  FileSpreadsheet,
  Calendar,
  DollarSign,
  Package,
  ShoppingBag,
  Users,
  Plane,
  ShieldCheck,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
} from "lucide-react";

export default function Reports() {
  const [timeRange, setTimeRange] = useState("30days");

  const reportsList = [
    {
      title: "Monthly Sales & Revenue Report",
      desc: "Breakdown of gross sales, bKash vs COD payment shares, product margins, and active discounts.",
      format: "sales_revenue_2026.xlsx",
      icon: "📈",
      badge: "Updated Daily",
      type: "Financial",
    },
    {
      title: "German Inventory & Low Stock Audit",
      desc: "Stock volume for Balea, Catrice, Penaten, re-order thresholds, and warehouse valuation in Dhaka.",
      format: "german_inventory_audit_2026.xlsx",
      icon: "📦",
      badge: "Real-time",
      type: "Inventory",
    },
    {
      title: "Customer Retention & VIP Buyers",
      desc: "Repeat purchase rates, top spenders in Dhaka & nationwide, and customer lifetime value (LTV).",
      format: "vip_customers_analytics_2026.xlsx",
      icon: "👥",
      badge: "Monthly",
      type: "CRM",
    },
    {
      title: "Frankfurt Air Freight Transit Audit",
      desc: "Flight schedules, customs clearance logs at Dhaka airport, and pre-order delivery cycle duration.",
      format: "air_freight_transit_2026.xlsx",
      icon: "✈️",
      badge: "Weekly",
      type: "Logistics",
    },
  ];

  const handleExportExcel = (reportName) => {
    toast.success(`Exporting ${reportName} to Excel (.xlsx)...`);
  };

  const handleExportPDF = (title) => {
    toast.success(`Generating official PDF summary for ${title}...`);
  };

  return (
    <div className="space-y-6 pb-12 max-w-[1400px]">
      <title>Lumihaus Admin · Reports & Analytics</title>

      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-2 border-gray-200 dark:border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase tracking-wider text-[#912d45] dark:text-[#ffc4c7] bg-[#ffc4c7]/25 dark:bg-[#ffc4c7]/15 px-2.5 py-0.5 rounded-md border border-[#ffc4c7]/40">
              Analytics Hub
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Reports & Business Intelligence
          </h1>
          <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-zinc-300 mt-1">
            Export financial audits, track sales channels, and analyze German air-freight import performance.
          </p>
        </div>

        {/* Timeframe Filter */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border-2 border-gray-200 dark:border-white/15 bg-white dark:bg-[#251e23] px-3 py-1.5 shadow-sm">
            <Calendar size={15} className="text-[#c2546f] dark:text-[#ffc4c7]" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-transparent text-xs font-bold text-gray-900 dark:text-white outline-none cursor-pointer pr-1"
            >
              <option value="today" className="dark:bg-[#1e191c]">Today</option>
              <option value="7days" className="dark:bg-[#1e191c]">Last 7 Days</option>
              <option value="30days" className="dark:bg-[#1e191c]">Last 30 Days</option>
              <option value="ytd" className="dark:bg-[#1e191c]">Year-to-Date (2026)</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border-2 border-gray-200 dark:border-white/10 bg-white dark:bg-[#251e23] p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wide">Gross Revenue</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <DollarSign size={18} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">৳ 1,845,200</h3>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              <ArrowUpRight size={14} />
              <span>+18.4% vs last period</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border-2 border-gray-200 dark:border-white/10 bg-white dark:bg-[#251e23] p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wide">Delivered Orders</span>
            <div className="h-9 w-9 rounded-xl bg-rose-50 dark:bg-[#ffc4c7]/10 border border-[#ffc4c7]/30 flex items-center justify-center text-[#c2546f] dark:text-[#ffc4c7]">
              <ShoppingBag size={18} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">642</h3>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              <ArrowUpRight size={14} />
              <span>+12.6% growth</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border-2 border-gray-200 dark:border-white/10 bg-white dark:bg-[#251e23] p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wide">Pre-Order Requests</span>
            <div className="h-9 w-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Plane size={18} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">89 Requests</h3>
            <div className="flex items-center gap-1 text-xs font-bold text-gray-500 dark:text-zinc-400 mt-1">
              <span>৳ 348,000 custom quotes</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border-2 border-gray-200 dark:border-white/10 bg-white dark:bg-[#251e23] p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wide">bKash vs COD Ratio</span>
            <div className="h-9 w-9 rounded-xl bg-pink-50 dark:bg-pink-950/60 border border-pink-200 dark:border-pink-800 flex items-center justify-center text-pink-600 dark:text-pink-400">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">68% bKash</h3>
            <div className="flex items-center gap-1 text-xs font-bold text-gray-500 dark:text-zinc-400 mt-1">
              <span>32% Cash on Delivery</span>
            </div>
          </div>
        </div>
      </div>

      {/* Exportable Audit Reports */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-gray-900 dark:text-white">
            Available Export Reports
          </h2>
          <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400">
            One-click Excel & PDF export
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {reportsList.map((report, idx) => (
            <div
              key={idx}
              className="rounded-2xl border-2 border-gray-200 dark:border-white/10 bg-white dark:bg-[#251e23] p-6 flex flex-col justify-between space-y-5 shadow-sm hover:border-[#ffc4c7]/60 transition-all duration-200"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{report.icon}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-300 bg-gray-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md">
                      {report.type}
                    </span>
                    <span className="text-xs font-black text-[#912d45] dark:text-[#ffc4c7] bg-[#ffc4c7]/20 border border-[#ffc4c7]/40 px-3 py-1 rounded-full">
                      {report.badge}
                    </span>
                  </div>
                </div>
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                  {report.title}
                </h3>
                <p className="text-xs font-medium text-gray-600 dark:text-zinc-300 mt-2 leading-relaxed">
                  {report.desc}
                </p>
              </div>

              <div className="flex items-center gap-2.5 pt-4 border-t-2 border-gray-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => handleExportExcel(report.format)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 border border-gray-300 dark:border-zinc-700 px-3 py-2.5 text-xs font-bold text-gray-900 dark:text-white transition cursor-pointer active:scale-98"
                >
                  <FileSpreadsheet size={16} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Excel (.xlsx)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExportPDF(report.title)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#ffc4c7]/15 hover:bg-[#ffc4c7]/25 border border-[#ffc4c7]/40 px-3 py-2.5 text-xs font-bold text-[#912d45] dark:text-[#ffc4c7] transition cursor-pointer active:scale-98"
                >
                  <Download size={16} className="text-[#c2546f] dark:text-[#ffc4c7]" />
                  <span>PDF Document</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
