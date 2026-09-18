import { useState, useEffect, useMemo } from "react";
import { useParams, useLocation } from "react-router";
import { Save, RotateCcw, Loader2 } from "lucide-react";
import { useAdminUI } from "../../context/AdminUIContext";
import confirmToast from "../../utils/confirmToast";
import { useGetPolicyQuery, useUpdatePolicyMutation } from "../../redux/features/cmsApi";
import FaqManager from "../../components/store_pages/FaqManager";
import AboutUsEditor from "../../components/store_pages/AboutUsEditor";

const PAGE_CONFIGS = {
  "about-us": {
    key: "aboutUs",
    name: "About Us",
    defaultTitle: "About Us",
    slug: "about-us",
    desc: "Manage founder photo, editorial bio, philosophy quote, and hero banner for About Us.",
  },
  terms: {
    key: "terms",
    name: "Terms & Conditions",
    defaultTitle: "Terms & Conditions",
    slug: "terms-and-conditions",
    desc: "Manage terms and customer purchase conditions.",
  },
  privacy: {
    key: "privacy",
    name: "Privacy Policy",
    defaultTitle: "Privacy Policy",
    slug: "privacy-policy",
    desc: "Manage customer privacy and data policy.",
  },
  refund: {
    key: "returnRefund",
    name: "Return & Refund",
    defaultTitle: "Return & Refund Policy",
    slug: "return-refund-policy",
    desc: "Manage return rules and refund procedures.",
  },
  shipping: {
    key: "shippingDelivery",
    name: "Shipping & Delivery",
    defaultTitle: "Shipping & Delivery Policy",
    slug: "shipping-policy",
    desc: "Manage shipping rates, zones, and delivery timeframes.",
  },
  authenticity: {
    key: "authenticity",
    name: "Authenticity Guarantee",
    defaultTitle: "Authenticity Guarantee",
    slug: "authenticity-guarantee",
    desc: "Manage your genuine German sourcing guarantee.",
  },
  faq: {
    key: "faq",
    name: "FAQ",
    defaultTitle: "Frequently Asked Questions (FAQ)",
    slug: "faq",
    desc: "Manage frequently asked questions and answers.",
  },
};

export default function StorePageEditor() {
  const { pageSlug } = useParams();
  const location = useLocation();
  const { policyPages, updatePolicyPage, resetPolicyPage } = useAdminUI();

  // Determine current page slug
  const currentSlug = useMemo(() => {
    if (pageSlug && PAGE_CONFIGS[pageSlug]) return pageSlug;
    const path = location.pathname.replace(/^\/pages\/?/, "");
    if (PAGE_CONFIGS[path]) return path;
    return "about-us";
  }, [pageSlug, location.pathname]);

  const config = PAGE_CONFIGS[currentSlug] || PAGE_CONFIGS["about-us"];
  const pageKey = config.key;

  // Backend API hooks
  const { data: policyApiRes, refetch } = useGetPolicyQuery(config.slug, {
    skip: currentSlug === "faq" || currentSlug === "about-us",
  });
  const [updatePolicyMutation, { isLoading: isSaving }] = useUpdatePolicyMutation();

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });

  // Sync state whenever route, API, or context changes
  useEffect(() => {
    if (currentSlug === "faq" || currentSlug === "about-us") return;
    const apiData = policyApiRes?.data || (policyApiRes?.title ? policyApiRes : null);
    if (apiData && (apiData.title || apiData.content)) {
      setFormData({
        title: apiData.title || config.defaultTitle,
        content: apiData.content || "",
      });
      return;
    }
    const existing = policyPages[pageKey];
    setFormData({
      title: existing?.title || config.defaultTitle,
      content: existing?.content || "",
    });
  }, [policyApiRes, currentSlug, pageKey, policyPages]);

  // Handle Save
  const handleSave = async (e) => {
    e.preventDefault();
    updatePolicyPage(pageKey, formData);
    try {
      await updatePolicyMutation({
        slug: config.slug,
        title: formData.title.trim(),
        content: formData.content.trim(),
      }).unwrap();
      refetch();
    } catch {}
  };

  // Handle Reset
  const handleReset = () => {
    confirmToast({
      title: `Reset "${config.name}" to Default?`,
      message: `Are you sure you want to reset "${config.name}" to the official default content?`,
      confirmLabel: "Yes, Reset",
      isDestructive: false,
      onConfirm: () => {
        resetPolicyPage(pageKey);
      },
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <title>Lumihaus Admin · {config.name}</title>

      {/* Page Heading */}
      <div>
        <h2 className="text-xl font-bold text-[#141f17] dark:text-white">
          {config.name}
        </h2>
        <p className="text-xs text-neutral-500 mt-1">
          {config.desc}
        </p>
      </div>

      {/* Content */}
      {currentSlug === "faq" ? (
        <FaqManager />
      ) : currentSlug === "about-us" ? (
        <AboutUsEditor />
      ) : (
        <form
          onSubmit={handleSave}
          className="rounded-2xl border border-[#DCD6CB] dark:border-white/10 bg-white dark:bg-[#222620] p-6 sm:p-7 space-y-5 shadow-xs"
        >
          {/* Page Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#141f17] dark:text-white uppercase tracking-wider">
              Page Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. About Us"
              className="w-full rounded-xl border border-[#DCD6CB] dark:border-white/10 bg-[#F9F6EF] dark:bg-[#1A1D1B] px-4 py-2.5 text-sm font-semibold text-[#141f17] dark:text-white outline-none focus:border-[#8FAF9A]"
            />
          </div>

          {/* Page Content */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#141f17] dark:text-white uppercase tracking-wider">
              Page Content
            </label>
            <textarea
              rows={12}
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Enter page content..."
              className="w-full rounded-xl border border-[#DCD6CB] dark:border-white/10 bg-[#F9F6EF] dark:bg-[#1A1D1B] p-4 text-sm text-[#141f17] dark:text-white leading-relaxed outline-none focus:border-[#8FAF9A] font-sans resize-y transition"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[#DCD6CB] dark:border-white/10">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 rounded-xl border border-[#DCD6CB] dark:border-white/10 bg-white dark:bg-[#1A1D1B] text-[#141f17] dark:text-white hover:bg-[#EEF3EF] dark:hover:bg-white/5 transition text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Reset to Default</span>
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-[#26382E] dark:bg-[#8FAF9A] text-white dark:text-[#17251C] hover:bg-[#17251C] transition text-xs font-bold shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
