import { useState, useEffect, useMemo } from "react";
import { useParams, useLocation, Link } from "react-router";
import {
  Sparkles,
  Scale,
  ShieldCheck,
  RefreshCw,
  Truck,
  Award,
  BookOpen,
  HelpCircle,
  Save,
  RotateCcw,
  Eye,
  FileText,
  CheckCircle2,
  Globe,
  Copy,
  Check,
  Clock,
  ExternalLink,
} from "lucide-react";
import { useAdminUI } from "../../context/AdminUIContext";

const PAGE_CONFIGS = {
  "about-us": {
    key: "aboutUs",
    name: "About Us Page",
    defaultTitle: "About Lumihaus Germany",
    slug: "about-us",
    Icon: BookOpen,
    kicker: "BRAND STORY & MISSION",
    desc: "Brand story, German pharmacy sourcing mission, air-cargo logistics, and authenticity promise.",
  },
  terms: {
    key: "terms",
    name: "Terms & Conditions",
    defaultTitle: "Terms & Conditions",
    slug: "terms-and-conditions",
    Icon: Scale,
    kicker: "LEGAL POLICIES",
    desc: "Customer purchase agreements, BDT pricing rules, and service guidelines.",
  },
  privacy: {
    key: "privacy",
    name: "Privacy & Data Policy",
    defaultTitle: "Privacy & Data Protection Policy",
    slug: "privacy-policy",
    Icon: ShieldCheck,
    kicker: "LEGAL POLICIES",
    desc: "Customer data protection, order privacy, and bKash transaction security.",
  },
  refund: {
    key: "returnRefund",
    name: "Return & Refund Policy",
    defaultTitle: "Return, Replacement & Refund Policy",
    slug: "return-refund-policy",
    Icon: RefreshCw,
    kicker: "CUSTOMER SERVICE",
    desc: "48-hour unboxing video claims, hygiene exclusions, and refund timeline.",
  },
  shipping: {
    key: "shippingDelivery",
    name: "Shipping & Delivery Policy",
    defaultTitle: "Shipping & Delivery Policy",
    slug: "shipping-policy",
    Icon: Truck,
    kicker: "LOGISTICS & COURIER",
    desc: "Dhaka (24-48h) and nationwide courier delivery timeframes and Frankfurt air freight.",
  },
  authenticity: {
    key: "authenticity",
    name: "Authenticity Guarantee",
    defaultTitle: "100% German Authenticity Guarantee",
    slug: "authenticity-guarantee",
    Icon: Award,
    kicker: "TRUST & SAFETY",
    desc: "100% genuine German retailer sourcing (dm.de, Rossmann) and batch code verification.",
  },
  faq: {
    key: "faq",
    name: "Frequently Asked Questions (FAQ)",
    defaultTitle: "Frequently Asked Questions (FAQ)",
    slug: "faq",
    Icon: HelpCircle,
    kicker: "CUSTOMER SERVICE",
    desc: "Common customer answers regarding skincare, bKash payments, and custom German pre-orders.",
  },
};

export default function StorePageEditor() {
  const { pageSlug } = useParams();
  const location = useLocation();
  const { policyPages, updatePolicyPage, resetPolicyPage } = useAdminUI();

  // Determine current page slug from params or URL path
  const currentSlug = useMemo(() => {
    if (pageSlug && PAGE_CONFIGS[pageSlug]) return pageSlug;
    const path = location.pathname.replace(/^\/pages\/?/, "");
    if (PAGE_CONFIGS[path]) return path;
    return "about-us";
  }, [pageSlug, location.pathname]);

  const config = PAGE_CONFIGS[currentSlug] || PAGE_CONFIGS["about-us"];
  const pageKey = config.key;
  const ActiveIcon = config.Icon;

  const [previewMode, setPreviewMode] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });

  // Sync state whenever route or context changes
  useEffect(() => {
    const existing = policyPages[pageKey];
    setFormData({
      title: existing?.title || config.defaultTitle,
      content: existing?.content || "",
    });
    setPreviewMode(false);
  }, [currentSlug, pageKey, policyPages]);

  // Word count & read time
  const wordCount = useMemo(() => {
    const text = formData.content || "";
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  }, [formData.content]);

  const readTime = useMemo(() => {
    return Math.max(1, Math.ceil(wordCount / 180));
  }, [wordCount]);

  // Handle Save
  const handleSave = (e) => {
    e.preventDefault();
    updatePolicyPage(pageKey, formData);
  };

  // Handle Reset
  const handleReset = () => {
    if (
      window.confirm(
        `Reset "${config.name}" to the official default template? Any unsaved edits will be replaced.`
      )
    ) {
      resetPolicyPage(pageKey);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(`https://lumihaus.com.bd/pages/${config.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Markdown shortcut helper
  const insertMarkdown = (prefix, suffix = "") => {
    const textarea = document.getElementById("store-page-textarea");
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = formData.content;
    const selected = current.substring(start, end) || "text";
    const replacement = `${prefix}${selected}${suffix}`;
    const next = current.substring(0, start) + replacement + current.substring(end);
    setFormData({ ...formData, content: next });
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selected.length
      );
    }, 50);
  };

  return (
    <>
      <title>Lumihaus Admin · {config.name}</title>

      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <span className="page-kicker">{config.kicker}</span>
          <h2>{config.name}</h2>
          <p>{config.desc}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700/50 px-3.5 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live on Storefront
          </span>
        </div>
      </div>

      {/* Editor Form Card */}
      <form
        onSubmit={handleSave}
        className="rounded-2xl border-2 border-[#DCD6CB] dark:border-white/10 bg-white dark:bg-[#222620] p-6 sm:p-7 space-y-6 shadow-xs max-w-5xl"
      >
        {/* Top Header: Title & URL Slug */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pb-5 border-b border-[#DCD6CB] dark:border-white/10">
          <div className="md:col-span-7 space-y-2">
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
                className="w-full rounded-xl border-2 border-[#DCD6CB] dark:border-white/10 bg-[#F9F6EF] dark:bg-[#1A1D1B] px-4 py-2 text-sm font-extrabold text-[#141f17] dark:text-white outline-none focus:border-[#8FAF9A]"
              />
            </div>
          </div>

          <div className="md:col-span-5 space-y-2">
            <label className="block text-xs font-bold text-[#141f17] dark:text-white uppercase tracking-wider">
              Public Storefront Link
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F9F6EF] dark:bg-[#1A1D1B] border border-[#DCD6CB] dark:border-white/10 text-xs font-mono text-[#26382E] dark:text-[#D2DDD6] overflow-hidden truncate">
                <Globe size={13} className="text-[#8FAF9A] shrink-0" />
                <span className="truncate">lumihaus.com.bd/pages/{config.slug}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyUrl}
                className="p-2 rounded-xl border border-[#DCD6CB] dark:border-white/10 bg-[#F9F6EF] dark:bg-[#1A1D1B] text-[#141f17] dark:text-white hover:bg-[#EEF3EF] transition cursor-pointer shrink-0"
                title="Copy URL"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>

        {/* Content Header & Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-[#141f17] dark:text-white uppercase tracking-wider">
              Markdown Body Content
            </label>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#2E4235] dark:text-[#D2DDD6]">
              <span>{wordCount} words</span>
              <span>•</span>
              <span>~{readTime} min read</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-gray-500">
                <Clock size={12} />
                {policyPages[pageKey]?.lastUpdated || "September 2026"}
              </span>
            </div>
          </div>

          {/* Toggle Editor vs Customer Preview */}
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition cursor-pointer ${
              previewMode
                ? "bg-[#26382E] text-white dark:bg-[#8FAF9A] dark:text-[#17251C] border-[#26382E]"
                : "bg-[#F9F6EF] dark:bg-[#1A1D1B] border-[#DCD6CB] dark:border-white/10 text-[#141f17] dark:text-white hover:bg-[#EEF3EF]"
            }`}
          >
            <Eye size={13} />
            <span>{previewMode ? "Back to Editor" : "Customer Preview"}</span>
          </button>
        </div>

        {/* Markdown Toolbar */}
        {!previewMode && (
          <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-[#DCD6CB] dark:border-white/10">
            <button
              type="button"
              onClick={() => insertMarkdown("## ", "\n")}
              className="px-2.5 py-1 rounded-lg border border-[#DCD6CB] dark:border-white/10 bg-[#F9F6EF] dark:bg-[#1A1D1B] text-xs font-bold hover:bg-[#EEF3EF] cursor-pointer"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown("### ", "\n")}
              className="px-2.5 py-1 rounded-lg border border-[#DCD6CB] dark:border-white/10 bg-[#F9F6EF] dark:bg-[#1A1D1B] text-xs font-bold hover:bg-[#EEF3EF] cursor-pointer"
            >
              H3
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown("**", "**")}
              className="px-2.5 py-1 rounded-lg border border-[#DCD6CB] dark:border-white/10 bg-[#F9F6EF] dark:bg-[#1A1D1B] text-xs font-bold hover:bg-[#EEF3EF] cursor-pointer"
            >
              <b>B</b>
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown("*", "*")}
              className="px-2.5 py-1 rounded-lg border border-[#DCD6CB] dark:border-white/10 bg-[#F9F6EF] dark:bg-[#1A1D1B] text-xs font-bold hover:bg-[#EEF3EF] cursor-pointer italic"
            >
              <i>I</i>
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown("- ", "\n")}
              className="px-2.5 py-1 rounded-lg border border-[#DCD6CB] dark:border-white/10 bg-[#F9F6EF] dark:bg-[#1A1D1B] text-xs font-bold hover:bg-[#EEF3EF] cursor-pointer"
            >
              • List
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown("1. ", "\n")}
              className="px-2.5 py-1 rounded-lg border border-[#DCD6CB] dark:border-white/10 bg-[#F9F6EF] dark:bg-[#1A1D1B] text-xs font-bold hover:bg-[#EEF3EF] cursor-pointer"
            >
              1. List
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown("> ", "\n")}
              className="px-2.5 py-1 rounded-lg border border-[#DCD6CB] dark:border-white/10 bg-[#F9F6EF] dark:bg-[#1A1D1B] text-xs font-bold hover:bg-[#EEF3EF] cursor-pointer"
            >
              "Quote"
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown("\n---\n")}
              className="px-2.5 py-1 rounded-lg border border-[#DCD6CB] dark:border-white/10 bg-[#F9F6EF] dark:bg-[#1A1D1B] text-xs font-bold hover:bg-[#EEF3EF] cursor-pointer"
            >
              Divider
            </button>
          </div>
        )}

        {/* Editor Body or Preview Body */}
        {previewMode ? (
          <div className="rounded-xl border-2 border-[#DCD6CB] dark:border-white/10 bg-[#F9F6EF] dark:bg-[#1A1D1B] p-6 sm:p-8 space-y-4 overflow-y-auto max-h-[550px] min-h-[400px]">
            <div className="border-b border-[#DCD6CB] dark:border-white/10 pb-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#8FAF9A]">
                Lumihaus Germany · Public Customer Policy
              </span>
              <h1 className="text-2xl font-black text-[#141f17] dark:text-white mt-1">
                {formData.title}
              </h1>
            </div>
            <div className="text-sm leading-relaxed text-[#141f17] dark:text-[#D2DDD6] whitespace-pre-line space-y-3 font-normal">
              {formData.content || (
                <span className="italic text-gray-400">No content entered yet.</span>
              )}
            </div>
          </div>
        ) : (
          <textarea
            id="store-page-textarea"
            rows={18}
            required
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Write clear store policy, guarantee, or story in Markdown..."
            className="w-full rounded-xl border-2 border-[#DCD6CB] dark:border-white/10 bg-[#F9F6EF] dark:bg-[#1A1D1B] p-4.5 font-mono text-xs sm:text-sm leading-relaxed text-[#141f17] dark:text-[#D2DDD6] outline-none focus:border-[#8FAF9A] transition resize-y font-medium min-h-[400px]"
          />
        )}

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 border-t border-[#DCD6CB] dark:border-white/10">
          <p className="text-xs text-[#2E4235] dark:text-[#D2DDD6] flex items-center gap-1.5 font-semibold">
            <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Synced automatically across storefront footer & policies</span>
          </p>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl border border-[#DCD6CB] dark:border-white/10 bg-white dark:bg-[#1A1D1B] text-[#141f17] dark:text-white hover:bg-[#EEF3EF] dark:hover:bg-white/5 transition text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Reset Template</span>
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
    </>
  );
}
