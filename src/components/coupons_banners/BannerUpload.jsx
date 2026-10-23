import { useState, useEffect, useRef } from "react";
import {
  useGetCampaignBannerQuery,
  useUpdateCampaignBannerMutation,
} from "../../redux/features/cmsApi";
import {
  Upload,
  Image as ImageIcon,
  Save,
  Clock,
  Sparkles,
  Link as LinkIcon,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import confirmToast from "../../utils/confirmToast";

const EMPTY_CAMPAIGN = {
  isActive: true,
  bannerImage: "",
  bannerTitle: "",
  bannerSubtitle: "",
  bannerLink: "",
  flashSaleTitle: "",
  countdownEnds: "",
};

// The API stores an ISO instant; <input type="datetime-local"> needs local
// "YYYY-MM-DDTHH:mm" without a zone, so convert in both directions.
function toLocalInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function fromLocalInput(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export default function BannerUpload() {
  const { data: apiResponse, isLoading, isError, refetch } = useGetCampaignBannerQuery();
  const [updateCampaignApi, { isLoading: isSaving }] = useUpdateCampaignBannerMutation();
  const [formData, setFormData] = useState(EMPTY_CAMPAIGN);

  useEffect(() => {
    const res = apiResponse?.data;
    if (!res || typeof res !== "object") return;
    // Nothing saved yet (updatedAt null): start a new campaign switched on.
    const isSaved = Boolean(res.updatedAt);
    setFormData({
      isActive: isSaved ? Boolean(res.isActive) : true,
      bannerImage: res.bannerImage || "",
      bannerTitle: res.bannerTitle || "",
      bannerSubtitle: res.bannerSubtitle || "",
      bannerLink: res.bannerLink || "",
      flashSaleTitle: res.flashSaleTitle || "",
      countdownEnds: toLocalInput(res.countdownEnds),
    });
  }, [apiResponse]);

  const fileInputRef = useRef(null);

  const handleDeviceFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image file size should be less than 8MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (result) {
        setFormData((prev) => ({ ...prev, bannerImage: result }));
        toast.success("Banner image loaded from device!");
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemoveBanner = () => {
    confirmToast({
      title: "Remove Banner Image?",
      message: "Are you sure you want to remove the current promotional banner image?",
      confirmLabel: "Yes, Remove",
      onConfirm: () => {
        setFormData((prev) => ({ ...prev, bannerImage: "" }));
        toast.success("Banner image removed.");
      },
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!apiResponse) {
      toast.error("The campaign has not loaded from the server yet. Refresh and try again.");
      return;
    }
    const toastId = toast.loading("Saving banner & flash sale campaign...");
    try {
      await updateCampaignApi({
        ...formData,
        countdownEnds: fromLocalInput(formData.countdownEnds),
      }).unwrap();
      toast.success(
        formData.isActive
          ? "Campaign saved. It is now live on the storefront."
          : "Campaign saved as inactive. The storefront shows its default banners.",
        { id: toastId }
      );
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save the campaign to the server", { id: toastId });
    }
  };

  if (isLoading) {
    return <p className="text-xs text-gray-500">Loading campaign...</p>;
  }

  if (isError && !apiResponse) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-red-600">Could not load the campaign from the server.</p>
        <button type="button" onClick={() => refetch()} className="button secondary text-xs px-4 py-2 cursor-pointer">
          Retry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Live toggle */}
      <label className="flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-200 dark:border-zinc-700 cursor-pointer">
        <span>
          <span className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300">
            Campaign Active
          </span>
          <span className="text-[11px] text-gray-500">
            When off, the storefront hides this campaign and shows its default banners.
          </span>
        </span>
        <input
          type="checkbox"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="h-4 w-4 accent-emerald-600 cursor-pointer"
        />
      </label>

      {/* Banner Upload Box */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300">
            Homepage Hero Banner Image
          </label>
          <span className="text-[11px] text-gray-500 font-medium">
            Recommended: 1920 × 640px (3:1 panoramic ratio)
          </span>
        </div>

        {/* Live Banner Preview / Drop Area */}
        <div className="relative w-full aspect-[3/1] max-h-[260px] rounded-xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/40 flex flex-col items-center justify-center p-4 group transition hover:border-emerald-500">
          {formData.bannerImage ? (
            <>
              <img
                src={formData.bannerImage}
                alt="Homepage banner preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1920&q=85";
                }}
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3 p-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-lg bg-white text-gray-900 font-bold text-xs shadow-md hover:bg-gray-100 flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload size={14} /> Change Image
                </button>
                <button
                  type="button"
                  onClick={handleRemoveBanner}
                  className="px-3.5 py-2 rounded-lg bg-red-600 text-white font-bold text-xs shadow-md hover:bg-red-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            </>
          ) : (
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <ImageIcon size={24} />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200">
                  Upload Homepage Hero Banner
                </h4>
                <p className="text-[11px] text-gray-500">
                  Click below to browse from your device or paste an online image URL.
                </p>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="button secondary text-xs px-4 py-2 cursor-pointer inline-flex items-center gap-1.5"
              >
                <Upload size={13} /> Select Banner File
              </button>
            </div>
          )}
        </div>

        {/* Hidden Device File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleDeviceFileUpload}
        />

        {/* Optional Online Image URL Input */}
        <div className="mt-3">
          <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">
            Or Paste Direct Image URL
          </label>
          <input
            type="url"
            value={formData.bannerImage?.startsWith("data:") ? "" : formData.bannerImage}
            onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
            placeholder={
              formData.bannerImage?.startsWith("data:")
                ? "Custom banner uploaded from device"
                : "https://images.unsplash.com/... or CDN link"
            }
            className="w-full p-2.5 text-xs rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 outline-none focus:border-emerald-600"
          />
        </div>
      </div>

      {/* Campaign Details Form Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
            Flash Sale Title *
          </label>
          <input
            type="text"
            required
            value={formData.flashSaleTitle}
            onChange={(e) => setFormData({ ...formData, flashSaleTitle: e.target.value })}
            placeholder="e.g. German Beauty Week"
            className="w-full p-2.5 text-xs sm:text-sm font-semibold rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 outline-none focus:border-emerald-600"
          />
          <span className="text-[10px] text-gray-500 mt-0.5 block">
            Headline displayed above the flash sale countdown on the storefront.
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1 flex items-center gap-1">
            <Clock size={12} className="text-emerald-600" /> Countdown Ends At *
          </label>
          <input
            type="datetime-local"
            value={formData.countdownEnds}
            onChange={(e) => setFormData({ ...formData, countdownEnds: e.target.value })}
            className="w-full p-2.5 text-xs sm:text-sm font-mono rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 outline-none focus:border-emerald-600"
          />
          <span className="text-[10px] text-gray-500 mt-0.5 block">
            Timer on homepage counts down live to this date & time.
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1 flex items-center gap-1">
            <LinkIcon size={12} className="text-emerald-600" /> Banner Target Link
          </label>
          <input
            type="text"
            value={formData.bannerLink}
            onChange={(e) => setFormData({ ...formData, bannerLink: e.target.value })}
            placeholder="/flash-sale or /shop"
            className="w-full p-2.5 text-xs rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 outline-none focus:border-emerald-600"
          />
          <span className="text-[10px] text-gray-500 mt-0.5 block">
            Clicking the hero banner redirects customers to this route or link.
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
            Hero Banner Title
          </label>
          <input
            type="text"
            maxLength={200}
            value={formData.bannerTitle}
            onChange={(e) => setFormData({ ...formData, bannerTitle: e.target.value })}
            placeholder="Defaults to the flash sale title"
            className="w-full p-2.5 text-xs rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 outline-none focus:border-emerald-600"
          />
          <span className="text-[10px] text-gray-500 mt-0.5 block">
            Caption shown on the homepage hero slide for this banner.
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
            Campaign Subtitle / Tagline
          </label>
          <input
            type="text"
            value={formData.bannerSubtitle}
            onChange={(e) => setFormData({ ...formData, bannerSubtitle: e.target.value })}
            placeholder="Special limited-time promotional pricing on authentic German imports"
            className="w-full p-2.5 text-xs rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 outline-none focus:border-emerald-600"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-3 border-t border-gray-100 dark:border-zinc-800">
        <button
          type="submit"
          disabled={isSaving}
          className="button text-xs sm:text-sm px-7 py-2.5 cursor-pointer flex items-center gap-1.5"
        >
          <Save size={15} /> {isSaving ? "Saving Campaign..." : "Save Campaign to Storefront"}
        </button>
      </div>
    </form>
  );
}
