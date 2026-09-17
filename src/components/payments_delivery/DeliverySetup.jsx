import { useState, useEffect } from "react";
import { Save, AlertTriangle, RefreshCw, Info } from "lucide-react";
import toast from "react-hot-toast";
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from "../../redux/features/cmsApi";

const COURIERS = ["Pathao", "Steadfast", "RedX", "Paperfly"];
const MAX_ETA = 80;

const FIELDS = [
  "insideDhakaFee",
  "outsideDhakaFee",
  "freeShippingThreshold",
  "courierPartner",
  "insideDhakaEta",
  "outsideDhakaEta",
];

export default function DeliverySetup() {
  const { data, isLoading, isError, error, refetch } = useGetSettingsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [updateSettings, { isLoading: isSaving }] = useUpdateSettingsMutation();

  const [form, setForm] = useState(null);
  // Server snapshot, so we only PUT what actually changed.
  const [baseline, setBaseline] = useState(null);

  useEffect(() => {
    const live = data?.data || data;
    if (!live || typeof live !== "object") return;

    const next = {
      insideDhakaFee: live.insideDhakaFee ?? 60,
      outsideDhakaFee: live.outsideDhakaFee ?? 120,
      freeShippingThreshold: live.freeShippingThreshold ?? 0,
      courierPartner: COURIERS.includes(live.courierPartner) ? live.courierPartner : "Pathao",
      insideDhakaEta: live.insideDhakaEta ?? "1-2 days",
      outsideDhakaEta: live.outsideDhakaEta ?? "3-5 days",
    };
    setForm(next);
    setBaseline(next);
  }, [data]);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    for (const key of ["insideDhakaFee", "outsideDhakaFee", "freeShippingThreshold"]) {
      const n = Number(form[key]);
      if (!Number.isFinite(n) || n < 0) {
        return `${key === "freeShippingThreshold" ? "Free shipping threshold" : "Delivery fees"} must be a number of 0 or more.`;
      }
    }
    for (const key of ["insideDhakaEta", "outsideDhakaEta"]) {
      const v = String(form[key] ?? "").trim();
      if (!v) return "Delivery time estimates cannot be empty.";
      if (v.length > MAX_ETA) return `Delivery time estimates must be ${MAX_ETA} characters or fewer.`;
    }
    if (!COURIERS.includes(form.courierPartner)) {
      return "Select a valid courier partner.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving || !form) return;

    const problem = validate();
    if (problem) {
      toast.error(problem);
      return;
    }

    const normalized = {
      insideDhakaFee: Number(form.insideDhakaFee),
      outsideDhakaFee: Number(form.outsideDhakaFee),
      freeShippingThreshold: Number(form.freeShippingThreshold),
      courierPartner: form.courierPartner,
      insideDhakaEta: String(form.insideDhakaEta).trim(),
      outsideDhakaEta: String(form.outsideDhakaEta).trim(),
    };

    // Send only supported fields that actually changed.
    const payload = {};
    FIELDS.forEach((key) => {
      if (normalized[key] !== baseline?.[key]) payload[key] = normalized[key];
    });

    if (Object.keys(payload).length === 0) {
      toast("No changes to save.");
      return;
    }

    const toastId = toast.loading("Saving delivery settings...");
    try {
      const res = await updateSettings(payload).unwrap();
      const saved = res?.data || res;
      if (saved && typeof saved === "object") {
        const next = {
          insideDhakaFee: saved.insideDhakaFee ?? normalized.insideDhakaFee,
          outsideDhakaFee: saved.outsideDhakaFee ?? normalized.outsideDhakaFee,
          freeShippingThreshold: saved.freeShippingThreshold ?? normalized.freeShippingThreshold,
          courierPartner: saved.courierPartner ?? normalized.courierPartner,
          insideDhakaEta: saved.insideDhakaEta ?? normalized.insideDhakaEta,
          outsideDhakaEta: saved.outsideDhakaEta ?? normalized.outsideDhakaEta,
        };
        setForm(next);
        setBaseline(next);
      }
      // Refresh the shared settings cache for every other consumer.
      refetch();
      toast.success("Delivery settings saved.", { id: toastId });
    } catch (err) {
      // Keep the form as-is so the admin can retry; never save locally only.
      const status = err?.status ?? err?.originalStatus;
      let message = err?.data?.message;
      if (status === 401) message = "Your admin session has expired. Please sign in again.";
      else if (status === 403) message = "Access denied — this action requires an admin account.";
      else if (!message) message = "Could not save delivery settings. Your changes are still here — please retry.";
      toast.error(message, { id: toastId, duration: 6000 });
    }
  };

  if (isError) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl text-red-800 dark:text-red-300 text-xs">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={16} />
          <span>{error?.data?.message || "Failed to load delivery settings."}</span>
        </div>
        <button onClick={() => refetch()} className="button secondary text-xs py-1 px-2.5 cursor-pointer">
          <RefreshCw size={13} /> Retry
        </button>
      </div>
    );
  }

  if (isLoading || !form) {
    return (
      <div className="py-10 text-center text-gray-500 dark:text-zinc-400">
        <div className="inline-block h-7 w-7 animate-spin rounded-full border-4 border-solid border-[#8FAF9A] border-r-transparent mb-2" />
        <p className="text-xs font-semibold">Loading delivery settings...</p>
      </div>
    );
  }

  return (
    <form className="delivery-list" onSubmit={handleSubmit}>
      <div className="delivery-row">
        <div>
          <strong>Inside Dhaka</strong>
          <input
            aria-label="Inside Dhaka delivery time"
            value={form.insideDhakaEta}
            maxLength={MAX_ETA}
            onChange={(e) => setField("insideDhakaEta", e.target.value)}
            style={{ width: "100%", marginTop: 4, fontSize: 11 }}
          />
        </div>
        <input
          aria-label="Inside Dhaka charge"
          type="number"
          min="0"
          step="1"
          value={form.insideDhakaFee}
          onChange={(e) => setField("insideDhakaFee", e.target.value)}
        />
        <span className="text-xs text-neutral-400">৳</span>
      </div>

      <div className="delivery-row">
        <div>
          <strong>Outside Dhaka</strong>
          <input
            aria-label="Outside Dhaka delivery time"
            value={form.outsideDhakaEta}
            maxLength={MAX_ETA}
            onChange={(e) => setField("outsideDhakaEta", e.target.value)}
            style={{ width: "100%", marginTop: 4, fontSize: 11 }}
          />
        </div>
        <input
          aria-label="Outside Dhaka charge"
          type="number"
          min="0"
          step="1"
          value={form.outsideDhakaFee}
          onChange={(e) => setField("outsideDhakaFee", e.target.value)}
        />
        <span className="text-xs text-neutral-400">৳</span>
      </div>

      <label>
        Free shipping over (৳)
        <input
          type="number"
          min="0"
          step="1"
          value={form.freeShippingThreshold}
          onChange={(e) => setField("freeShippingThreshold", e.target.value)}
        />
      </label>

      <label>
        Courier partner
        <select
          value={form.courierPartner}
          onChange={(e) => setField("courierPartner", e.target.value)}
        >
          {COURIERS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>

      <p className="flex items-start gap-2 text-[11px] text-neutral-500 dark:text-zinc-400 leading-relaxed">
        <Info size={13} className="shrink-0 mt-0.5 text-[#8FAF9A]" />
        <span>
          Courier selection is a preference for your own records — it does not connect to the
          courier's system or create consignments automatically.
        </span>
      </p>

      <button
        type="submit"
        className="button full-button cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={isSaving}
      >
        <Save size={15} />
        {isSaving ? "Saving..." : "Save delivery settings"}
      </button>
    </form>
  );
}
