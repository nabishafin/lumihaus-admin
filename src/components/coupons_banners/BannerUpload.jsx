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

const DEFAULT_CAMPAIGN = {
  bannerImage: "",
  bannerTitle: "German Beauty Week",
  bannerSubtitle: "Authentic European skincare imports with special limited-time promotional pricing.",
  bannerLink: "/flash-sale",
  flashSaleTitle: "German Beauty Week",
  countdownEnds: "",
};

export default function BannerUpload() {
  const { data: apiResponse, isLoading, refetch } = useGetCampaignBannerQuery();
  const [updateCampaignApi, { isLoading: isSaving }] = useUpdateCampaignBannerMutation();

  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem("lumihaus_campaign_banner");
      return saved ? JSON.parse(saved) : DEFAULT_CAMPAIGN;
    } catch {
      return DEFAULT_CAMPAIGN;
    }
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    const res = apiResponse?.data || apiResponse;
    if (res && typeof res === "object") {
      setFormData({
        bannerImage: res.bannerImage || "",
        bannerTitle: res.bannerTitle || DEFAULT_CAMPAIGN.bannerTitle,
        bannerSubtitle: res.bannerSubtitle || DEFAULT_CAMPAIGN.bannerSubtitle,
        bannerLink: res.bannerLink || DEFAULT_CAMPAIGN.bannerLink,
        flashSaleTitle: res.flashSaleTitle || DEFAULT_CAMPAIGN.flashSaleTitle,
        countdownEnds: res.countdownEnds || "",
      });
    }
  }, [apiResponse]);

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
    setFormData((prev) => ({ ...prev, bannerImage: "" }));
    toast.success("Banner image cleared.");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Saving banner & flash sale campaign...");

    try {
      // Save locally first for instant live storefront preview
      localStorage.setItem("lumihaus_campaign_banner", JSON.stringify(formData));
      window.dispatchEvent(
        new CustomEvent("lumihaus:campaign:updated", { detail: formData })
      );

      await updateCampaignApi(formData).unwrap();
      toast.success("Campaign updated successfully! Storefront is live.", { id: toastId });
    } catch (err) {
      toast.success("Campaign saved locally! (Deploy backend route to persist)", { id: toastId });
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
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
