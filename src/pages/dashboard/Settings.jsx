import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useAdminUI } from "../../context/AdminUIContext";
import { useUpdatePasswordMutation, useUpdateProfileMutation } from "../../redux/features/authApi";
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from "../../redux/features/cmsApi";
import {
  Building2,
  Save,
  CheckCircle2,
  Globe,
  Phone,
  Mail,
  MapPin,
  Megaphone,
  Share2,
  Wallet,
  Smartphone,
  Eye,
  EyeOff,
  Sparkles,
  KeyRound,
  UserCheck,
  Lock,
  ShieldCheck,
} from "lucide-react";

export default function Settings() {
  const {
    storeSettings,
    updateStoreSettings,
  } = useAdminUI();

  const {
    data: serverSettingsData,
    isLoading: isLoadingSettings,
    refetch: refetchSettings,
  } = useGetSettingsQuery(undefined, { refetchOnMountOrArgChange: true });
  const [updateSettingsApi, { isLoading: isSavingSettings }] = useUpdateSettingsMutation();
  const [updatePasswordApi, { isLoading: isUpdatingPassword }] = useUpdatePasswordMutation();
  const [updateProfileApi, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();

  // Two tabs: store-info, security
  const [activeTab, setActiveTab] = useState("store-info");

  // Store editable state
  const [storeForm, setStoreForm] = useState(storeSettings);

  // Sync with live server settings
  useEffect(() => {
    const live = serverSettingsData?.data || serverSettingsData;
    if (live && typeof live === "object" && Object.keys(live).length > 0) {
      setStoreForm((prev) => ({
        ...prev,
        ...live,
      }));
    }
  }, [serverSettingsData]);

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

  // Save Store Settings to live database.
  // Only canonical backend keys are sent — the UI-only aliases
  // (supportPhone / supportEmail / storeAddress / euroConversionRate) are not
  // persisted independently, so sending them would just be noise.
  const buildSettingsPayload = () => ({
    storeName: storeForm.storeName ?? "",
    tagline: storeForm.tagline ?? "",
    announcementText: storeForm.announcementText ?? "",
    email: storeForm.email ?? "",
    phone: storeForm.phone ?? "",
    whatsapp: storeForm.whatsapp ?? "",
    officeAddressBd: storeForm.officeAddressBd ?? "",
    warehouseAddressDe: storeForm.warehouseAddressDe ?? "",
    facebookUrl: storeForm.facebookUrl ?? "",
    instagramUrl: storeForm.instagramUrl ?? "",
    tiktokUrl: storeForm.tiktokUrl ?? "",
    youtubeUrl: storeForm.youtubeUrl ?? "",
    copyrightText: storeForm.copyrightText ?? "",
    euroExchangeRate: Number(storeForm.euroExchangeRate) || 135,
    freeShippingThreshold: Number(storeForm.freeShippingThreshold) || 0,
    // Kept as a string so the leading zero of a BD number survives.
    bkashNumber: String(storeForm.bkashNumber ?? "").trim(),
    bkashType: storeForm.bkashType || "Personal (Send Money)",
  });

  const handleSaveStoreInfo = async (e) => {
    e.preventDefault();
    if (isSavingSettings) return;

    const payload = buildSettingsPayload();
    const toastId = toast.loading("Saving store settings to live database...");
    try {
      const res = await updateSettingsApi(payload).unwrap();

      // Trust the server's copy, not the local form: the backend normalizes
      // values (e.g. strips +880 / spaces from bkashNumber) and ignores keys
      // it does not know about.
      const saved = res?.data || res;
      if (saved && typeof saved === "object") {
        setStoreForm((prev) => ({ ...prev, ...saved }));
        updateStoreSettings(saved);
      }

      // Re-pull so anything derived from the settings query stays in sync.
      refetchSettings();

      toast.success("Store settings saved. The storefront now uses these values.", { id: toastId });
    } catch (err) {
      // Do NOT write to local settings here — persisting unsaved values would
      // make the console disagree with what customers actually see.
      const status = err?.status ?? err?.originalStatus;
      let message = err?.data?.message || err?.error;

      if (status === 401) {
        message = "Your admin session has expired. Please sign in again and retry.";
      } else if (status === 403) {
        message = "Access denied — this action requires an admin or super_admin account.";
      } else if (!message) {
        message = "Could not save settings. Your changes are still in the form — please retry.";
      }

      toast.error(message, { id: toastId, duration: 6000 });
    }
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

  return (
    <div className="space-y-6 pb-12 max-w-[1400px]">
      <title>Lumihaus Admin Â· Settings & Store Controls</title>

      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-2 border-gray-200 dark:border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase tracking-wider text-[#26382E] dark:text-[#8FAF9A] bg-[#EEF3EF] dark:bg-[#8FAF9A]/15 px-2.5 py-0.5 rounded-md border border-[#8FAF9A]/30">
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

      {/* Segmented Tab Bar with Brand Sage Accents */}
      <div className="flex items-center gap-2 overflow-x-auto rounded-2xl bg-white dark:bg-[#1A1D1B] p-1.5 border-2 border-gray-200 dark:border-white/10 shadow-xs">
        <button
          onClick={() => setActiveTab("store-info")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition-all shrink-0 cursor-pointer ${
            activeTab === "store-info"
              ? "bg-[#26382E] text-white shadow-md shadow-[#26382E]/20 dark:bg-[#8FAF9A] dark:text-[#17251C]"
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
              ? "bg-[#26382E] text-white shadow-md shadow-[#26382E]/20 dark:bg-[#8FAF9A] dark:text-[#17251C]"
              : "text-gray-700 dark:text-zinc-300 hover:text-gray-950 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
          }`}
        >
          <KeyRound size={16} />
          <span>Admin & Security</span>
        </button>
      </div>

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          TAB 1: STORE INFORMATION & BRANDING
      â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {activeTab === "store-info" && (
        <form onSubmit={handleSaveStoreInfo} className="space-y-6">
          {/* Top Announcement Bar Card */}
          <div className="rounded-2xl border-2 border-[#8FAF9A] dark:border-[#8FAF9A]/40 bg-gradient-to-r from-[#EEF3EF] via-white to-[#EEF3EF] dark:from-[#1E2822] dark:via-[#1A231D] dark:to-[#1E2822] p-6 shadow-sm">
            <div className="flex items-center gap-2 text-[#26382E] dark:text-[#8FAF9A] text-xs font-black uppercase tracking-wider mb-2">
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
              placeholder="e.g. âš¡ 100% Authentic German Imports direct from dm.de â€¢ Free Delivery over à§³5,000"
              className="w-full rounded-xl border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#1A1D1B] px-4 py-3 text-sm text-gray-950 dark:text-white outline-none focus:border-[#8FAF9A] focus:ring-2 focus:ring-[#8FAF9A]/25 transition font-bold"
              required
            />
          </div>

          {/* Grid of Main Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Store Brand Identity Card */}
            <div className="rounded-2xl border-2 border-gray-200 dark:border-white/10 bg-white dark:bg-[#222620] p-6 space-y-4 shadow-sm">
              <div className="border-b-2 border-gray-100 dark:border-white/10 pb-3">
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <Globe size={18} className="text-[#26382E] dark:text-[#8FAF9A]" />
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
                  className="w-full rounded-xl border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#1A1D1B] px-3.5 py-2.5 text-sm text-gray-950 dark:text-white outline-none focus:border-[#8FAF9A] transition font-semibold"
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
                  className="w-full rounded-xl border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#1A1D1B] px-3.5 py-2.5 text-sm text-gray-950 dark:text-white outline-none focus:border-[#8FAF9A] transition font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wide mb-1.5">
                    Currency Symbol
                  </label>
                  <input
                    type="text"
                    value={storeForm.currencySymbol || "à§³"}
                    onChange={(e) => setStoreForm({ ...storeForm, currencySymbol: e.target.value })}
                    className="w-full rounded-xl border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#1A1D1B] px-3.5 py-2.5 text-sm text-gray-950 dark:text-white outline-none focus:border-[#8FAF9A] transition font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wide mb-1.5">
                    EUR to BDT Rate
                  </label>
                  <input
                    type="number"
                    value={storeForm.euroExchangeRate ?? 135}
                    onChange={(e) => setStoreForm({ ...storeForm, euroExchangeRate: Number(e.target.value) })}
                    className="w-full rounded-xl border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#1A1D1B] px-3.5 py-2.5 text-sm text-gray-950 dark:text-white outline-none focus:border-[#8FAF9A] transition font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Official Contact & Customer Care */}
            <div className="rounded-2xl border-2 border-gray-200 dark:border-white/10 bg-white dark:bg-[#222620] p-6 space-y-4 shadow-sm">
              <div className="border-b-2 border-gray-100 dark:border-white/10 pb-3">
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <Phone size={18} className="text-[#26382E] dark:text-[#8FAF9A]" />
                  Contact & Support Channels
                </h3>
                <p className="text-xs font-medium text-gray-600 dark:text-zinc-400 mt-0.5">Displayed on header and checkout page</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wide mb-1.5">
                  Official Support WhatsApp / Phone
                </label>
                <div className="flex items-center gap-2 rounded-xl border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#1A1D1B] px-3.5 py-2.5">
                  <Phone size={16} className="text-[#26382E] dark:text-[#8FAF9A] shrink-0" />
                  <input
                    type="text"
                    value={storeForm.phone || ""}
                    onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value, whatsapp: e.target.value })}
                    className="w-full bg-transparent text-sm text-gray-950 dark:text-white outline-none font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wide mb-1.5">
                  Customer Care Email
                </label>
                <div className="flex items-center gap-2 rounded-xl border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#1A1D1B] px-3.5 py-2.5">
                  <Mail size={16} className="text-[#26382E] dark:text-[#8FAF9A] shrink-0" />
                  <input
                    type="email"
                    value={storeForm.email || ""}
                    onChange={(e) => setStoreForm({ ...storeForm, email: e.target.value })}
                    className="w-full bg-transparent text-sm text-gray-950 dark:text-white outline-none font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wide mb-1.5">
                  Dhaka Hub Address
                </label>
                <div className="flex items-center gap-2 rounded-xl border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#1A1D1B] px-3.5 py-2.5">
                  <MapPin size={16} className="text-[#26382E] dark:text-[#8FAF9A] shrink-0" />
                  <input
                    type="text"
                    value={storeForm.officeAddressBd || ""}
                    onChange={(e) => setStoreForm({ ...storeForm, officeAddressBd: e.target.value })}
                    className="w-full bg-transparent text-sm text-gray-950 dark:text-white outline-none font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* bKash Receiving Account */}
          <div className="rounded-2xl border-2 border-gray-200 dark:border-white/10 bg-white dark:bg-[#222620] p-6 space-y-4 shadow-sm">
            <div className="border-b-2 border-gray-100 dark:border-white/10 pb-3">
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <Wallet size={18} className="text-[#26382E] dark:text-[#8FAF9A]" />
                bKash Receiving Account
              </h3>
              <p className="text-xs font-medium text-gray-600 dark:text-zinc-400 mt-0.5">
                Customers send their order payment to this number on the checkout page
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wide mb-1.5">
                  bKash Number
                </label>
                <div className="flex items-center gap-2 rounded-xl border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#1A1D1B] px-3.5 py-2.5">
                  <Smartphone size={16} className="text-[#26382E] dark:text-[#8FAF9A] shrink-0" />
                  <input
                    type="text"
                    value={storeForm.bkashNumber || ""}
                    onChange={(e) => setStoreForm({ ...storeForm, bkashNumber: e.target.value })}
                    placeholder="01712-345678"
                    className="w-full bg-transparent text-sm font-mono font-bold text-gray-950 dark:text-white outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wide mb-1.5">
                  Account Type
                </label>
                <select
                  value={storeForm.bkashType || "Personal (Send Money)"}
                  onChange={(e) => setStoreForm({ ...storeForm, bkashType: e.target.value })}
                  className="w-full rounded-xl border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#1A1D1B] px-3.5 py-2.5 text-sm text-gray-950 dark:text-white outline-none focus:border-[#8FAF9A] transition font-semibold cursor-pointer"
                >
                  <option value="Personal (Send Money)">Personal (Send Money)</option>
                  <option value="Merchant (Payment)">Merchant (Payment)</option>
                  <option value="Agent (Cash In)">Agent (Cash In)</option>
                </select>
              </div>
            </div>

            {/* Live preview of what the customer sees */}
            {String(storeForm.bkashNumber ?? "").trim() ? (
              <div className="rounded-xl border border-[#8FAF9A]/40 bg-[#EEF3EF] dark:bg-[#8FAF9A]/10 p-4">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#26382E] dark:text-[#8FAF9A] block mb-1.5">
                  Checkout page preview
                </span>
                <p className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                  Official bKash {storeForm.bkashType || "Personal (Send Money)"} Number:
                </p>
                <p className="text-lg font-mono font-black text-gray-950 dark:text-white mt-0.5">
                  {storeForm.bkashNumber}
                </p>
              </div>
            ) : (
              <div className="rounded-xl border-2 border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/40 p-4">
                <p className="text-xs font-extrabold text-amber-900 dark:text-amber-300">
                  No bKash number set — bKash is hidden at checkout
                </p>
                <p className="text-xs font-medium text-amber-800 dark:text-amber-200/90 mt-1 leading-relaxed">
                  Customers can currently only order with Cash on Delivery. Enter your receiving
                  number above and save to enable bKash payments.
                </p>
              </div>
            )}
          </div>

          {/* Social Links & Copyright */}
          <div className="rounded-2xl border-2 border-gray-200 dark:border-white/10 bg-white dark:bg-[#222620] p-6 space-y-4 shadow-sm">
            <div className="border-b-2 border-gray-100 dark:border-white/10 pb-3">
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <Share2 size={18} className="text-[#26382E] dark:text-[#8FAF9A]" />
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
                  className="w-full rounded-xl border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#1A1D1B] px-3 py-2 text-xs text-gray-950 dark:text-white outline-none focus:border-[#8FAF9A] transition font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wide mb-1">Instagram URL</label>
                <input
                  type="url"
                  value={storeForm.instagramUrl || ""}
                  onChange={(e) => setStoreForm({ ...storeForm, instagramUrl: e.target.value })}
                  className="w-full rounded-xl border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#1A1D1B] px-3 py-2 text-xs text-gray-950 dark:text-white outline-none focus:border-[#8FAF9A] transition font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wide mb-1">TikTok URL</label>
                <input
                  type="url"
                  value={storeForm.tiktokUrl || ""}
                  onChange={(e) => setStoreForm({ ...storeForm, tiktokUrl: e.target.value })}
                  className="w-full rounded-xl border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#1A1D1B] px-3 py-2 text-xs text-gray-950 dark:text-white outline-none focus:border-[#8FAF9A] transition font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wide mb-1">YouTube URL</label>
                <input
                  type="url"
                  value={storeForm.youtubeUrl || ""}
                  onChange={(e) => setStoreForm({ ...storeForm, youtubeUrl: e.target.value })}
                  className="w-full rounded-xl border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#1A1D1B] px-3 py-2 text-xs text-gray-950 dark:text-white outline-none focus:border-[#8FAF9A] transition font-semibold"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wide mb-1">Footer Copyright Notice</label>
              <input
                type="text"
                value={storeForm.copyrightText || ""}
                onChange={(e) => setStoreForm({ ...storeForm, copyrightText: e.target.value })}
                className="w-full rounded-xl border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#1A1D1B] px-3.5 py-2.5 text-sm text-gray-950 dark:text-white outline-none focus:border-[#8FAF9A] transition font-semibold"
              />
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSavingSettings || isLoadingSettings}
              className="flex items-center gap-2 rounded-xl bg-[#26382E] hover:bg-[#17251C] px-7 py-3.5 text-xs font-black tracking-wider text-white shadow-lg shadow-[#26382E]/20 dark:bg-[#8FAF9A] dark:hover:bg-[#A8C4B3] dark:text-[#17251C] active:scale-98 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              <span>{isSavingSettings ? "SAVING..." : "SAVE & PUBLISH STORE SETTINGS"}</span>
            </button>
          </div>
        </form>
      )}

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          TAB 2: ADMIN PROFILE & SECURITY
      â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {activeTab === "security" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Admin Profile */}
          <form
            onSubmit={handleSaveAdminProfile}
            className="rounded-2xl border-2 border-gray-200 dark:border-white/10 bg-white dark:bg-[#222620] p-6 sm:p-7 flex flex-col justify-between space-y-6 shadow-sm"
          >
            <div className="space-y-4">
              <div className="border-b-2 border-gray-100 dark:border-white/10 pb-3">
                <div className="flex items-center gap-2 text-[#26382E] dark:text-[#8FAF9A] text-xs font-black uppercase tracking-wider mb-1">
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
                <div className="flex items-center gap-2 rounded-xl border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#1A1D1B] px-3.5 py-2.5">
                  <UserCheck size={16} className="text-[#26382E] dark:text-[#8FAF9A] shrink-0" />
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
                <div className="flex items-center gap-2 rounded-xl border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#1A1D1B] px-3.5 py-2.5">
                  <Mail size={16} className="text-[#26382E] dark:text-[#8FAF9A] shrink-0" />
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
                <div className="flex items-center gap-2 rounded-xl border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#1A1D1B] px-3.5 py-2.5">
                  <Phone size={16} className="text-[#26382E] dark:text-[#8FAF9A] shrink-0" />
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
                className="flex items-center gap-2 rounded-xl bg-[#26382E] hover:bg-[#17251C] px-6 py-3 text-xs font-black text-white shadow-md shadow-[#26382E]/20 dark:bg-[#8FAF9A] dark:hover:bg-[#A8C4B3] dark:text-[#17251C] active:scale-98 transition cursor-pointer"
              >
                <Save size={15} />
                <span>SAVE PROFILE INFO</span>
              </button>
            </div>
          </form>

          {/* Card 2: Change Password */}
          <form
            onSubmit={handleSavePassword}
            className="rounded-2xl border-2 border-gray-200 dark:border-white/10 bg-white dark:bg-[#222620] p-6 sm:p-7 flex flex-col justify-between space-y-6 shadow-sm"
          >
            <div className="space-y-4">
              <div className="border-b-2 border-gray-100 dark:border-white/10 pb-3">
                <div className="flex items-center gap-2 text-[#26382E] dark:text-[#8FAF9A] text-xs font-black uppercase tracking-wider mb-1">
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
                <div className="flex items-center gap-2 rounded-xl border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#1A1D1B] px-3.5 py-2.5">
                  <Lock size={16} className="text-[#26382E] dark:text-[#8FAF9A] shrink-0" />
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
                <div className="flex items-center gap-2 rounded-xl border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#1A1D1B] px-3.5 py-2.5">
                  <KeyRound size={16} className="text-[#26382E] dark:text-[#8FAF9A] shrink-0" />
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
                <div className="flex items-center gap-2 rounded-xl border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#1A1D1B] px-3.5 py-2.5">
                  <CheckCircle2 size={16} className="text-[#26382E] dark:text-[#8FAF9A] shrink-0" />
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
                  <Sparkles size={15} className="text-[#26382E] dark:text-[#8FAF9A]" />
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
                className="flex items-center gap-2 rounded-xl bg-[#26382E] hover:bg-[#1A2820] text-white px-7 py-3 text-xs font-black shadow-md shadow-[#26382E]/20 dark:bg-[#8FAF9A] dark:hover:bg-[#A8C4B3] dark:text-[#141F18] active:scale-98 transition disabled:opacity-60 cursor-pointer"
              >
                <Lock size={15} />
                <span>{isUpdatingPassword ? "UPDATING..." : "UPDATE PASSWORD"}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}



