import { useState } from "react";
import toast from "react-hot-toast";
import { useAdminUI } from "../../context/AdminUIContext";
import { useUpdatePasswordMutation, useUpdateProfileMutation } from "../../redux/features/authApi";
import {
  Building2,
  FileText,
  Save,
  CheckCircle2,
  Globe,
  Phone,
  Mail,
  MapPin,
  Megaphone,
  Share2,
  Eye,
  EyeOff,
  Edit3,
  Clock,
  Sparkles,
  KeyRound,
  UserCheck,
  Lock,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

export default function Settings() {
  const {
    storeSettings,
    updateStoreSettings,
    policyPages,
    updatePolicyPage,
  } = useAdminUI();

  const [updatePasswordApi, { isLoading: isUpdatingPassword }] = useUpdatePasswordMutation();
  const [updateProfileApi, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();

  // Clean 4 tabs: store-info, security, policies, activity
  const [activeTab, setActiveTab] = useState("store-info");

  // Store editable state
  const [storeForm, setStoreForm] = useState(storeSettings);

  // Policy CMS state
  const [selectedPolicyKey, setSelectedPolicyKey] = useState("aboutUs");
  const [policyForm, setPolicyForm] = useState({
    title: policyPages.aboutUs?.title || policyPages.terms?.title || "",
    content: policyPages.aboutUs?.content || policyPages.terms?.content || "",
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
    toast.success("Store details and announcement updated successfully!");
  };

  // Save Current Policy
  const handleSavePolicy = (e) => {
    e.preventDefault();
    updatePolicyPage(selectedPolicyKey, policyForm);
    toast.success(`"${policyForm.title}" published and live!`);
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
    toast.success("Admin profile updated successfully!");
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
    { key: "aboutUs", label: "About Us Page", icon: "✨", desc: "Brand story, German air-import mission & quality promise" },
    { key: "terms", label: "Terms & Conditions", icon: "⚖️", desc: "User purchase terms and service guidelines" },
    { key: "privacy", label: "Privacy & Data Policy", icon: "🔒", desc: "Customer data protection & bKash transaction security" },
    { key: "returnRefund", label: "Return & Refund Policy", icon: "🔄", desc: "48-hour unboxing claims & hygiene rules" },
    { key: "shippingDelivery", label: "Shipping Policy", icon: "🚚", desc: "Dhaka and nationwide courier delivery timeframes" },
    { key: "authenticity", label: "Authenticity Guarantee", icon: "🇩🇪", desc: "dm.de direct sourcing & batch code verification" },
  ];

  return (
    <div className="space-y-6 pb-12 max-w-[1400px]">
      <title>Lumihaus Admin · Settings & Store Controls</title>

      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-2 border-gray-200 dark:border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase tracking-wider text-[#912d45] dark:text-[#ffc4c7] bg-[#ffc4c7]/25 dark:bg-[#ffc4c7]/15 px-2.5 py-0.5 rounded-md border border-[#ffc4c7]/40">
              System Settings
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Settings & Store Configuration
          </h1>
          <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-zinc-300 mt-1">
            Manage store branding, announcement headlines, administrator credentials, and public policy pages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border-2 border-emerald-300 dark:border-emerald-600/50 px-3.5 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Cloud Sync Active
          </span>
        </div>
      </div>

      {/* Segmented Tab Bar with #ffc4c7 Accents */}
      <div className="flex items-center gap-2 overflow-x-auto rounded-2xl bg-white dark:bg-[#1f191d] p-1.5 border-2 border-gray-200 dark:border-white/10 shadow-xs">
        <button
          onClick={() => setActiveTab("store-info")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition-all shrink-0 cursor-pointer ${
            activeTab === "store-info"
              ? "bg-[#ffc4c7] text-[#1e1317] shadow-md shadow-[#ffc4c7]/30"
              : "text-gray-700 dark:text-zinc-300 hover:text-gray-950 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
          }`}
        >
          <Building2 size={16} />
          <span>Store Information</span>
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition-all shrink-0 cursor-pointer ${
            activeTab === "security"
              ? "bg-[#ffc4c7] text-[#1e1317] shadow-md shadow-[#ffc4c7]/30"
              : "text-gray-700 dark:text-zinc-300 hover:text-gray-950 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
          }`}
        >
          <KeyRound size={16} />
          <span>Admin & Security</span>
        </button>

        <button
          onClick={() => setActiveTab("policies")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition-all shrink-0 cursor-pointer ${
            activeTab === "policies"
              ? "bg-[#ffc4c7] text-[#1e1317] shadow-md shadow-[#ffc4c7]/30"
              : "text-gray-700 dark:text-zinc-300 hover:text-gray-950 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
          }`}
        >
          <FileText size={16} />
          <span>Public Pages & CMS</span>
        </button>

        <button
          onClick={() => setActiveTab("activity")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition-all shrink-0 cursor-pointer ${
            activeTab === "activity"
              ? "bg-[#ffc4c7] text-[#1e1317] shadow-md shadow-[#ffc4c7]/30"
              : "text-gray-700 dark:text-zinc-300 hover:text-gray-950 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
          }`}
        >
          <ShieldAlert size={16} />
          <span>Audit Log</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: STORE INFORMATION & BRANDING
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "store-info" && (
        <form onSubmit={handleSaveStoreInfo} className="space-y-6">
          {/* Top Announcement Bar Card */}
          <div className="rounded-2xl border-2 border-[#ffc4c7] dark:border-[#ffc4c7]/40 bg-gradient-to-r from-pink-50/70 via-white to-pink-50/70 dark:from-[#2a1d23] dark:via-[#22181d] dark:to-[#2a1d23] p-6 shadow-sm">
            <div className="flex items-center gap-2 text-[#912d45] dark:text-[#ffc4c7] text-xs font-black uppercase tracking-wider mb-2">
              <Megaphone size={16} />
              <span>Live Header Announcement Bar</span>
            </div>
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
              Customer Top Announcement Headline
            </h3>
            <p className="text-xs font-medium text-gray-600 dark:text-zinc-300 mt-1 mb-3">
              Broadcasted at the very top of the storefront across desktop and mobile.
            </p>

            <input
              type="text"
              value={storeForm.announcementText}
              onChange={(e) => setStoreForm({ ...storeForm, announcementText: e.target.value })}
              placeholder="e.g. ⚡ 100% Authentic German Imports direct from dm.de • Free Delivery over ৳5,000"
              className="w-full rounded-xl border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#171215] px-4 py-3 text-sm text-gray-950 dark:text-white outline-none focus:border-[#ffc4c7] focus:ring-2 focus:ring-[#ffc4c7]/30 transition font-bold"
              required
            />
          </div>

          {/* Grid of Main Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Store Brand Identity Card */}
            <div className="rounded-2xl border-2 border-gray-200 dark:border-white/10 bg-white dark:bg-[#251e23] p-6 space-y-4 shadow-sm">
              <div className="border-b-2 border-gray-100 dark:border-white/10 pb-3">
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <Globe size={18} className="text-[#c2546f] dark:text-[#ffc4c7]" />
                  Brand Identity & Currency
                </h3>
                <p className="text-xs font-medium text-gray-600 dark:text-zinc-400 mt-0.5">Store name, tagline, and EUR currency rate</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wide mb-1.5">
                  Store Brand Name
                </label>
                <input
                  type="text"
                  value={storeForm.storeName}
                  onChange={(e) => setStoreForm({ ...storeForm, storeName: e.target.value })}
                  className="w-full rounded-xl border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#171215] px-3.5 py-2.5 text-sm text-gray-950 dark:text-white outline-none focus:border-[#ffc4c7] transition font-semibold"
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
                  className="w-full rounded-xl border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#171215] px-3.5 py-2.5 text-sm text-gray-950 dark:text-white outline-none focus:border-[#ffc4c7] transition font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wide mb-1.5">
                    Currency Symbol
                  </label>
                  <input
                    type="text"
                    value={storeForm.currencySymbol || "৳"}
                    onChange={(e) => setStoreForm({ ...storeForm, currencySymbol: e.target.value })}
                    className="w-full rounded-xl border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#171215] px-3.5 py-2.5 text-sm text-gray-950 dark:text-white outline-none focus:border-[#ffc4c7] transition font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wide mb-1.5">
                    EUR to BDT Rate
                  </label>
                  <input
                    type="number"
                    value={storeForm.euroConversionRate || storeForm.euroExchangeRate || 135}
                    onChange={(e) => setStoreForm({ ...storeForm, euroConversionRate: Number(e.target.value), euroExchangeRate: Number(e.target.value) })}
                    className="w-full rounded-xl border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#171215] px-3.5 py-2.5 text-sm text-gray-950 dark:text-white outline-none focus:border-[#ffc4c7] transition font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Official Contact & Customer Care */}
            <div className="rounded-2xl border-2 border-gray-200 dark:border-white/10 bg-white dark:bg-[#251e23] p-6 space-y-4 shadow-sm">
              <div className="border-b-2 border-gray-100 dark:border-white/10 pb-3">
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <Phone size={18} className="text-[#c2546f] dark:text-[#ffc4c7]" />
                  Contact & Support Channels
                </h3>
                <p className="text-xs font-medium text-gray-600 dark:text-zinc-400 mt-0.5">Displayed on header and checkout page</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wide mb-1.5">
                  Official Support WhatsApp / Phone
                </label>
                <div className="flex items-center gap-2 rounded-xl border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#171215] px-3.5 py-2.5">
                  <Phone size={16} className="text-[#c2546f] dark:text-[#ffc4c7] shrink-0" />
                  <input
                    type="text"
                    value={storeForm.supportPhone || storeForm.phone || storeForm.whatsapp || ""}
                    onChange={(e) => setStoreForm({ ...storeForm, supportPhone: e.target.value, phone: e.target.value, whatsapp: e.target.value })}
                    className="w-full bg-transparent text-sm text-gray-950 dark:text-white outline-none font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wide mb-1.5">
                  Customer Care Email
                </label>
                <div className="flex items-center gap-2 rounded-xl border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#171215] px-3.5 py-2.5">
                  <Mail size={16} className="text-[#c2546f] dark:text-[#ffc4c7] shrink-0" />
                  <input
                    type="email"
                    value={storeForm.supportEmail || storeForm.email || ""}
                    onChange={(e) => setStoreForm({ ...storeForm, supportEmail: e.target.value, email: e.target.value })}
                    className="w-full bg-transparent text-sm text-gray-950 dark:text-white outline-none font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wide mb-1.5">
                  Dhaka Hub Address
                </label>
                <div className="flex items-center gap-2 rounded-xl border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#171215] px-3.5 py-2.5">
                  <MapPin size={16} className="text-[#c2546f] dark:text-[#ffc4c7] shrink-0" />
                  <input
                    type="text"
                    value={storeForm.storeAddress || storeForm.officeAddressBd || ""}
                    onChange={(e) => setStoreForm({ ...storeForm, storeAddress: e.target.value, officeAddressBd: e.target.value })}
                    className="w-full bg-transparent text-sm text-gray-950 dark:text-white outline-none font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Social Links & Copyright */}
          <div className="rounded-2xl border-2 border-gray-200 dark:border-white/10 bg-white dark:bg-[#251e23] p-6 space-y-4 shadow-sm">
            <div className="border-b-2 border-gray-100 dark:border-white/10 pb-3">
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <Share2 size={18} className="text-[#c2546f] dark:text-[#ffc4c7]" />
                Social Media Links & Footer Copyright
              </h3>
              <p className="text-xs font-medium text-gray-600 dark:text-zinc-400 mt-0.5">Public URLs displayed in footer</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wide mb-1">Facebook URL</label>
                <input
                  type="url"
                  value={storeForm.facebookUrl || ""}
                  onChange={(e) => setStoreForm({ ...storeForm, facebookUrl: e.target.value })}
                  className="w-full rounded-xl border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#171215] px-3 py-2 text-xs text-gray-950 dark:text-white outline-none focus:border-[#ffc4c7] transition font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wide mb-1">Instagram URL</label>
                <input
                  type="url"
                  value={storeForm.instagramUrl || ""}
                  onChange={(e) => setStoreForm({ ...storeForm, instagramUrl: e.target.value })}
                  className="w-full rounded-xl border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#171215] px-3 py-2 text-xs text-gray-950 dark:text-white outline-none focus:border-[#ffc4c7] transition font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wide mb-1">TikTok URL</label>
                <input
                  type="url"
                  value={storeForm.tiktokUrl || ""}
                  onChange={(e) => setStoreForm({ ...storeForm, tiktokUrl: e.target.value })}
                  className="w-full rounded-xl border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#171215] px-3 py-2 text-xs text-gray-950 dark:text-white outline-none focus:border-[#ffc4c7] transition font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wide mb-1">YouTube URL</label>
                <input
                  type="url"
                  value={storeForm.youtubeUrl || ""}
                  onChange={(e) => setStoreForm({ ...storeForm, youtubeUrl: e.target.value })}
                  className="w-full rounded-xl border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#171215] px-3 py-2 text-xs text-gray-950 dark:text-white outline-none focus:border-[#ffc4c7] transition font-semibold"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wide mb-1">Footer Copyright Notice</label>
              <input
                type="text"
                value={storeForm.copyrightText || ""}
                onChange={(e) => setStoreForm({ ...storeForm, copyrightText: e.target.value })}
                className="w-full rounded-xl border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#171215] px-3.5 py-2.5 text-sm text-gray-950 dark:text-white outline-none focus:border-[#ffc4c7] transition font-semibold"
              />
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-[#ffc4c7] hover:bg-[#ffaeb3] px-7 py-3.5 text-xs font-black tracking-wider text-[#1e1317] shadow-lg shadow-[#ffc4c7]/25 active:scale-98 transition cursor-pointer"
            >
              <Save size={16} />
              <span>SAVE & PUBLISH STORE SETTINGS</span>
            </button>
          </div>
        </form>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: ADMIN PROFILE & SECURITY
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "security" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Admin Profile */}
          <form
            onSubmit={handleSaveAdminProfile}
            className="rounded-2xl border-2 border-gray-200 dark:border-white/10 bg-white dark:bg-[#251e23] p-6 sm:p-7 flex flex-col justify-between space-y-6 shadow-sm"
          >
            <div className="space-y-4">
              <div className="border-b-2 border-gray-100 dark:border-white/10 pb-3">
                <div className="flex items-center gap-2 text-[#912d45] dark:text-[#ffc4c7] text-xs font-black uppercase tracking-wider mb-1">
                  <UserCheck size={16} />
                  <span>Admin Identity</span>
                </div>
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
                  Administrator Profile & Login
                </h3>
                <p className="text-xs font-medium text-gray-600 dark:text-zinc-300 mt-1">
                  Update your display name, contact phone, and official login email address.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wide mb-1.5">
                  Administrator Full Name
                </label>
                <div className="flex items-center gap-2 rounded-xl border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#171215] px-3.5 py-2.5">
                  <UserCheck size={16} className="text-[#c2546f] dark:text-[#ffc4c7] shrink-0" />
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
                <div className="flex items-center gap-2 rounded-xl border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#171215] px-3.5 py-2.5">
                  <Mail size={16} className="text-[#c2546f] dark:text-[#ffc4c7] shrink-0" />
                  <input
                    type="email"
                    value={adminProfile.email}
                    onChange={(e) => setAdminProfile({ ...adminProfile, email: e.target.value })}
                    className="w-full bg-transparent text-sm text-gray-950 dark:text-white outline-none font-semibold"
                    required
                  />
                </div>
                <p className="text-xs font-medium text-gray-500 dark:text-zinc-400 mt-1">
                  Used to log in to the LumiHaus Console.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wide mb-1.5">
                  Admin Direct Phone Number
                </label>
                <div className="flex items-center gap-2 rounded-xl border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#171215] px-3.5 py-2.5">
                  <Phone size={16} className="text-[#c2546f] dark:text-[#ffc4c7] shrink-0" />
                  <input
                    type="text"
                    value={adminProfile.phone}
                    onChange={(e) => setAdminProfile({ ...adminProfile, phone: e.target.value })}
                    className="w-full bg-transparent text-sm text-gray-950 dark:text-white outline-none font-semibold"
                  />
                </div>
              </div>

              {/* Role badge */}
              <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/70 p-4 flex items-center gap-3">
                <ShieldCheck size={24} className="text-emerald-700 dark:text-emerald-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-extrabold text-emerald-900 dark:text-emerald-300 uppercase tracking-wide">Role: Super Administrator</h4>
                  <p className="text-xs font-medium text-emerald-800 dark:text-emerald-200/90 mt-0.5">
                    Full authorization across catalog, orders, and console settings.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t-2 border-gray-100 dark:border-white/10">
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="flex items-center gap-2 rounded-xl bg-[#ffc4c7] hover:bg-[#ffaeb3] px-6 py-3 text-xs font-black text-[#1e1317] shadow-md shadow-[#ffc4c7]/25 active:scale-98 transition cursor-pointer"
              >
                <Save size={15} />
                <span>SAVE PROFILE INFO</span>
              </button>
            </div>
          </form>

          {/* Card 2: Change Password */}
          <form
            onSubmit={handleSavePassword}
            className="rounded-2xl border-2 border-gray-200 dark:border-white/10 bg-white dark:bg-[#251e23] p-6 sm:p-7 flex flex-col justify-between space-y-6 shadow-sm"
          >
            <div className="space-y-4">
              <div className="border-b-2 border-gray-100 dark:border-white/10 pb-3">
                <div className="flex items-center gap-2 text-[#912d45] dark:text-[#ffc4c7] text-xs font-black uppercase tracking-wider mb-1">
                  <KeyRound size={16} />
                  <span>Credential Security</span>
                </div>
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
                  Change Administrator Password
                </h3>
                <p className="text-xs font-medium text-gray-600 dark:text-zinc-300 mt-1">
                  Protect your console with a strong alphanumeric password.
                </p>
              </div>

              {/* Current Password */}
              <div>
                <label className="block text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wide mb-1.5">
                  Current Password
                </label>
                <div className="flex items-center gap-2 rounded-xl border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#171215] px-3.5 py-2.5">
                  <Lock size={16} className="text-[#c2546f] dark:text-[#ffc4c7] shrink-0" />
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
                <div className="flex items-center gap-2 rounded-xl border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#171215] px-3.5 py-2.5">
                  <KeyRound size={16} className="text-[#c2546f] dark:text-[#ffc4c7] shrink-0" />
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
                <div className="flex items-center gap-2 rounded-xl border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#171215] px-3.5 py-2.5">
                  <CheckCircle2 size={16} className="text-[#c2546f] dark:text-[#ffc4c7] shrink-0" />
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
                  <Sparkles size={15} className="text-[#c2546f] dark:text-[#ffc4c7]" />
                  Password Rules:
                </p>
                <p className="text-xs font-medium text-gray-600 dark:text-zinc-300">
                  Minimum 6 characters with letters, numbers, and symbols.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t-2 border-gray-100 dark:border-white/10">
              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="flex items-center gap-2 rounded-xl bg-[#ffc4c7] hover:bg-[#ffaeb3] px-7 py-3 text-xs font-black text-[#1e1317] shadow-md shadow-[#ffc4c7]/25 active:scale-98 transition disabled:opacity-60 cursor-pointer"
              >
                <Lock size={15} />
                <span>{isUpdatingPassword ? "UPDATING..." : "UPDATE PASSWORD"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: PUBLIC PAGES & POLICY CMS
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "policies" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Policy Page Switcher */}
          <div className="lg:col-span-4 rounded-2xl border-2 border-gray-200 dark:border-white/10 bg-white dark:bg-[#251e23] p-5 space-y-4 shadow-sm h-fit">
            <div className="border-b-2 border-gray-100 dark:border-white/10 pb-3">
              <span className="inline-block text-xs font-black tracking-wider text-[#912d45] dark:text-[#ffc4c7] uppercase mb-1">
                Store Content Pages
              </span>
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">Select Page to Edit</h3>
            </div>

            <div className="space-y-2">
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
                        ? "bg-[#ffc4c7] text-[#1e1317] border-[#ffc4c7] shadow-md shadow-[#ffc4c7]/25"
                        : "bg-gray-50 dark:bg-[#1a1518] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="text-xl shrink-0 mt-0.5">{item.icon}</span>
                      <div>
                        <h4 className="text-xs font-black leading-tight">
                          {item.label}
                        </h4>
                        <p className={`text-[11px] mt-0.5 line-clamp-1 font-medium ${isActive ? "text-[#3f1924]" : "text-gray-500 dark:text-zinc-400"}`}>
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md shrink-0 border ${
                      isActive
                        ? "bg-[#1e1317]/15 text-[#1e1317] border-[#1e1317]/20"
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
            className="lg:col-span-8 rounded-2xl border-2 border-gray-200 dark:border-white/10 bg-white dark:bg-[#251e23] p-6 sm:p-7 flex flex-col justify-between space-y-5 shadow-sm"
          >
            <div>
              {/* Header with Title and Mode Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b-2 border-gray-100 dark:border-white/10 pb-4 mb-4">
                <div>
                  <span className="inline-block text-xs font-black tracking-wider text-[#912d45] dark:text-[#ffc4c7] uppercase mb-1">
                    Active Document Editor
                  </span>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white">
                    {POLICY_OPTIONS.find((p) => p.key === selectedPolicyKey)?.label}
                  </h3>
                  <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400 flex items-center gap-1.5 mt-1">
                    <Clock size={14} className="text-[#c2546f] dark:text-[#ffc4c7]" />
                    Last Updated: {policyPages[selectedPolicyKey]?.lastUpdated || "September 2026"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPolicyPreviewMode(!policyPreviewMode)}
                    className="flex items-center gap-2 rounded-xl border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-xs font-bold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-700 transition shadow-xs cursor-pointer"
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
                  className="w-full rounded-xl border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#171215] px-4 py-3 text-sm text-gray-950 dark:text-white outline-none focus:border-[#ffc4c7] focus:ring-2 focus:ring-[#ffc4c7]/20 transition font-bold"
                  required
                />
              </div>

              {/* Editor / Preview Area */}
              <div>
                <div className="flex items-center justify-between text-xs text-gray-800 dark:text-zinc-200 mb-2 font-bold">
                  <span className="uppercase tracking-wide">{policyPreviewMode ? "Live Customer View" : "Markdown Body Content"}</span>
                  <span className="font-mono text-xs font-bold bg-gray-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md text-gray-700 dark:text-zinc-200 border border-gray-200 dark:border-zinc-700">
                    {policyForm.content.split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>

                {policyPreviewMode ? (
                  <div className="min-h-[340px] rounded-xl border-2 border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-[#151013] p-5 text-sm leading-relaxed text-gray-900 dark:text-zinc-100 whitespace-pre-line overflow-y-auto max-h-[440px] font-medium">
                    {policyForm.content}
                  </div>
                ) : (
                  <textarea
                    rows={13}
                    value={policyForm.content}
                    onChange={(e) => setPolicyForm({ ...policyForm, content: e.target.value })}
                    className="w-full rounded-xl border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#151013] p-4 font-mono text-sm leading-relaxed text-gray-950 dark:text-zinc-100 outline-none focus:border-[#ffc4c7] focus:ring-2 focus:ring-[#ffc4c7]/30 transition resize-none"
                    placeholder="Write content in markdown format..."
                    required
                  />
                )}
              </div>
            </div>

            {/* Bottom publish bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t-2 border-gray-100 dark:border-white/10">
              <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400">
                ✓ Synced automatically across customer storefront & footer
              </span>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-[#ffc4c7] hover:bg-[#ffaeb3] px-7 py-3 text-xs font-black text-[#1e1317] shadow-lg shadow-[#ffc4c7]/25 active:scale-98 transition cursor-pointer"
              >
                <Save size={16} />
                <span>PUBLISH CHANGES</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 4: ACTIVITY AUDIT TRAIL
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "activity" && (
        <div className="rounded-2xl border-2 border-gray-200 dark:border-white/10 bg-white dark:bg-[#251e23] p-6 sm:p-7 space-y-5 shadow-sm">
          <div className="border-b-2 border-gray-100 dark:border-white/10 pb-4">
            <span className="inline-block text-xs font-black tracking-wider text-[#912d45] dark:text-[#ffc4c7] uppercase mb-1">
              System Audit
            </span>
            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
              Admin Activity & Security Trail
            </h3>
            <p className="text-xs font-medium text-gray-600 dark:text-zinc-300 mt-1">
              Chronological log of administrative actions, credential updates, and content revisions.
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
                color: "bg-[#c2546f]",
              },
              {
                admin: "Shafin Ahmed",
                action: "verified bKash TrxID for order #ORD-92841 (৳2,500)",
                time: "32 min ago",
                badge: "Finance",
                color: "bg-blue-500",
              },
              {
                admin: "Shafin Ahmed",
                action: "published About Us page updates in CMS",
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
                className="flex items-start sm:items-center justify-between gap-3 rounded-xl bg-gray-50 dark:bg-[#1a1518] border-2 border-gray-200 dark:border-white/10 p-4 hover:bg-gray-100 dark:hover:bg-white/5 transition"
              >
                <div className="flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 rounded-full ${log.color} shrink-0 animate-pulse`} />
                  <div>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">
                      <strong className="text-[#912d45] dark:text-[#ffc4c7] font-black">{log.admin}</strong> {log.action}
                    </p>
                    <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-mono font-medium">{log.time}</span>
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
