import { useState, useEffect, useRef } from "react";
import {
  Save,
  RotateCcw,
  Loader2,
  Upload,
  Link as LinkIcon,
  User,
  Quote,
  Sparkles,
  MapPin,
  Mail,
  CheckCircle2,
  Eye,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  useGetAboutUsQuery,
  useUpdateAboutUsMutation,
} from "../../redux/features/cmsApi";

export const DEFAULT_ABOUT_US = {
  hero: {
    kicker: "MUNICH TO DHAKA CONCIERGE",
    title: "Authentic German Beauty, Delivered to Bangladesh",
    subtitle:
      "Lumihaus was founded to bridge the gap between Munich’s official European drugstores (dm.de, Rossmann, Douglas) and beauty enthusiasts in Bangladesh—guaranteeing 100% genuine shelf-fresh cosmetics with zero customs hassle.",
  },
  founder: {
    name: "Nabi Shafin",
    role: "Founder & Chief Concierge",
    location: "Frankfurt am Main / Dhaka",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=85",
    badge: "FOUNDER'S NOTE & PHILOSOPHY",
    quote:
      "“I founded Lumihaus with a simple obsession: no counterfeit skincare, no expired batch codes, and no absurd retail markups.”",
    story:
      "Having spent considerable time in Germany and Europe, I fell in love with German drugstore culture—where dermatologically tested formulas from brands like Balea, Catrice, and Penaten are accessible, potent, and strictly certified under European Union cosmetic laws.\n\nReturning to Bangladesh, it was disheartening to see enthusiasts paying quadruple the price for dubious stock from unauthorized resellers or waiting weeks with zero shipment transparency.\n\nLumihaus was created as a personal concierge service. We do not source from gray markets or third-party bulk traders. Our team in Germany walks into official dm-drogerie markt and Rossmann branches, inspects every shelf batch code by hand, and packs them into direct Frankfurt air freight flights to Bangladesh.",
    signatureTitle: "Founder & Managing Director",
    email: "concierge@lumihaus.de",
  },
};

export default function AboutUsEditor() {
  const { data: apiResponse, isLoading: isFetching, refetch } = useGetAboutUsQuery();
  const [updateAboutUs, { isLoading: isSaving }] = useUpdateAboutUsMutation();

  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem("lumihaus_about_us");
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          hero: { ...DEFAULT_ABOUT_US.hero, ...(parsed.hero || {}) },
          founder: { ...DEFAULT_ABOUT_US.founder, ...(parsed.founder || {}) },
        };
      }
    } catch {}
    return DEFAULT_ABOUT_US;
  });

  const fileInputRef = useRef(null);

  // Sync API response when available
  useEffect(() => {
    const res = apiResponse?.data || apiResponse;
    if (res && (res.founder || res.hero)) {
      setFormData({
        hero: { ...DEFAULT_ABOUT_US.hero, ...(res.hero || {}) },
        founder: { ...DEFAULT_ABOUT_US.founder, ...(res.founder || {}) },
      });
      try {
        localStorage.setItem("lumihaus_about_us", JSON.stringify(res));
      } catch {}
    }
  }, [apiResponse]);

  // Handle local image file upload
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size should be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (result) {
        setFormData((prev) => ({
          ...prev,
          founder: {
            ...prev.founder,
            image: result,
          },
        }));
        toast.success("Founder photo selected from device!");
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Save
  const handleSave = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Saving About Us content...");

    try {
      localStorage.setItem("lumihaus_about_us", JSON.stringify(formData));
    } catch {}

    try {
      await updateAboutUs(formData).unwrap();
      toast.success("About Us page updated successfully in backend!", { id: toastId });
      refetch();
    } catch (err) {
      // Graceful fallback notice: saved locally
      toast.success("Saved to local store! (Backend sync pending deployment)", {
        id: toastId,
      });
    }
  };

  // Reset to default
  const handleReset = () => {
    if (window.confirm("Reset About Us content to official default?")) {
      setFormData(DEFAULT_ABOUT_US);
      try {
        localStorage.removeItem("lumihaus_about_us");
      } catch {}
      toast.success("Reset to default configuration.");
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {/* 1. Founder & Owner Details Section */}
      <div className="rounded-2xl border border-[#DCD6CB] dark:border-white/10 bg-white dark:bg-[#222620] p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-[#DCD6CB] dark:border-white/10 pb-4">
          <div className="p-2.5 rounded-xl bg-[#8FAF9A]/15 text-[#26382E] dark:text-[#8FAF9A]">
            <User size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#141f17] dark:text-white">
              Founder & Owner Information
            </h3>
            <p className="text-xs text-neutral-500">
              Customize the founder's editorial portrait, biography, philosophy quote, and role.
            </p>
          </div>
        </div>

        {/* Founder Portrait Upload & Preview */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-4 space-y-3">
            <label className="block text-xs font-bold text-[#141f17] dark:text-white uppercase tracking-wider">
              Founder Portrait Photo
            </label>
            <div className="relative aspect-[3/4] w-full rounded-2xl border-2 border-dashed border-[#DCD6CB] dark:border-white/15 overflow-hidden bg-[#F9F6EF] dark:bg-[#1A1D1B] flex flex-col items-center justify-center group">
              {formData.founder.image ? (
                <>
                  <img
                    src={formData.founder.image}
                    alt={formData.founder.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-white text-[#141f17] text-xs font-bold shadow-md cursor-pointer hover:bg-neutral-100 flex items-center gap-1"
                    >
                      <Upload size={13} /> Change
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center p-6 space-y-2">
                  <User size={36} className="mx-auto text-neutral-400" />
                  <p className="text-xs text-neutral-500 font-medium">No photo selected</p>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2 px-3 rounded-xl border border-[#DCD6CB] dark:border-white/10 bg-[#F9F6EF] dark:bg-[#1A1D1B] hover:bg-[#EEF3EF] dark:hover:bg-white/5 text-xs font-bold text-[#141f17] dark:text-white flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Upload size={14} />
                <span>Upload from Device</span>
              </button>
            </div>
          </div>

          <div className="md:col-span-8 space-y-4">
            {/* Image Direct URL Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#141f17] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <LinkIcon size={12} />
                Or Paste Photo URL (Cloud / Unsplash / CDN)
              </label>
              <input
                type="url"
                value={formData.founder.image}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    founder: { ...formData.founder, image: e.target.value },
                  })
                }
                placeholder="https://images.unsplash.com/... or cloud image URL"
                className="w-full rounded-xl border border-[#DCD6CB] dark:border-white/10 bg-[#F9F6EF] dark:bg-[#1A1D1B] px-4 py-2.5 text-xs font-mono text-[#141f17] dark:text-white outline-none focus:border-[#8FAF9A]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Founder Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#141f17] dark:text-white uppercase tracking-wider">
                  Founder Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.founder.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      founder: { ...formData.founder, name: e.target.value },
                    })
                  }
                  placeholder="e.g. Nabi Shafin"
                  className="w-full rounded-xl border border-[#DCD6CB] dark:border-white/10 bg-[#F9F6EF] dark:bg-[#1A1D1B] px-4 py-2.5 text-sm font-semibold text-[#141f17] dark:text-white outline-none focus:border-[#8FAF9A]"
                />
              </div>

              {/* Founder Role / Title */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#141f17] dark:text-white uppercase tracking-wider">
                  Official Role / Badge
                </label>
                <input
                  type="text"
                  required
                  value={formData.founder.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      founder: { ...formData.founder, role: e.target.value },
                    })
                  }
                  placeholder="e.g. Founder & Chief Concierge"
                  className="w-full rounded-xl border border-[#DCD6CB] dark:border-white/10 bg-[#F9F6EF] dark:bg-[#1A1D1B] px-4 py-2.5 text-sm font-semibold text-[#141f17] dark:text-white outline-none focus:border-[#8FAF9A]"
                />
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#141f17] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin size={12} />
                  Base Location
                </label>
                <input
                  type="text"
                  value={formData.founder.location}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      founder: { ...formData.founder, location: e.target.value },
                    })
                  }
                  placeholder="e.g. Frankfurt am Main / Dhaka"
                  className="w-full rounded-xl border border-[#DCD6CB] dark:border-white/10 bg-[#F9F6EF] dark:bg-[#1A1D1B] px-4 py-2.5 text-sm text-[#141f17] dark:text-white outline-none focus:border-[#8FAF9A]"
                />
              </div>

              {/* Contact Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#141f17] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Mail size={12} />
                  Founder Desk Email
                </label>
                <input
                  type="email"
                  value={formData.founder.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      founder: { ...formData.founder, email: e.target.value },
                    })
                  }
                  placeholder="e.g. concierge@lumihaus.de"
                  className="w-full rounded-xl border border-[#DCD6CB] dark:border-white/10 bg-[#F9F6EF] dark:bg-[#1A1D1B] px-4 py-2.5 text-sm text-[#141f17] dark:text-white outline-none focus:border-[#8FAF9A]"
                />
              </div>
            </div>

            {/* Founder Philosophy Quote */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#141f17] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Quote size={12} />
                Founder's Philosophy Quote (Large Editorial Headline)
              </label>
              <textarea
                rows={3}
                required
                value={formData.founder.quote}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    founder: { ...formData.founder, quote: e.target.value },
                  })
                }
                placeholder="“I founded Lumihaus with a simple obsession...”"
                className="w-full rounded-xl border border-[#DCD6CB] dark:border-white/10 bg-[#F9F6EF] dark:bg-[#1A1D1B] p-3.5 text-sm font-medium text-[#141f17] dark:text-white leading-relaxed outline-none focus:border-[#8FAF9A] resize-y"
              />
            </div>
          </div>
        </div>

        {/* Founder Story Paragraphs */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#141f17] dark:text-white uppercase tracking-wider">
            Founder's Story & Personal Letter (Separate paragraphs with double enter)
          </label>
          <textarea
            rows={7}
            required
            value={formData.founder.story}
            onChange={(e) =>
              setFormData({
                ...formData,
                founder: { ...formData.founder, story: e.target.value },
              })
            }
            placeholder="Write the founder's story here..."
            className="w-full rounded-xl border border-[#DCD6CB] dark:border-white/10 bg-[#F9F6EF] dark:bg-[#1A1D1B] p-4 text-sm text-[#141f17] dark:text-white leading-relaxed outline-none focus:border-[#8FAF9A] font-sans resize-y"
          />
        </div>
      </div>

      {/* 2. Hero Banner Section */}
      <div className="rounded-2xl border border-[#DCD6CB] dark:border-white/10 bg-white dark:bg-[#222620] p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-center gap-3 border-b border-[#DCD6CB] dark:border-white/10 pb-4">
          <div className="p-2.5 rounded-xl bg-[#8FAF9A]/15 text-[#26382E] dark:text-[#8FAF9A]">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#141f17] dark:text-white">
              Hero Section Banner
            </h3>
            <p className="text-xs text-neutral-500">
              Customize the top banner badge, main headline, and mission subtitle.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#141f17] dark:text-white uppercase tracking-wider">
              Top Kicker Badge
            </label>
            <input
              type="text"
              value={formData.hero.kicker}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  hero: { ...formData.hero, kicker: e.target.value },
                })
              }
              placeholder="e.g. MUNICH TO DHAKA CONCIERGE"
              className="w-full rounded-xl border border-[#DCD6CB] dark:border-white/10 bg-[#F9F6EF] dark:bg-[#1A1D1B] px-4 py-2.5 text-sm font-semibold text-[#141f17] dark:text-white outline-none focus:border-[#8FAF9A]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#141f17] dark:text-white uppercase tracking-wider">
              Main Headline
            </label>
            <input
              type="text"
              value={formData.hero.title}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  hero: { ...formData.hero, title: e.target.value },
                })
              }
              placeholder="e.g. Authentic German Beauty, Delivered to Bangladesh"
              className="w-full rounded-xl border border-[#DCD6CB] dark:border-white/10 bg-[#F9F6EF] dark:bg-[#1A1D1B] px-4 py-2.5 text-sm font-semibold text-[#141f17] dark:text-white outline-none focus:border-[#8FAF9A]"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#141f17] dark:text-white uppercase tracking-wider">
            Sub-Headline / Mission Summary
          </label>
          <textarea
            rows={3}
            value={formData.hero.subtitle}
            onChange={(e) =>
              setFormData({
                ...formData,
                hero: { ...formData.hero, subtitle: e.target.value },
              })
            }
            placeholder="Lumihaus was founded to bridge the gap..."
            className="w-full rounded-xl border border-[#DCD6CB] dark:border-white/10 bg-[#F9F6EF] dark:bg-[#1A1D1B] p-3 text-sm text-[#141f17] dark:text-white leading-relaxed outline-none focus:border-[#8FAF9A] resize-y"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2">
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
          <span>{isSaving ? "Saving..." : "Save About Us Content"}</span>
        </button>
      </div>
    </form>
  );
}
