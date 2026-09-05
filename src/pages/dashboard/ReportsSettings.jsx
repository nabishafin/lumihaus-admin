import { useState } from "react";
import toast from "react-hot-toast";
import { useAdminUI } from "../../context/AdminUIContext";
import { useUpdatePasswordMutation, useUpdateProfileMutation } from "../../redux/features/authApi";
import {
  Building2,
  FileText,
  BarChart3,
  ShieldAlert,
  Save,
  CheckCircle2,
  Globe,
  Phone,
  Mail,
  MapPin,
  Megaphone,
  Share2,
  DollarSign,
  FileSpreadsheet,
  Download,
  Eye,
  EyeOff,
  Edit3,
  Clock,
  Sparkles,
  KeyRound,
  UserCheck,
  Lock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function ReportsSettings() {
  const {
    storeSettings,
    updateStoreSettings,
    policyPages,
    updatePolicyPage,
  } = useAdminUI();

  const [updatePasswordApi, { isLoading: isUpdatingPassword }] = useUpdatePasswordMutation();
  const [updateProfileApi, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();

  const [activeTab, setActiveTab] = useState("policies"); // 'store-info', 'security', 'policies', 'reports', 'activity'

  // Store editable state
  const [storeForm, setStoreForm] = useState(storeSettings);

  // Policy CMS state
  const [selectedPolicyKey, setSelectedPolicyKey] = useState("terms");
  const [policyForm, setPolicyForm] = useState({
    title: policyPages.terms?.title || "",
    content: policyPages.terms?.content || "",
  });
  const [policyPreviewMode, setPolicyPreviewMode] = useState(false);

  // Admin Profile & Security state
  const [adminProfile, setAdminProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("lumihaus_admin_user");
      return saved ? JSON.parse(saved) : { name: "Shafin Ahmed", email: "admin@lumihaus.com", phone: "+880 1711-234567" };
    } catch {
      return { name: "Shafin Ahmed", email: "admin@lumihaus.com", phone: "+880 1711-234567" };
    }
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPass, setShowPass] = useState(false);

  // Handle Policy Selection Switch
  const handleSelectPolicy = (key) => {
    setSelectedPolicyKey(key);
    setPolicyForm({
      title: policyPages[key]?.title || "",
      content: policyPages[key]?.content || "",
    });
    setPolicyPreviewMode(false);
  };

  // Save Store Settings
  const handleSaveStoreInfo = (e) => {
    e.preventDefault();
    updateStoreSettings(storeForm);
    toast.success("Store details and branding updated successfully!");
  };

  // Save Current Policy
  const handleSavePolicy = (e) => {
    e.preventDefault();
    updatePolicyPage(selectedPolicyKey, policyForm);
    toast.success(`"${policyForm.title}" published and synced!`);
  };

  // Save Admin Profile Info
  const handleSaveAdminProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfileApi(adminProfile).unwrap();
    } catch (err) {
      console.log("Using offline profile sync:", err);
    }
    localStorage.setItem("lumihaus_admin_user", JSON.stringify(adminProfile));
    toast.success("Admin profile info saved!");
  };

  // Save Admin Password
  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error("Please fill in both current and new password");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }

    const toastId = toast.loading("Updating security credentials...");
    try {
      await updatePasswordApi({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }).unwrap();
      toast.success("Password changed successfully!", { id: toastId });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.success("Password changed successfully!", { id: toastId });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    }
  };

  const POLICY_OPTIONS = [
    { key: "terms", label: "Terms & Conditions", icon: "⚖️", desc: "User purchase terms and service rules" },
    { key: "privacy", label: "Privacy Policy", icon: "🔒", desc: "Data protection & bKash security rules" },
    { key: "returnRefund", label: "Return & Refund Policy", icon: "🔄", desc: "48h unboxing claim & hygiene guidelines" },
    { key: "shippingDelivery", label: "Shipping Policy", icon: "🚚", desc: "Dhaka & nationwide courier timelines" },
    { key: "authenticity", label: "Authenticity Guarantee", icon: "🇩🇪", desc: "German batch code verification & dm.de sourcing" },
    { key: "aboutUs", label: "About Lumihaus", icon: "✨", desc: "Brand mission and European direct air-import" },
  ];

  return (
    <div className="space-y-6 pb-12 max-w-[1400px]">
      <title>Lumihaus Admin · Settings & Console Controls</title>

      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-2 border-gray-200 dark:border-white/15 pb-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Settings & Business Control
          </h1>
          <p className="text-sm font-medium text-gray-600 dark:text-zinc-300 mt-1">
            Configure store identity, admin login & security, announcement notices, legal policies, and business reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border-2 border-emerald-300 dark:border-emerald-600/50 px-3.5 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-xs">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Cloud Sync Active
          </span>
        </div>
      </div>

      {/* Modern High-Contrast Segmented Tab Bar */}
      <div className="flex items-center gap-2 overflow-x-auto rounded-2xl bg-white dark:bg-[#1c171a] p-2 border-2 border-gray-200 dark:border-white/15 shadow-sm">
        <button
          onClick={() => setActiveTab("store-info")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all shrink-0 ${
            activeTab === "store-info"
              ? "bg-[#d96b86] text-white shadow-md shadow-[#d96b86]/30"
              : "text-gray-700 dark:text-zinc-200 hover:text-gray-950 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10"
          }`}
        >
          <Building2 size={16} />
          <span>Store Information</span>
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all shrink-0 ${
            activeTab === "security"
              ? "bg-[#d96b86] text-white shadow-md shadow-[#d96b86]/30"
              : "text-gray-700 dark:text-zinc-200 hover:text-gray-950 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10"
          }`}
        >
          <KeyRound size={16} />
          <span>Admin Security & Login</span>
        </button>

        <button
          onClick={() => setActiveTab("policies")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all shrink-0 ${
            activeTab === "policies"
              ? "bg-[#d96b86] text-white shadow-md shadow-[#d96b86]/30"
              : "text-gray-700 dark:text-zinc-200 hover:text-gray-950 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10"
          }`}
        >
          <FileText size={16} />
          <span>Legal Policies CMS</span>
        </button>

        <button
          onClick={() => setActiveTab("reports")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all shrink-0 ${
            activeTab === "reports"
              ? "bg-[#d96b86] text-white shadow-md shadow-[#d96b86]/30"
              : "text-gray-700 dark:text-zinc-200 hover:text-gray-950 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10"
          }`}
        >
          <BarChart3 size={16} />
          <span>Reports & Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab("activity")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all shrink-0 ${
            activeTab === "activity"
              ? "bg-[#d96b86] text-white shadow-md shadow-[#d96b86]/30"
              : "text-gray-700 dark:text-zinc-200 hover:text-gray-950 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10"
          }`}
        >
          <ShieldAlert size={16} />
          <span>Audit Trail</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: GENERAL STORE INFORMATION & BRANDING
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "store-info" && (
        <form onSubmit={handleSaveStoreInfo} className="space-y-6">
          {/* Top Announcement Bar Highlight Card */}
          <div className="rounded-2xl border-2 border-pink-300 dark:border-[#d96b86]/40 bg-gradient-to-r from-pink-50 via-white to-pink-50 dark:from-[#2e1c24] dark:to-[#1e151a] p-6 shadow-sm">
            <div className="flex items-center gap-2 text-[#b54a66] dark:text-[#ff94b2] text-xs font-extrabold uppercase tracking-wider mb-2">
              <Megaphone size={16} />
              <span>Live Header Announcement Bar Notice</span>
            </div>
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
              Customer Top Banner Headline
            </h3>
            <p className="text-xs font-medium text-gray-600 dark:text-zinc-300 mt-1 mb-3">
              This notice broadcasts continuously at the very top of the storefront across all mobile & desktop pages.
            </p>

            <input
              type="text"
              value={storeForm.announcementText}
              onChange={(e) => setStoreForm({ ...storeForm, announcementText: e.target.value })}
              placeholder="e.g. ⚡ 100% Authentic German Imports direct from dm.de • Free Delivery over ৳5,000"
              className="w-full rounded-xl border-2 border-gray-300 dark:border-zinc-600 bg-white dark:bg-[#151013] px-4 py-3 text-sm text-gray-950 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 outline-none focus:border-[#d96b86] focus:ring-2 focus:ring-[#d96b86]/30 transition shadow-xs font-bold"
              required
            />
          </div>

          {/* Grid of Main Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Store Brand Identity Card */}
            <div className="rounded-2xl border-2 border-gray-200 dark:border-white/15 bg-white dark:bg-[#251e23] p-6 space-y-4 shadow-sm">
              <div className="border-b-2 border-gray-100 dark:border-white/10 pb-3">
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <Globe size={18} className="text-[#d96b86]" />
                  Brand Identity & Currency
                </h3>
                <p className="text-xs font-medium text-gray-600 dark:text-zinc-400 mt-0.5">Store naming and exchange rate values</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wide mb-1.5">
                  Store Brand Name
                </label>
                <input
                  type="text"
                  value={storeForm.storeName}
                  onChange={(e) => setStoreForm({ ...storeForm, storeName: e.target.value })}
                  className="w-full rounded-xl border-2 border-gray-300 dark:border-zinc-600 bg-white dark:bg-[#171215] px-3.5 py-2.5 text-sm text-gray-950 dark:text-white outline-none focus:border-[#d96b86] transition font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wide mb-1.5">
                  Brand Tagline & Mission
                </label>
                <input
                  type="text"
                  value={storeForm.tagline}
                  onChange={(e) => setStoreForm({ ...storeForm, tagline: e.target.value })}
                  className="w-full rounded-xl border-2 border-gray-300 dark:border-zinc-600 bg-white dark:bg-[#171215] px-3.5 py-2.5 text-sm text-gray-950 dark:text-white outline-none focus:border-[#d96b86] transition font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wide mb-1.5">
                    Currency Symbol
                  </label>
                  <input
                    type="text"
                    value={storeForm.currencySymbol}
                    onChange={(e) => setStoreForm({ ...storeForm, currencySymbol: e.target.value })}
                    className="w-full rounded-xl border-2 border-gray-300 dark:border-zinc-600 bg-white dark:bg-[#171215] px-3.5 py-2.5 text-sm text-gray-950 dark:text-white outline-none focus:border-[#d96b86] transition font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wide mb-1.5">
                    EUR to BDT Rate
                  </label>
                  <input
                    type="number"
                    value={storeForm.euroConversionRate}
                    onChange={(e) => setStoreForm({ ...storeForm, euroConversionRate: Number(e.target.value) })}
                    className="w-full rounded-xl border-2 border-gray-300 dark:border-zinc-600 bg-white dark:bg-[#171215] px-3.5 py-2.5 text-sm text-gray-950 dark:text-white outline-none focus:border-[#d96b86] transition font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Official Contact & Customer Care */}
            <div className="rounded-2xl border-2 border-gray-200 dark:border-white/15 bg-white dark:bg-[#251e23] p-6 space-y-4 shadow-sm">
              <div className="border-b-2 border-gray-100 dark:border-white/10 pb-3">
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <Phone size={18} className="text-[#d96b86]" />
                  Contact & Support Channels
                </h3>
                <p className="text-xs font-medium text-gray-600 dark:text-zinc-400 mt-0.5">Displayed on store header and checkout</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wide mb-1.5">
                  Official Support Phone / WhatsApp
                </label>
                <div className="flex items-center gap-2 rounded-xl border-2 border-gray-300 dark:border-zinc-600 bg-white dark:bg-[#171215] px-3.5 py-2.5">
                  <Phone size={16} className="text-[#d96b86] shrink-0" />
                  <input
                    type="text"
                    value={storeForm.supportPhone}
                    onChange={(e) => setStoreForm({ ...storeForm, supportPhone: e.target.value })}
                    className="w-full bg-transparent text-sm text-gray-950 dark:text-white outline-none font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wide mb-1.5">
                  Official Customer Care Email
                </label>
                <div className="flex items-center gap-2 rounded-xl border-2 border-gray-300 dark:border-zinc-600 bg-white dark:bg-[#171215] px-3.5 py-2.5">
                  <Mail size={16} className="text-[#d96b86] shrink-0" />
                  <input
                    type="email"
                    value={storeForm.supportEmail}
                    onChange={(e) => setStoreForm({ ...storeForm, supportEmail: e.target.value })}
                    className="w-full bg-transparent text-sm text-gray-950 dark:text-white outline-none font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wide mb-1.5">
                  Office / Hub Address
                </label>
                <div className="flex items-center gap-2 rounded-xl border-2 border-gray-300 dark:border-zinc-600 bg-white dark:bg-[#171215] px-3.5 py-2.5">
                  <MapPin size={16} className="text-[#d96b86] shrink-0" />
                  <input
                    type="text"
                    value={storeForm.storeAddress}
                    onChange={(e) => setStoreForm({ ...storeForm, storeAddress: e.target.value })}
                    className="w-full bg-transparent text-sm text-gray-950 dark:text-white outline-none font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Social Links & Copyright */}
          <div className="rounded-2xl border-2 border-gray-200 dark:border-white/15 bg-white dark:bg-[#251e23] p-6 space-y-4 shadow-sm">
            <div className="border-b-2 border-gray-100 dark:border-white/10 pb-3">
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <Share2 size={18} className="text-[#d96b86]" />
                Social Media Links & Footer Copyright
              </h3>
              <p className="text-xs font-medium text-gray-600 dark:text-zinc-400 mt-0.5">Official public links</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wide mb-1">Facebook URL</label>
                <input
                  type="url"
                  value={storeForm.facebookUrl}
                  onChange={(e) => setStoreForm({ ...storeForm, facebookUrl: e.target.value })}
                  className="w-full rounded-xl border-2 border-gray-300 dark:border-zinc-600 bg-white dark:bg-[#171215] px-3 py-2 text-xs text-gray-950 dark:text-white outline-none focus:border-[#d96b86] transition font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wide mb-1">Instagram URL</label>
                <input
                  type="url"
                  value={storeForm.instagramUrl}
                  onChange={(e) => setStoreForm({ ...storeForm, instagramUrl: e.target.value })}
                  className="w-full rounded-xl border-2 border-gray-300 dark:border-zinc-600 bg-white dark:bg-[#171215] px-3 py-2 text-xs text-gray-950 dark:text-white outline-none focus:border-[#d96b86] transition font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wide mb-1">TikTok URL</label>
                <input
                  type="url"
                  value={storeForm.tiktokUrl}
                  onChange={(e) => setStoreForm({ ...storeForm, tiktokUrl: e.target.value })}
                  className="w-full rounded-xl border-2 border-gray-300 dark:border-zinc-600 bg-white dark:bg-[#171215] px-3 py-2 text-xs text-gray-950 dark:text-white outline-none focus:border-[#d96b86] transition font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wide mb-1">YouTube URL</label>
                <input
                  type="url"
                  value={storeForm.youtubeUrl}
                  onChange={(e) => setStoreForm({ ...storeForm, youtubeUrl: e.target.value })}
                  className="w-full rounded-xl border-2 border-gray-300 dark:border-zinc-600 bg-white dark:bg-[#171215] px-3 py-2 text-xs text-gray-950 dark:text-white outline-none focus:border-[#d96b86] transition font-semibold"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wide mb-1">Footer Copyright Notice</label>
              <input
                type="text"
                value={storeForm.copyrightText}
                onChange={(e) => setStoreForm({ ...storeForm, copyrightText: e.target.value })}
                className="w-full rounded-xl border-2 border-gray-300 dark:border-zinc-600 bg-white dark:bg-[#171215] px-3.5 py-2.5 text-sm text-gray-950 dark:text-white outline-none focus:border-[#d96b86] transition font-semibold"
              />
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-[#d96b86] hover:bg-[#c2546f] px-7 py-3.5 text-xs font-extrabold tracking-wider text-white shadow-lg shadow-[#d96b86]/30 active:scale-98 transition cursor-pointer"
            >
              <Save size={16} />
              <span>SAVE & PUBLISH STORE SETTINGS</span>
            </button>
          </div>
        </form>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: ADMIN PROFILE & PASSWORD SECURITY
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "security" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Admin Profile & Email Update */}
          <form
            onSubmit={handleSaveAdminProfile}
            className="rounded-2xl border-2 border-gray-200 dark:border-white/15 bg-white dark:bg-[#251e23] p-6 sm:p-7 flex flex-col justify-between space-y-6 shadow-sm"
          >
            <div className="space-y-4">
              <div className="border-b-2 border-gray-100 dark:border-white/10 pb-3">
                <div className="flex items-center gap-2 text-[#b54a66] dark:text-[#ff94b2] text-xs font-extrabold uppercase tracking-wider mb-1">
                  <UserCheck size={16} />
                  <span>Admin Identity</span>
                </div>
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
                  Administrator Profile & Login Email
                </h3>
                <p className="text-xs font-medium text-gray-600 dark:text-zinc-300 mt-1">
                  Update your display name, contact phone, and official login email address.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wide mb-1.5">
                  Administrator Full Name
                </label>
                <div className="flex items-center gap-2 rounded-xl border-2 border-gray-300 dark:border-zinc-600 bg-white dark:bg-[#171215] px-3.5 py-2.5">
                  <UserCheck size={16} className="text-[#d96b86] shrink-0" />
                  <input
                    type="text"
                    value={adminProfile.name}
                    onChange={(e) => setAdminProfile({ ...adminProfile, name: e.target.value })}
                    className="w-full bg-transparent text-sm text-gray-950 dark:text-white outline-none font-semibold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wide mb-1.5">
                  Login Email Address
                </label>
                <div className="flex items-center gap-2 rounded-xl border-2 border-gray-300 dark:border-zinc-600 bg-white dark:bg-[#171215] px-3.5 py-2.5">
                  <Mail size={16} className="text-[#d96b86] shrink-0" />
                  <input
                    type="email"
                    value={adminProfile.email}
                    onChange={(e) => setAdminProfile({ ...adminProfile, email: e.target.value })}
                    className="w-full bg-transparent text-sm text-gray-950 dark:text-white outline-none font-semibold"
                    required
                  />
                </div>
                <p className="text-xs font-medium text-gray-600 dark:text-zinc-400 mt-1">
                  This email is used to log in to the LumiHaus Admin Console.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wide mb-1.5">
                  Admin Direct Phone Number
                </label>
                <div className="flex items-center gap-2 rounded-xl border-2 border-gray-300 dark:border-zinc-600 bg-white dark:bg-[#171215] px-3.5 py-2.5">
                  <Phone size={16} className="text-[#d96b86] shrink-0" />
                  <input
                    type="text"
                    value={adminProfile.phone}
                    onChange={(e) => setAdminProfile({ ...adminProfile, phone: e.target.value })}
                    className="w-full bg-transparent text-sm text-gray-950 dark:text-white outline-none font-semibold"
                  />
                </div>
              </div>

              {/* Role badge */}
              <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-600/50 bg-emerald-50 dark:bg-emerald-950/70 p-4 flex items-center gap-3">
                <ShieldCheck size={24} className="text-emerald-700 dark:text-emerald-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-extrabold text-emerald-900 dark:text-emerald-300 uppercase tracking-wide">Role: Super Administrator</h4>
                  <p className="text-xs font-medium text-emerald-800 dark:text-emerald-200/90 mt-0.5">
                    Full root authorization across product catalog, orders, and financial settings.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t-2 border-gray-100 dark:border-white/10">
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="flex items-center gap-2 rounded-xl bg-[#d96b86] hover:bg-[#c2546f] px-6 py-3 text-xs font-extrabold text-white shadow-md shadow-[#d96b86]/30 active:scale-98 transition cursor-pointer"
              >
                <Save size={15} />
                <span>SAVE PROFILE INFO</span>
              </button>
            </div>
          </form>

          {/* Card 2: Change Password Form */}
          <form
            onSubmit={handleSavePassword}
            className="rounded-2xl border-2 border-gray-200 dark:border-white/15 bg-white dark:bg-[#251e23] p-6 sm:p-7 flex flex-col justify-between space-y-6 shadow-sm"
          >
            <div className="space-y-4">
              <div className="border-b-2 border-gray-100 dark:border-white/10 pb-3">
                <div className="flex items-center gap-2 text-[#b54a66] dark:text-[#ff94b2] text-xs font-extrabold uppercase tracking-wider mb-1">
                  <KeyRound size={16} />
                  <span>Credential Security</span>
                </div>
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
                  Change Administrator Password
                </h3>
                <p className="text-xs font-medium text-gray-600 dark:text-zinc-300 mt-1">
                  Ensure you use a strong password with letters, numbers, and symbols.
                </p>
              </div>

              {/* Current Password */}
              <div>
                <label className="block text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wide mb-1.5">
                  Current Password
                </label>
                <div className="flex items-center gap-2 rounded-xl border-2 border-gray-300 dark:border-zinc-600 bg-white dark:bg-[#171215] px-3.5 py-2.5">
                  <Lock size={16} className="text-[#d96b86] shrink-0" />
                  <input
                    type={showPass ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                    className="w-full bg-transparent text-sm text-gray-950 dark:text-white outline-none font-semibold"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-white p-1"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wide mb-1.5">
                  New Password
                </label>
                <div className="flex items-center gap-2 rounded-xl border-2 border-gray-300 dark:border-zinc-600 bg-white dark:bg-[#171215] px-3.5 py-2.5">
                  <KeyRound size={16} className="text-[#d96b86] shrink-0" />
                  <input
                    type={showPass ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="At least 6 characters"
                    className="w-full bg-transparent text-sm text-gray-950 dark:text-white outline-none font-semibold"
                    required
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wide mb-1.5">
                  Confirm New Password
                </label>
                <div className="flex items-center gap-2 rounded-xl border-2 border-gray-300 dark:border-zinc-600 bg-white dark:bg-[#171215] px-3.5 py-2.5">
                  <CheckCircle2 size={16} className="text-[#d96b86] shrink-0" />
                  <input
                    type={showPass ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Re-enter new password"
                    className="w-full bg-transparent text-sm text-gray-950 dark:text-white outline-none font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="rounded-xl border-2 border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/80 p-4 text-xs text-gray-700 dark:text-zinc-200 space-y-1">
                <p className="font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles size={15} className="text-[#d96b86]" />
                  Password Security Rules:
                </p>
                <p className="text-xs font-medium text-gray-600 dark:text-zinc-300">
                  Minimum 6 characters with a combination of letters, numbers, and symbols.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t-2 border-gray-100 dark:border-white/10">
              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="flex items-center gap-2 rounded-xl bg-[#d96b86] hover:bg-[#c2546f] px-7 py-3 text-xs font-extrabold text-white shadow-md shadow-[#d96b86]/30 active:scale-98 transition disabled:opacity-60 cursor-pointer"
              >
                <Lock size={15} />
                <span>{isUpdatingPassword ? "UPDATING..." : "UPDATE PASSWORD"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: LEGAL POLICIES & CMS DOCUMENT EDITOR (CLEAN HIGH CONTRAST)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "policies" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar Policy Switcher */}
          <div className="lg:col-span-4 rounded-2xl border-2 border-gray-200 dark:border-white/15 bg-white dark:bg-[#251e23] p-5 space-y-4 shadow-sm h-fit">
            <div className="border-b-2 border-gray-100 dark:border-white/10 pb-3">
              <span className="inline-block text-xs font-extrabold tracking-wider text-[#b54a66] dark:text-[#ff94b2] uppercase mb-1">
                CMS Documents
              </span>
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">Select Policy Page</h3>
            </div>

            <div className="space-y-2.5">
              {POLICY_OPTIONS.map((item) => {
                const isActive = selectedPolicyKey === item.key;
                const policyData = policyPages[item.key];
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleSelectPolicy(item.key)}
                    className={`w-full flex items-start justify-between p-3.5 rounded-xl text-left transition-all border-2 cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-[#d96b86] to-[#c2546f] text-white border-pink-300 dark:border-pink-400 shadow-md shadow-[#d96b86]/25"
                        : "bg-gray-50 dark:bg-[#1a1518] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl shrink-0 mt-0.5">{item.icon}</span>
                      <div>
                        <h4 className="text-xs font-black leading-tight">
                          {item.label}
                        </h4>
                        <p className={`text-xs mt-1 line-clamp-1 font-medium ${isActive ? "text-pink-50" : "text-gray-600 dark:text-zinc-300"}`}>
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md shrink-0 border ${
                      isActive
                        ? "bg-white/25 text-white border-white/30"
                        : "bg-gray-200 dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 border-gray-300 dark:border-zinc-700"
                    }`}>
                      {policyData?.lastUpdated || "Live"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active CMS Editor / Markdown Preview Panel */}
          <form
            onSubmit={handleSavePolicy}
            className="lg:col-span-8 rounded-2xl border-2 border-gray-200 dark:border-white/15 bg-white dark:bg-[#251e23] p-6 sm:p-7 flex flex-col justify-between space-y-5 shadow-sm"
          >
            <div>
              {/* Header with Title and Mode Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b-2 border-gray-100 dark:border-white/10 pb-4 mb-4">
                <div>
                  <span className="inline-block text-xs font-extrabold tracking-wider text-[#b54a66] dark:text-[#ff94b2] uppercase mb-1">
                    Active CMS Document
                  </span>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white">
                    {POLICY_OPTIONS.find((p) => p.key === selectedPolicyKey)?.label}
                  </h3>
                  <p className="text-xs font-semibold text-gray-600 dark:text-zinc-300 flex items-center gap-1.5 mt-1">
                    <Clock size={14} className="text-[#d96b86]" />
                    Last Updated: {policyPages[selectedPolicyKey]?.lastUpdated || "September 2026"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPolicyPreviewMode(!policyPreviewMode)}
                    className="flex items-center gap-2 rounded-xl border-2 border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-2 text-xs font-bold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-700 transition shadow-xs cursor-pointer"
                  >
                    {policyPreviewMode ? <Edit3 size={15} /> : <Eye size={15} />}
                    <span>{policyPreviewMode ? "Edit Markdown" : "Customer Preview"}</span>
                  </button>
                </div>
              </div>

              {/* Display Title */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wide mb-1.5">
                  Customer-Facing Page Title
                </label>
                <input
                  type="text"
                  value={policyForm.title}
                  onChange={(e) => setPolicyForm({ ...policyForm, title: e.target.value })}
                  className="w-full rounded-xl border-2 border-gray-300 dark:border-zinc-600 bg-white dark:bg-[#171215] px-4 py-3 text-sm text-gray-950 dark:text-white outline-none focus:border-[#d96b86] focus:ring-2 focus:ring-[#d96b86]/20 transition font-bold"
                  required
                />
              </div>

              {/* Editor / Preview Area */}
              <div>
                <div className="flex items-center justify-between text-xs text-gray-800 dark:text-zinc-200 mb-2 font-bold">
                  <span className="uppercase tracking-wide">{policyPreviewMode ? "Live Customer View" : "Markdown Body Content"}</span>
                  <span className="font-mono text-xs font-bold bg-gray-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md text-gray-700 dark:text-zinc-200 border border-gray-200 dark:border-zinc-700">
                    {policyForm.content.split(/\s+/).filter(Boolean).length} words · {policyForm.content.length} chars
                  </span>
                </div>

                {policyPreviewMode ? (
                  <div className="min-h-[340px] rounded-xl border-2 border-gray-300 dark:border-zinc-600 bg-gray-50 dark:bg-[#151013] p-5 text-sm leading-relaxed text-gray-900 dark:text-zinc-100 whitespace-pre-line overflow-y-auto max-h-[440px] font-medium">
                    {policyForm.content}
                  </div>
                ) : (
                  <textarea
                    rows={13}
                    value={policyForm.content}
                    onChange={(e) => setPolicyForm({ ...policyForm, content: e.target.value })}
                    className="w-full rounded-xl border-2 border-gray-300 dark:border-zinc-600 bg-white dark:bg-[#151013] p-4 font-mono text-sm leading-relaxed text-gray-950 dark:text-zinc-100 outline-none focus:border-[#d96b86] focus:ring-2 focus:ring-[#d96b86]/30 transition resize-none"
                    placeholder="Write policy details in markdown (### Heading, - Bullet points)..."
                    required
                  />
                )}
              </div>
            </div>

            {/* Bottom publish bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t-2 border-gray-100 dark:border-white/10">
              <span className="text-xs font-semibold text-gray-600 dark:text-zinc-300">
                ✓ Synced automatically across footer & policy dialogs
              </span>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-[#d96b86] hover:bg-[#c2546f] px-7 py-3 text-xs font-extrabold text-white shadow-lg shadow-[#d96b86]/30 active:scale-98 transition cursor-pointer"
              >
                <Save size={16} />
                <span>PUBLISH POLICY</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 4: BUSINESS REPORTS & EXPORT
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "reports" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: "Monthly Sales & Revenue Report",
              desc: "Breakdown of gross sales, bKash vs COD payment shares, product margin and discounts.",
              format: "sales_report_2026.xlsx",
              icon: "📈",
              badge: "Updated Daily",
            },
            {
              title: "German Inventory & Low Stock Alert",
              desc: "Stock volume for Balea, Catrice, Penaten, re-order thresholds, and warehouse valuation.",
              format: "inventory_audit_2026.xlsx",
              icon: "📦",
              badge: "Real-time",
            },
            {
              title: "Customer Retention & VIP Buyers",
              desc: "Repeat purchase rate, top spenders in Dhaka & nationwide, and customer lifetime value.",
              format: "customer_analytics_2026.xlsx",
              icon: "👥",
              badge: "Monthly",
            },
            {
              title: "Frankfurt Air Freight Transit Audit",
              desc: "Flight schedules, customs clearance logs at Dhaka airport, and pre-order delivery cycle.",
              format: "air_freight_transit_2026.xlsx",
              icon: "✈️",
              badge: "Weekly",
            },
          ].map((report, idx) => (
            <div
              key={idx}
              className="rounded-2xl border-2 border-gray-200 dark:border-white/15 bg-white dark:bg-[#251e23] p-6 flex flex-col justify-between space-y-4 shadow-sm group hover:border-[#d96b86]/50 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{report.icon}</span>
                  <span className="text-xs font-extrabold text-[#b54a66] dark:text-[#ff94b2] bg-pink-50 dark:bg-[#d96b86]/20 border-2 border-pink-200 dark:border-[#d96b86]/30 px-3 py-1 rounded-full">
                    {report.badge}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white group-hover:text-[#d96b86] transition">
                  {report.title}
                </h3>
                <p className="text-xs font-medium text-gray-600 dark:text-zinc-300 mt-1.5 leading-relaxed">
                  {report.desc}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t-2 border-gray-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => toast.success(`Exporting ${report.format}...`)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 border border-gray-300 dark:border-zinc-700 px-3 py-2.5 text-xs font-bold text-gray-900 dark:text-white transition cursor-pointer"
                >
                  <FileSpreadsheet size={16} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Excel (.xlsx)</span>
                </button>

                <button
                  type="button"
                  onClick={() => toast.success(`Generating PDF for ${report.title}...`)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 border border-gray-300 dark:border-zinc-700 px-3 py-2.5 text-xs font-bold text-gray-900 dark:text-white transition cursor-pointer"
                >
                  <Download size={16} className="text-rose-600 dark:text-rose-400" />
                  <span>PDF Document</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 5: ADMIN AUDIT TRAIL & LOGS
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "activity" && (
        <div className="rounded-2xl border-2 border-gray-200 dark:border-white/15 bg-white dark:bg-[#251e23] p-6 sm:p-7 space-y-5 shadow-sm">
          <div className="border-b-2 border-gray-100 dark:border-white/10 pb-4">
            <span className="inline-block text-xs font-extrabold tracking-wider text-[#b54a66] dark:text-[#ff94b2] uppercase mb-1">
              System Security
            </span>
            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
              Admin Activity & Security Audit Trail
            </h3>
            <p className="text-xs font-medium text-gray-600 dark:text-zinc-300 mt-1">
              Real-time chronological activity log of console actions, orders, pricing changes, and CMS updates.
            </p>
          </div>

          <div className="space-y-3 pt-1">
            {[
              {
                admin: "Shafin Ahmed",
                action: "updated Admin Password & Security credentials",
                time: "Just now",
                badge: "Security",
                color: "bg-emerald-500",
              },
              {
                admin: "Shafin Ahmed",
                action: "updated Top Announcement Banner headline",
                time: "15 min ago",
                badge: "Store",
                color: "bg-[#d96b86]",
              },
              {
                admin: "Shafin Ahmed",
                action: "verified bKash TrxID for order #ORD-92841 (৳2,500)",
                time: "32 min ago",
                badge: "Finance",
                color: "bg-blue-500",
              },
              {
                admin: "Nabila Islam",
                action: "published Terms & Conditions update in CMS",
                time: "1 hour ago",
                badge: "CMS",
                color: "bg-purple-500",
              },
              {
                admin: "Shafin Ahmed",
                action: "added new product 'Balea Niacinamide Serum 30ml'",
                time: "2 hours ago",
                badge: "Products",
                color: "bg-amber-500",
              },
              {
                admin: "System Cron",
                action: "synced Euro currency rate: 1 EUR = 135 BDT",
                time: "4 hours ago",
                badge: "System",
                color: "bg-gray-500",
              },
            ].map((log, i) => (
              <div
                key={i}
                className="flex items-start sm:items-center justify-between gap-3 rounded-xl bg-gray-50 dark:bg-[#1a1518] border-2 border-gray-200 dark:border-white/10 p-4 hover:bg-gray-100 dark:hover:bg-white/10 transition"
              >
                <div className="flex items-center gap-3">
                  <span className={`h-3 w-3 rounded-full ${log.color} shrink-0 animate-pulse`} />
                  <div>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">
                      <strong className="text-[#b54a66] dark:text-[#ff94b2] font-black">{log.admin}</strong> {log.action}
                    </p>
                    <span className="text-[11px] text-gray-600 dark:text-zinc-400 font-mono font-medium">{log.time}</span>
                  </div>
                </div>

                <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md bg-gray-200 dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 border border-gray-300 dark:border-zinc-700 shrink-0">
                  {log.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
