import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useAdminUI } from "../../context/AdminUIContext";
import { useUpdatePasswordMutation, useUpdateProfileMutation } from "../../redux/features/authApi";
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from "../../redux/features/cmsApi";
import { Save, Eye, EyeOff, Lock } from "lucide-react";

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
        updateStoreSettings(saved, true);
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
    const toastId = toast.loading("Saving profile...");
    try {
      // Only the fields the backend accepts; anything else is rejected.
      const saved = await updateProfileApi({
        name: adminProfile.name,
        email: adminProfile.email,
        phone: adminProfile.phone ?? "",
      }).unwrap();
      const user = saved?.data || saved;
      // Cache only what the server confirmed.
      localStorage.setItem("lumihaus_admin_user", JSON.stringify({ ...adminProfile, ...(user || {}) }));
      toast.success("Admin profile updated successfully!", { id: toastId });
    } catch (err) {
      toast.error(err?.data?.message || "Could not save your profile. Nothing was changed.", { id: toastId, duration: 6000 });
    }
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
      // Keep the form so the admin can correct and retry.
      toast.error(err?.data?.message || "Could not change the password. It was not changed.", { id: toastId, duration: 6000 });
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-[1400px]">
      <title>Lumihaus Admin · Settings</title>

      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#141f17] dark:text-white">Settings</h1>
        <p className={`mt-1 text-sm ${MUTED}`}>Store details, payments and your admin account.</p>
      </div>

      {/* Tabs: light segmented control */}
      <div className="inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-xl bg-[#F3EDE2] p-1 dark:bg-white/5">
        {[
          { key: "store-info", label: "Store" },
          { key: "security", label: "Account & security" },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            className={`shrink-0 cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeTab === t.key
                ? "bg-white text-[#141f17] shadow-sm dark:bg-[#2C312B] dark:text-white"
                : "text-[#2E4235]/70 hover:text-[#141f17] dark:text-[#D2DDD6]/70 dark:hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: STORE */}
      {activeTab === "store-info" && (
        <form onSubmit={handleSaveStoreInfo} className="space-y-6">
          <section className={CARD}>
            <SectionHead title="Announcement bar" description="Shown at the top of every storefront page." />
            <input
              type="text"
              value={storeForm.announcementText}
              onChange={(e) => setStoreForm({ ...storeForm, announcementText: e.target.value })}
              placeholder="e.g. Free delivery over ৳5,000"
              className={INPUT}
              required
            />
          </section>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <section className={CARD}>
              <SectionHead title="Brand" />
              <div className="space-y-4">
                <Field label="Store name">
                  <input
                    type="text"
                    value={storeForm.storeName}
                    onChange={(e) => setStoreForm({ ...storeForm, storeName: e.target.value })}
                    className={INPUT}
                    required
                  />
                </Field>
                <Field label="Tagline">
                  <input
                    type="text"
                    value={storeForm.tagline}
                    onChange={(e) => setStoreForm({ ...storeForm, tagline: e.target.value })}
                    className={INPUT}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Currency symbol">
                    <input
                      type="text"
                      value={storeForm.currencySymbol || "৳"}
                      onChange={(e) => setStoreForm({ ...storeForm, currencySymbol: e.target.value })}
                      className={INPUT}
                    />
                  </Field>
                  <Field label="EUR → BDT rate">
                    <input
                      type="number"
                      value={storeForm.euroExchangeRate ?? 135}
                      onChange={(e) => setStoreForm({ ...storeForm, euroExchangeRate: Number(e.target.value) })}
                      className={INPUT}
                    />
                  </Field>
                </div>
              </div>
            </section>

            <section className={CARD}>
              <SectionHead title="Contact" description="Shown in the header and at checkout." />
              <div className="space-y-4">
                <Field label="Support phone" hint="Also used as the WhatsApp number.">
                  <input
                    type="text"
                    value={storeForm.phone || ""}
                    onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value, whatsapp: e.target.value })}
                    className={INPUT}
                  />
                </Field>
                <Field label="Support email">
                  <input
                    type="email"
                    value={storeForm.email || ""}
                    onChange={(e) => setStoreForm({ ...storeForm, email: e.target.value })}
                    className={INPUT}
                  />
                </Field>
                <Field label="Address" hint="Dhaka office.">
                  <input
                    type="text"
                    value={storeForm.officeAddressBd || ""}
                    onChange={(e) => setStoreForm({ ...storeForm, officeAddressBd: e.target.value })}
                    className={INPUT}
                  />
                </Field>
              </div>
            </section>
          </div>

          <section className={CARD}>
            <SectionHead title="bKash" description="Customers pay to this number at checkout." />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="bKash number">
                <input
                  type="text"
                  value={storeForm.bkashNumber || ""}
                  onChange={(e) => setStoreForm({ ...storeForm, bkashNumber: e.target.value })}
                  placeholder="01712-345678"
                  className={`${INPUT} font-mono`}
                  required
                />
              </Field>
              <Field label="Account type">
                <select
                  value={storeForm.bkashType || "Personal (Send Money)"}
                  onChange={(e) => setStoreForm({ ...storeForm, bkashType: e.target.value })}
                  className={`${INPUT} ${SELECT_FIX} cursor-pointer`}
                >
                  <option value="Personal (Send Money)">Personal (Send Money)</option>
                  <option value="Merchant (Payment)">Merchant (Payment)</option>
                  <option value="Agent (Cash In)">Agent (Cash In)</option>
                </select>
              </Field>
            </div>

            {String(storeForm.bkashNumber ?? "").trim() ? (
              <p className={`mt-4 text-xs ${MUTED}`}>
                Checkout shows: bKash {storeForm.bkashType || "Personal (Send Money)"} ·{" "}
                <span className="font-mono text-[#141f17] dark:text-white">{storeForm.bkashNumber}</span>
              </p>
            ) : (
              <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2.5 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                No bKash number set, so bKash is hidden at checkout and customers can only pay cash on delivery.
              </p>
            )}
          </section>

          <section className={CARD}>
            <SectionHead title="Social & footer" description="Links shown in the storefront footer." />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Facebook">
                <input
                  type="url"
                  value={storeForm.facebookUrl || ""}
                  onChange={(e) => setStoreForm({ ...storeForm, facebookUrl: e.target.value })}
                  className={INPUT}
                />
              </Field>
              <Field label="Instagram">
                <input
                  type="url"
                  value={storeForm.instagramUrl || ""}
                  onChange={(e) => setStoreForm({ ...storeForm, instagramUrl: e.target.value })}
                  className={INPUT}
                />
              </Field>
              <Field label="TikTok">
                <input
                  type="url"
                  value={storeForm.tiktokUrl || ""}
                  onChange={(e) => setStoreForm({ ...storeForm, tiktokUrl: e.target.value })}
                  className={INPUT}
                />
              </Field>
              <Field label="YouTube">
                <input
                  type="url"
                  value={storeForm.youtubeUrl || ""}
                  onChange={(e) => setStoreForm({ ...storeForm, youtubeUrl: e.target.value })}
                  className={INPUT}
                />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Copyright text">
                <input
                  type="text"
                  value={storeForm.copyrightText || ""}
                  onChange={(e) => setStoreForm({ ...storeForm, copyrightText: e.target.value })}
                  className={INPUT}
                />
              </Field>
            </div>
          </section>

          <div className="flex justify-end">
            <button type="submit" disabled={isSavingSettings || isLoadingSettings} className={BUTTON}>
              <Save size={16} />
              <span>{isSavingSettings ? "Saving…" : "Save settings"}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: ACCOUNT & SECURITY */}
      {activeTab === "security" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <form onSubmit={handleSaveAdminProfile} className={`${CARD} flex flex-col`}>
            <SectionHead
              title="Profile"
              description={`Signed in as ${adminProfile?.role === "super_admin" ? "Super Admin" : "Admin"}.`}
            />
            <div className="flex-1 space-y-4">
              <Field label="Full name">
                <input
                  type="text"
                  value={adminProfile.name}
                  onChange={(e) => setAdminProfile({ ...adminProfile, name: e.target.value })}
                  className={INPUT}
                  required
                />
              </Field>
              <Field label="Login email" hint="Used to sign in to the console.">
                <input
                  type="email"
                  value={adminProfile.email}
                  onChange={(e) => setAdminProfile({ ...adminProfile, email: e.target.value })}
                  className={INPUT}
                  required
                />
              </Field>
              <Field label="Phone">
                <input
                  type="text"
                  value={adminProfile.phone}
                  onChange={(e) => setAdminProfile({ ...adminProfile, phone: e.target.value })}
                  className={INPUT}
                />
              </Field>
            </div>
            <div className="mt-6 flex justify-end">
              <button type="submit" disabled={isUpdatingProfile} className={BUTTON}>
                <Save size={16} />
                <span>Save profile</span>
              </button>
            </div>
          </form>

          <form onSubmit={handleSavePassword} className={`${CARD} flex flex-col`}>
            <SectionHead title="Password" description="Use at least 6 characters." />
            <div className="flex-1 space-y-4">
              <Field label="Current password">
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className={`${INPUT} pr-10`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    aria-label={showPass ? "Hide passwords" : "Show passwords"}
                    className="absolute inset-y-0 right-0 flex w-10 cursor-pointer items-center justify-center text-[#2E4235]/60 hover:text-[#141f17] dark:text-[#D2DDD6]/60 dark:hover:text-white"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </Field>
              <Field label="New password">
                <input
                  type={showPass ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className={INPUT}
                  required
                />
              </Field>
              <Field label="Confirm new password">
                <input
                  type={showPass ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className={INPUT}
                  required
                />
              </Field>
            </div>
            <div className="mt-6 flex justify-end">
              <button type="submit" disabled={isUpdatingPassword} className={BUTTON}>
                <Lock size={16} />
                <span>{isUpdatingPassword ? "Updating…" : "Update password"}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

const MUTED = "text-[#2E4235]/65 dark:text-[#D2DDD6]/65";
const CARD =
  "rounded-xl border border-[#DCD6CB] bg-white p-5 sm:p-6 dark:border-white/10 dark:bg-[#222620]";
const INPUT =
  "w-full rounded-xl border border-[#DCD6CB] bg-white px-3 py-2.5 text-sm text-[#141f17] outline-none transition placeholder:text-[#2E4235]/40 focus:border-[#8FAF9A] dark:border-white/10 dark:bg-[#1A1D1B] dark:text-white dark:placeholder:text-[#D2DDD6]/35";
// A global unlayered `select {}` rule in styles.css outranks utilities, so the
// select needs important overrides to match the other inputs.
const SELECT_FIX =
  "!rounded-xl !border-[#DCD6CB] !bg-white !px-3 !py-2.5 !text-sm dark:!border-white/10 dark:!bg-[#1A1D1B]";
const BUTTON =
  "inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#26382E] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#17251C] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#8FAF9A] dark:text-[#17251C] dark:hover:bg-[#A8C4B3]";

function SectionHead({ title, description }) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-semibold text-[#141f17] dark:text-white">{title}</h2>
      {description && <p className={`mt-0.5 text-xs ${MUTED}`}>{description}</p>}
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-[#141f17] dark:text-white">{label}</span>
      {children}
      {hint && <span className={`mt-1 block text-xs ${MUTED}`}>{hint}</span>}
    </label>
  );
}
