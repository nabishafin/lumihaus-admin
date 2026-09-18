import { useState, useMemo, useEffect } from "react";
import {
  Sparkles,
  Scale,
  ShieldCheck,
  RefreshCw,
  Truck,
  Award,
  HelpCircle,
  Clock,
  Eye,
  CheckCircle2,
  Save,
  ArrowLeft,
  LayoutGrid,
  FileEdit,
  RotateCcw,
  Globe,
  ExternalLink,
  BookOpen,
  Copy,
  Check,
  Columns,
  Maximize2,
  FileText,
  AlertCircle,
  ChevronRight,
  Search,
} from "lucide-react";
import { useAdminUI } from "../../context/AdminUIContext";
import confirmToast from "../../utils/confirmToast";

const STORE_PAGE_DEFINITIONS = [
  {
    key: "aboutUs",
    title: "About Lumihaus Germany",
    slug: "about-us",
    Icon: Sparkles,
    desc: "Brand story, German pharmacy direct sourcing mission, air-cargo logistics, and authenticity pledge.",
    category: "Brand Story",
    tagColor: "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/40",
  },
  {
    key: "terms",
    title: "Terms & Conditions",
    slug: "terms-and-conditions",
    Icon: Scale,
    desc: "Customer purchase agreements, BDT pricing, payment rules, and service guidelines.",
    category: "Legal",
    tagColor: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/40",
  },
  {
    key: "privacy",
    title: "Privacy & Data Policy",
    slug: "privacy-policy",
    Icon: ShieldCheck,
    desc: "Customer personal data protection, order processing privacy, and bKash transaction security.",
    category: "Legal",
    tagColor: "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/40",
  },
  {
    key: "returnRefund",
    title: "Return & Refund Policy",
    slug: "return-refund-policy",
    Icon: RefreshCw,
    desc: "48-hour unboxing video claim process, hygiene exclusions, and bKash refund timeline.",
    category: "Customer Service",
    tagColor: "bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/40",
  },
  {
    key: "shippingDelivery",
    title: "Shipping & Delivery Policy",
    slug: "shipping-policy",
    Icon: Truck,
    desc: "Dhaka (24-48h) and nationwide courier delivery timeframes, rates, and Frankfurt air-cargo pre-orders.",
    category: "Logistics",
    tagColor: "bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800/40",
  },
  {
    key: "authenticity",
    title: "Authenticity Guarantee",
    slug: "authenticity-guarantee",
    Icon: Award,
    desc: "100% genuine German retailer sourcing (dm.de, Rossmann), European batch code validation & 10x money-back guarantee.",
    category: "Trust & Safety",
    tagColor: "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/40",
  },
  {
    key: "faq",
    title: "Frequently Asked Questions (FAQ)",
    slug: "faq",
    Icon: HelpCircle,
    desc: "Common customer answers regarding German skincare, bKash payment verification, and custom import requests.",
    category: "Customer Service",
    tagColor: "bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/40",
  },
];

export default function StorePages() {
  const { policyPages, updatePolicyPage, resetPolicyPage } = useAdminUI();

  // Active view: 'all' or specific page key ('aboutUs', 'terms', etc.)
  const [activeView, setActiveView] = useState("all");
  const [editorLayout, setEditorLayout] = useState("split"); // 'split', 'editor', 'preview'
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedSlug, setCopiedSlug] = useState(false);
  const [quickPreviewKey, setQuickPreviewKey] = useState(null);

  // Active page editing form
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });

  // Sync form data when selecting a page
  const handleOpenPage = (key) => {
    setActiveView(key);
    const existing = policyPages[key];
    const def = STORE_PAGE_DEFINITIONS.find((p) => p.key === key);
    setFormData({
      title: existing?.title || def?.title || "",
      content: existing?.content || "",
    });
  };

  // Switch to another page while in editor mode
  const handleSwitchEditorPage = (key) => {
    handleOpenPage(key);
  };

  // Back to All Pages Overview
  const handleBackToAll = () => {
    setActiveView("all");
  };

  // Insert markdown shortcut
  const insertMarkdown = (prefix, suffix = "") => {
    const textarea = document.getElementById("policy-markdown-editor");
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = formData.content;
    const selectedText = currentText.substring(start, end) || "text";
    const replacement = `${prefix}${selectedText}${suffix}`;
    const newContent =
      currentText.substring(0, start) + replacement + currentText.substring(end);

    setFormData({ ...formData, content: newContent });
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 50);
  };

  // Handle Save
  const handleSave = (e) => {
    if (e) e.preventDefault();
    if (activeView === "all") return;
    updatePolicyPage(activeView, formData);
  };

  // Handle Reset to Default
  const handleReset = () => {
    if (activeView === "all") return;
    confirmToast({
      title: "Reset Store Page to Default?",
      message: "Are you sure you want to reset this page to the official default template? Any custom unsaved changes will be overwritten.",
      confirmLabel: "Yes, Reset",
      isDestructive: false,
      onConfirm: () => {
        resetPolicyPage(activeView);
        setTimeout(() => {
          handleOpenPage(activeView);
        }, 50);
      },
    });
  };

  // Word count & read time for active document
  const wordCount = useMemo(() => {
    const text = formData.content || "";
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  }, [formData.content]);

  const readTime = useMemo(() => {
    return Math.max(1, Math.ceil(wordCount / 180));
  }, [wordCount]);

  // Filtered pages for Directory search
  const filteredPages = useMemo(() => {
    return STORE_PAGE_DEFINITIONS.filter((page) => {
      const pageData = policyPages[page.key];
      const title = (pageData?.title || page.title).toLowerCase();
      const desc = page.desc.toLowerCase();
      const cat = page.category.toLowerCase();
      const q = searchTerm.toLowerCase();
      return title.includes(q) || desc.includes(q) || cat.includes(q);
    });
  }, [searchTerm, policyPages]);

  // Active page meta
  const activeDef = STORE_PAGE_DEFINITIONS.find((p) => p.key === activeView);
  const ActiveIcon = activeDef ? activeDef.Icon : FileText;

  // Copy slug URL helper
  const handleCopyUrl = (slug) => {
    const fullUrl = `https://lumihaus.com.bd/pages/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(true);
    setTimeout(() => setCopiedSlug(false), 2000);
  };

  return (
    <>
      <title>LumiHaus Admin · Storefront Pages & Content CMS</title>

      {/* ─────────────────────────────────────────────────────────────
          TOP PAGE HEADER
      ───────────────────────────────────────────────────────────── */}
      <div className="page-heading">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="page-kicker">CONTENT MANAGEMENT SYSTEM</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700/50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Auto-synced with Storefront Footer
            </span>
          </div>
          <h2>Store Pages & Policy CMS</h2>
          <p>
            Create, edit, and publish independent public pages, legal terms, warranty guarantees, and brand stories.
          </p>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-2">
          {activeView !== "all" && (
            <button
              type="button"
              onClick={handleBackToAll}
              className="px-3.5 py-2 rounded-xl border border-[#DCD6CB] dark:border-white/10 bg-white dark:bg-[#222620] text-[#141f17] dark:text-white hover:bg-[#EEF3EF] dark:hover:bg-white/5 transition text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <ArrowLeft size={14} />
              <span>All Pages Hub</span>
            </button>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TOP PAGE SELECTOR PILLS / NAVIGATION TABS
      ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-6 scrollbar-none">
        <button
          type="button"
          onClick={handleBackToAll}
          className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 flex items-center gap-2 transition cursor-pointer border ${
            activeView === "all"
              ? "bg-[#26382E] text-white border-[#26382E] shadow-sm shadow-[#26382E]/20 dark:bg-[#8FAF9A] dark:text-[#17251C] dark:border-[#8FAF9A]"
              : "bg-white dark:bg-[#222620] border-[#DCD6CB] dark:border-white/10 text-[#141f17] dark:text-white hover:bg-[#EEF3EF] dark:hover:bg-white/5"
          }`}
        >
          <LayoutGrid size={15} />
          <span>All Pages Hub ({STORE_PAGE_DEFINITIONS.length})</span>
        </button>

        <div className="h-5 w-[1px] bg-[#DCD6CB] dark:bg-white/10 mx-1 shrink-0" />

        {STORE_PAGE_DEFINITIONS.map((p) => {
          const isSelected = activeView === p.key;
          const IconComp = p.Icon;
          const pageData = policyPages[p.key];
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => handleOpenPage(p.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 flex items-center gap-2 transition cursor-pointer border ${
                isSelected
                  ? "bg-[#26382E] text-white border-[#26382E] shadow-sm shadow-[#26382E]/20 dark:bg-[#8FAF9A] dark:text-[#17251C] dark:border-[#8FAF9A]"
                  : "bg-white dark:bg-[#222620] border-[#DCD6CB] dark:border-white/10 text-[#141f17] dark:text-white hover:bg-[#EEF3EF] dark:hover:bg-white/5"
              }`}
            >
              <IconComp size={14} className={isSelected ? "text-white dark:text-[#17251C]" : "text-[#8FAF9A]"} />
              <span>{pageData?.title || p.title}</span>
            </button>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          VIEW 1: ALL PAGES DIRECTORY / HUB (GRID VIEW)
      ───────────────────────────────────────────────────────────── */}
      {activeView === "all" && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-[#DCD6CB] dark:border-white/10 bg-white dark:bg-[#222620] p-4.5 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#26382E] dark:text-[#8FAF9A] block mb-1">
                Published Pages
              </span>
              <div className="flex items-baseline justify-between">
                <h3 className="text-2xl font-black text-[#141f17] dark:text-white">
                  {STORE_PAGE_DEFINITIONS.length} Public Pages
                </h3>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                  100% Active
                </span>
              </div>
              <p className="text-xs text-[#2E4235] dark:text-[#D2DDD6] mt-1 font-medium">
                Live across customer header, checkout & footer
              </p>
            </div>

            <div className="rounded-2xl border border-[#DCD6CB] dark:border-white/10 bg-white dark:bg-[#222620] p-4.5 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#26382E] dark:text-[#8FAF9A] block mb-1">
                Storefront Sync
              </span>
              <div className="flex items-baseline justify-between">
                <h3 className="text-2xl font-black text-[#141f17] dark:text-white">
                  Real-time
                </h3>
                <span className="text-xs font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                  Auto-updated
                </span>
              </div>
              <p className="text-xs text-[#2E4235] dark:text-[#D2DDD6] mt-1 font-medium">
                Saved changes deploy immediately to web visitors
              </p>
            </div>

            <div className="rounded-2xl border border-[#DCD6CB] dark:border-white/10 bg-white dark:bg-[#222620] p-4.5 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#26382E] dark:text-[#8FAF9A] block mb-1">
                Average Word Count
              </span>
              <div className="flex items-baseline justify-between">
                <h3 className="text-2xl font-black text-[#141f17] dark:text-white">
                  ~165 words
                </h3>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-md">
                  ~1.5 min read
                </span>
              </div>
              <p className="text-xs text-[#2E4235] dark:text-[#D2DDD6] mt-1 font-medium">
                Clear and concise European policy language
              </p>
            </div>

            <div className="rounded-2xl border border-[#DCD6CB] dark:border-white/10 bg-white dark:bg-[#222620] p-4.5 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#26382E] dark:text-[#8FAF9A] block mb-1">
                Trust & Verification
              </span>
              <div className="flex items-baseline justify-between">
                <h3 className="text-2xl font-black text-[#141f17] dark:text-white">
                  German Sourced
                </h3>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                  dm.de Verified
                </span>
              </div>
              <p className="text-xs text-[#2E4235] dark:text-[#D2DDD6] mt-1 font-medium">
                Standard batch code & authenticity protections
              </p>
            </div>
          </div>

          {/* Search & Directory Filter Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#222620] border border-[#DCD6CB] dark:border-white/10 p-4 rounded-2xl shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search pages by title, legal category, or keywords..."
                className="w-full rounded-xl border border-[#DCD6CB] dark:border-white/10 bg-[#F9F6EF] dark:bg-[#1A1D1B] pl-10 pr-4 py-2 text-xs font-medium text-[#141f17] dark:text-white outline-none focus:border-[#8FAF9A]"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-[#2E4235] dark:text-[#D2DDD6] font-semibold">
              <span>Showing {filteredPages.length} of {STORE_PAGE_DEFINITIONS.length} Pages</span>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredPages.map((page) => {
              const pageData = policyPages[page.key];
              const IconComp = page.Icon;
              const content = pageData?.content || "";
              const count = content.trim() ? content.trim().split(/\s+/).length : 0;
              const readMin = Math.max(1, Math.ceil(count / 180));

              return (
                <div
                  key={page.key}
                  className="rounded-2xl border-2 border-[#DCD6CB] dark:border-white/10 bg-white dark:bg-[#222620] p-5.5 flex flex-col justify-between space-y-4 hover:border-[#8FAF9A] dark:hover:border-[#8FAF9A] transition-all group shadow-xs"
                >
                  <div>
                    {/* Top Row: Icon + Category Badge */}
                    <div className="flex items-center justify-between gap-2 mb-3.5">
                      <div className="h-11 w-11 rounded-xl bg-[#EEF3EF] dark:bg-[#8FAF9A]/15 border border-[#8FAF9A]/30 text-[#26382E] dark:text-[#8FAF9A] flex items-center justify-center group-hover:scale-105 transition">
                        <IconComp size={20} />
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${page.tagColor}`}
                        >
                          {page.category}
                        </span>
                      </div>
                    </div>

                    {/* Page Title */}
                    <h3 className="text-base font-black text-[#141f17] dark:text-white group-hover:text-[#26382E] dark:group-hover:text-[#8FAF9A] transition">
                      {pageData?.title || page.title}
                    </h3>

                    {/* Short Description */}
                    <p className="text-xs text-[#2E4235] dark:text-[#D2DDD6] font-medium mt-1 leading-relaxed line-clamp-2">
                      {page.desc}
                    </p>

                    {/* Content Snippet */}
                    <div className="mt-3.5 p-3 rounded-xl bg-[#F9F6EF] dark:bg-[#1A1D1B] border border-[#DCD6CB] dark:border-white/10">
                      <p className="text-[11px] font-mono text-gray-600 dark:text-gray-300 line-clamp-2">
                        {content.replace(/[#*`]/g, "").slice(0, 140)}...
                      </p>
                    </div>
                  </div>

                  {/* Footer Stats & Open Editor Button */}
                  <div className="pt-3 border-t border-[#DCD6CB] dark:border-white/10 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-[#2E4235] dark:text-[#D2DDD6]">
                      <span className="flex items-center gap-1">
                        <FileText size={12} className="text-[#8FAF9A]" />
                        {count} words
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-[#8FAF9A]" />
                        {pageData?.lastUpdated || "September 2026"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setQuickPreviewKey(page.key)}
                        title="Quick View"
                        className="p-2 rounded-xl border border-[#DCD6CB] dark:border-white/10 bg-[#F9F6EF] dark:bg-[#1A1D1B] text-[#141f17] dark:text-white hover:bg-[#EEF3EF] transition cursor-pointer"
                      >
                        <Eye size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenPage(page.key)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#26382E] dark:bg-[#8FAF9A] text-white dark:text-[#17251C] hover:bg-[#17251C] transition text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <FileEdit size={13} />
                        <span>Edit Page</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          VIEW 2: DEDICATED INDIVIDUAL PAGE WORKSPACE / EDITOR
      ───────────────────────────────────────────────────────────── */}
      {activeView !== "all" && activeDef && (
        <div className="space-y-5">
          {/* Breadcrumb & Navigation Ribbon */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#222620] border border-[#DCD6CB] dark:border-white/10 p-4 rounded-2xl shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-[#2E4235] dark:text-[#D2DDD6]">
              <button
                type="button"
                onClick={handleBackToAll}
                className="hover:underline flex items-center gap-1 text-[#26382E] dark:text-[#8FAF9A] cursor-pointer"
              >
                <LayoutGrid size={13} />
                <span>Store Pages Directory</span>
              </button>
              <ChevronRight size={13} className="text-gray-400" />
              <span className="text-[#141f17] dark:text-white font-black">
                {formData.title || activeDef.title}
              </span>
            </div>

            {/* Layout Mode Switcher */}
            <div className="flex items-center gap-1 bg-[#F9F6EF] dark:bg-[#1A1D1B] p-1 rounded-xl border border-[#DCD6CB] dark:border-white/10">
              <button
                type="button"
                onClick={() => setEditorLayout("editor")}
                className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                  editorLayout === "editor"
                    ? "bg-[#26382E] text-white dark:bg-[#8FAF9A] dark:text-[#17251C]"
                    : "text-[#2E4235] dark:text-[#D2DDD6] hover:text-[#141f17]"
                }`}
              >
                <FileEdit size={13} />
                <span>Editor Only</span>
              </button>

              <button
                type="button"
                onClick={() => setEditorLayout("split")}
                className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                  editorLayout === "split"
                    ? "bg-[#26382E] text-white dark:bg-[#8FAF9A] dark:text-[#17251C]"
                    : "text-[#2E4235] dark:text-[#D2DDD6] hover:text-[#141f17]"
                }`}
              >
                <Columns size={13} />
                <span>Split View</span>
              </button>

              <button
                type="button"
                onClick={() => setEditorLayout("preview")}
                className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                  editorLayout === "preview"
                    ? "bg-[#26382E] text-white dark:bg-[#8FAF9A] dark:text-[#17251C]"
                    : "text-[#2E4235] dark:text-[#D2DDD6] hover:text-[#141f17]"
                }`}
              >
                <Eye size={13} />
                <span>Customer Preview</span>
              </button>
            </div>
          </div>

          {/* Main Editing Card */}
          <form
            onSubmit={handleSave}
            className="rounded-2xl border-2 border-[#DCD6CB] dark:border-white/10 bg-white dark:bg-[#222620] p-6 sm:p-7 space-y-6 shadow-xs"
          >
            {/* Document Header Details */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pb-5 border-b border-[#DCD6CB] dark:border-white/10">
              <div className="lg:col-span-7 space-y-3">
                <label className="block text-xs font-black text-[#141f17] dark:text-white uppercase tracking-wider">
                  Customer-Facing Page Title *
                </label>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#EEF3EF] dark:bg-[#8FAF9A]/15 border border-[#8FAF9A]/30 text-[#26382E] dark:text-[#8FAF9A] flex items-center justify-center shrink-0">
                    <ActiveIcon size={20} />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. About Lumihaus Germany"
                    className="w-full rounded-xl border-2 border-[#DCD6CB] dark:border-white/10 bg-[#F9F6EF] dark:bg-[#1A1D1B] px-4 py-2.5 text-sm font-extrabold text-[#141f17] dark:text-white outline-none focus:border-[#8FAF9A]"
                  />
                </div>
              </div>

              <div className="lg:col-span-5 space-y-2">
                <label className="block text-xs font-bold text-[#141f17] dark:text-white uppercase tracking-wider">
                  Public Storefront URL Slug
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F9F6EF] dark:bg-[#1A1D1B] border border-[#DCD6CB] dark:border-white/10 text-xs font-mono text-[#26382E] dark:text-[#D2DDD6] overflow-hidden truncate">
                    <Globe size={13} className="text-[#8FAF9A] shrink-0" />
                    <span className="truncate">lumihaus.com.bd/pages/{activeDef.slug}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(activeDef.slug)}
                    className="p-2 rounded-xl border border-[#DCD6CB] dark:border-white/10 bg-[#F9F6EF] dark:bg-[#1A1D1B] text-[#141f17] dark:text-white hover:bg-[#EEF3EF] transition cursor-pointer shrink-0"
                    title="Copy URL"
                  >
                    {copiedSlug ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Markdown Formatting Helper Toolbar */}
            {editorLayout !== "preview" && (
              <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-[#DCD6CB] dark:border-white/10">
                <span className="text-[11px] font-bold text-[#2E4235] dark:text-[#8FAF9A] uppercase mr-1">
                  Format:
                </span>
                <button
                  type="button"
                  onClick={() => insertMarkdown("## ", "\n")}
                  className="px-2.5 py-1 rounded-lg border border-[#DCD6CB] dark:border-white/10 bg-[#F9F6EF] dark:bg-[#1A1D1B] text-xs font-bold hover:bg-[#EEF3EF] transition cursor-pointer"
                  title="Heading 2"
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("### ", "\n")}
                  className="px-2.5 py-1 rounded-lg border border-[#DCD6CB] dark:border-white/10 bg-[#F9F6EF] dark:bg-[#1A1D1B] text-xs font-bold hover:bg-[#EEF3EF] transition cursor-pointer"
                  title="Heading 3"
                >
                  H3
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("**", "**")}
                  className="px-2.5 py-1 rounded-lg border border-[#DCD6CB] dark:border-white/10 bg-[#F9F6EF] dark:bg-[#1A1D1B] text-xs font-bold hover:bg-[#EEF3EF] transition cursor-pointer font-serif"
                  title="Bold"
                >
                  <b>B</b>
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("*", "*")}
                  className="px-2.5 py-1 rounded-lg border border-[#DCD6CB] dark:border-white/10 bg-[#F9F6EF] dark:bg-[#1A1D1B] text-xs font-bold hover:bg-[#EEF3EF] transition cursor-pointer italic"
                  title="Italic"
                >
                  <i>I</i>
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("- ", "\n")}
                  className="px-2.5 py-1 rounded-lg border border-[#DCD6CB] dark:border-white/10 bg-[#F9F6EF] dark:bg-[#1A1D1B] text-xs font-bold hover:bg-[#EEF3EF] transition cursor-pointer"
                  title="Bullet List"
                >
                  • List
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("1. ", "\n")}
                  className="px-2.5 py-1 rounded-lg border border-[#DCD6CB] dark:border-white/10 bg-[#F9F6EF] dark:bg-[#1A1D1B] text-xs font-bold hover:bg-[#EEF3EF] transition cursor-pointer"
                  title="Numbered List"
                >
                  1. List
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("> ", "\n")}
                  className="px-2.5 py-1 rounded-lg border border-[#DCD6CB] dark:border-white/10 bg-[#F9F6EF] dark:bg-[#1A1D1B] text-xs font-bold hover:bg-[#EEF3EF] transition cursor-pointer"
                  title="Quote Callout"
                >
                  "Quote"
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("\n---\n")}
                  className="px-2.5 py-1 rounded-lg border border-[#DCD6CB] dark:border-white/10 bg-[#F9F6EF] dark:bg-[#1A1D1B] text-xs font-bold hover:bg-[#EEF3EF] transition cursor-pointer"
                  title="Divider Line"
                >
                  Divider
                </button>
              </div>
            )}

            {/* Layout Canvas: Editor / Split / Customer Preview */}
            <div
              className={`grid gap-6 ${
                editorLayout === "split"
                  ? "grid-cols-1 lg:grid-cols-2"
                  : "grid-cols-1"
              }`}
            >
              {/* Left Column: Markdown Editor */}
              {editorLayout !== "preview" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-[#141f17] dark:text-white uppercase tracking-wider">
                      Markdown Body Content
                    </label>
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#2E4235] dark:text-[#D2DDD6]">
                      <span>{wordCount} words</span>
                      <span>•</span>
                      <span>~{readTime} min read</span>
                    </div>
                  </div>

                  <textarea
                    id="policy-markdown-editor"
                    rows={18}
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Write official terms, conditions, return steps, or brand mission in Markdown..."
                    className="w-full rounded-xl border-2 border-[#DCD6CB] dark:border-white/10 bg-[#F9F6EF] dark:bg-[#1A1D1B] p-4.5 font-mono text-xs sm:text-sm leading-relaxed text-[#141f17] dark:text-[#D2DDD6] outline-none focus:border-[#8FAF9A] transition resize-y font-medium min-h-[380px]"
                  />
                </div>
              )}

              {/* Right Column: Customer Storefront Live Preview */}
              {editorLayout !== "editor" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="block text-xs font-bold text-[#141f17] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Eye size={13} className="text-[#8FAF9A]" />
                      Storefront Customer Preview
                    </span>
                    <span className="text-[10px] font-mono text-gray-500">
                      Live Rendered
                    </span>
                  </div>

                  {/* Browser Preview Box */}
                  <div className="rounded-xl border-2 border-[#DCD6CB] dark:border-white/10 bg-[#F9F6EF] dark:bg-[#1A1D1B] overflow-hidden min-h-[380px] flex flex-col">
                    {/* Simulated Browser Bar */}
                    <div className="px-4 py-2.5 bg-[#EEF3EF] dark:bg-[#222620] border-b border-[#DCD6CB] dark:border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                      </div>
                      <span className="text-[11px] font-mono text-gray-500 font-medium">
                        lumihaus.com.bd/pages/{activeDef.slug}
                      </span>
                      <ExternalLink size={12} className="text-gray-400" />
                    </div>

                    {/* Rendered Document Body */}
                    <div className="p-6 sm:p-8 space-y-4 overflow-y-auto max-h-[500px]">
                      <div className="border-b border-[#DCD6CB]/80 dark:border-white/10 pb-4">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#8FAF9A]">
                          Lumihaus Germany · Official Customer Policy
                        </span>
                        <h1 className="text-2xl font-black text-[#141f17] dark:text-white mt-1">
                          {formData.title || activeDef.title}
                        </h1>
                        <p className="text-xs text-gray-500 mt-1">
                          Last Updated: {policyPages[activeView]?.lastUpdated || "September 2026"}
                        </p>
                      </div>

                      <div className="text-sm leading-relaxed text-[#141f17] dark:text-[#D2DDD6] whitespace-pre-line space-y-3 font-normal">
                        {formData.content || (
                          <span className="italic text-gray-400">
                            No body content written yet.
                          </span>
                        )}
                      </div>

                      {/* Storefront Guarantee Footer Stamp */}
                      <div className="mt-8 pt-4 border-t border-[#DCD6CB]/80 dark:border-white/10 flex items-center justify-between text-xs text-gray-500">
                        <span>Lumihaus Bangladesh · 100% Authentic German Sourcing</span>
                        <span>dm-drogerie markt & Rossmann Partner Hub</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Action Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 border-t border-[#DCD6CB] dark:border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#2E4235] dark:text-[#D2DDD6] flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                  Synced automatically across customer storefront & footer
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-xl border border-[#DCD6CB] dark:border-white/10 bg-white dark:bg-[#1A1D1B] text-[#141f17] dark:text-white hover:bg-[#EEF3EF] dark:hover:bg-white/5 transition text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span>Reset to Default Template</span>
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#26382E] dark:bg-[#8FAF9A] text-white dark:text-[#17251C] hover:bg-[#17251C] transition text-xs font-extrabold shadow-md shadow-[#26382E]/20 flex items-center gap-2 cursor-pointer"
                >
                  <Save size={16} />
                  <span>Save & Publish Changes</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          QUICK PREVIEW MODAL
      ───────────────────────────────────────────────────────────── */}
      {quickPreviewKey && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-[#DCD6CB] dark:border-white/10 bg-white dark:bg-[#222620] p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#DCD6CB] dark:border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#8FAF9A]">
                  Storefront Document Preview
                </span>
                <h3 className="text-lg font-black text-[#141f17] dark:text-white">
                  {policyPages[quickPreviewKey]?.title || quickPreviewKey}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setQuickPreviewKey(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 rounded-xl bg-[#F9F6EF] dark:bg-[#1A1D1B] border border-[#DCD6CB] dark:border-white/10 text-xs sm:text-sm whitespace-pre-line leading-relaxed text-[#141f17] dark:text-[#D2DDD6] font-medium">
              {policyPages[quickPreviewKey]?.content}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setQuickPreviewKey(null)}
                className="px-4 py-2 rounded-xl border border-[#DCD6CB] dark:border-white/10 text-xs font-bold text-[#141f17] dark:text-white hover:bg-[#EEF3EF] cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const key = quickPreviewKey;
                  setQuickPreviewKey(null);
                  handleOpenPage(key);
                }}
                className="px-4 py-2 rounded-xl bg-[#26382E] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <FileEdit size={13} />
                <span>Open in Dedicated Editor</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
