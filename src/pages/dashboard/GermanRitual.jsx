import { useState, useEffect, useRef } from "react";
import {
  useGetGermanRitualQuery,
  useUpdateGermanRitualMutation,
} from "../../redux/features/cmsApi";
import {
  Camera,
  Plus,
  Trash2,
  Save,
  ExternalLink,
  Heart,
  RefreshCw,
  Sparkles,
  Upload,
  Link as LinkIcon,
  X,
  Edit2,
  Image as ImageIcon,
} from "lucide-react";
import toast from "react-hot-toast";

const DEFAULT_RITUAL = {
  title: "Follow The German Ritual",
  subtitle:
    "Real community glow, daily skincare routines, and authentic German imports shared by our customers.",
  instagramUrl: "https://instagram.com/lumihaus.bd",
  posts: [
    {
      image:
        "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=85",
      likes: "428",
      tag: "@lumihaus.bd",
      link: "https://instagram.com/lumihaus.bd",
    },
    {
      image:
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=85",
      likes: "612",
      tag: "Velvet Swatches",
      link: "https://instagram.com/lumihaus.bd",
    },
    {
      image:
        "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=600&q=85",
      likes: "389",
      tag: "Balea Unboxing",
      link: "https://instagram.com/lumihaus.bd",
    },
    {
      image:
        "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=600&q=85",
      likes: "514",
      tag: "Glass Skin Glow",
      link: "https://instagram.com/lumihaus.bd",
    },
  ],
};

export default function GermanRitual() {
  const { data: apiResponse, isLoading, refetch } = useGetGermanRitualQuery();
  const [updateRitualApi, { isLoading: isSaving }] = useUpdateGermanRitualMutation();

  const [formData, setFormData] = useState(DEFAULT_RITUAL);
  const [activeModal, setActiveModal] = useState(null); // { index, isNew, image, tag, likes, link }
  const fileInputRef = useRef(null);

  useEffect(() => {
    const res = apiResponse?.data || apiResponse;
    if (res && typeof res === "object") {
      setFormData({
        title: res.title || DEFAULT_RITUAL.title,
        subtitle: res.subtitle || DEFAULT_RITUAL.subtitle,
        instagramUrl: res.instagramUrl || DEFAULT_RITUAL.instagramUrl,
        posts: Array.isArray(res.posts) && res.posts.length > 0 ? res.posts : DEFAULT_RITUAL.posts,
      });
    }
  }, [apiResponse]);

  // Open modal to edit existing card
  const handleEditCard = (index) => {
    const post = formData.posts[index];
    setActiveModal({
      index,
      isNew: false,
      image: post?.image || "",
      tag: post?.tag || "@lumihaus.bd",
      likes: post?.likes || "350",
      link: post?.link || formData.instagramUrl || "https://instagram.com/lumihaus.bd",
    });
  };

  // Open modal to add new card
  const handleAddNewCard = () => {
    setActiveModal({
      index: formData.posts.length,
      isNew: true,
      image: "",
      tag: "@lumihaus.bd",
      likes: "350",
      link: formData.instagramUrl || "https://instagram.com/lumihaus.bd",
    });
  };

  // Handle device file upload inside modal
  const handleDeviceUpload = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose a valid image file (JPG, PNG, WebP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size should be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (result) {
        setActiveModal((prev) => ({ ...prev, image: result }));
        toast.success("Image uploaded from device!");
      }
    };
    reader.readAsDataURL(file);
  };

  // Save changes from modal into local posts state
  const handleSaveModal = async (e) => {
    e.preventDefault();
    if (!activeModal.image?.trim()) {
      toast.error("Please upload an image or provide an image URL.");
      return;
    }

    const updatedCard = {
      image: activeModal.image,
      tag: activeModal.tag || "@lumihaus.bd",
      likes: activeModal.likes || "0",
      link: activeModal.link || formData.instagramUrl || "https://instagram.com/lumihaus.bd",
    };

    let updatedPosts;
    if (activeModal.isNew) {
      updatedPosts = [...formData.posts, updatedCard];
    } else {
      updatedPosts = [...formData.posts];
      updatedPosts[activeModal.index] = updatedCard;
    }

    const updatedData = { ...formData, posts: updatedPosts };
    setFormData(updatedData);
    setActiveModal(null);

    const toastId = toast.loading(activeModal.isNew ? "Adding card..." : "Updating card...");
    try {
      await updateRitualApi(updatedData).unwrap();
      toast.success(
        activeModal.isNew
          ? "New card added & saved to storefront!"
          : "Card updated & saved to storefront!",
        { id: toastId }
      );
    } catch (err) {
      toast.error(err?.data?.message || "Failed to persist card to backend", { id: toastId });
    }
  };

  // Remove a card and persist deletion to backend immediately
  const handleDeleteCard = async (index) => {
    if (formData.posts.length <= 1) {
      toast.error("You must have at least one card in the ritual feed.");
      return;
    }

    const cardToDelete = formData.posts[index];
    const updated = formData.posts.filter((_, i) => i !== index);
    const updatedData = { ...formData, posts: updated };

    setFormData(updatedData);
    setActiveModal(null);

    const toastId = toast.loading(`Deleting ${cardToDelete?.tag || `Card #${index + 1}`}...`);
    try {
      await updateRitualApi(updatedData).unwrap();
      toast.success("Card deleted successfully & synced with storefront!", { id: toastId });
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete card on server", { id: toastId });
    }
  };

  // Save full ritual section to backend
  const handleSaveAll = async (e) => {
    if (e) e.preventDefault();
    const toastId = toast.loading("Saving German Ritual community feed...");

    try {
      await updateRitualApi(formData).unwrap();
      toast.success("German Ritual feed saved successfully!", { id: toastId });
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save to server", { id: toastId });
    }
  };

  return (
    <>
      <title>LumiHaus Admin · Follow The German Ritual</title>

      {/* Top Page Heading */}
      <div className="page-heading">
        <div>
          <span className="page-kicker">STOREFRONT COMMUNITY SHOWCASE</span>
          <h2>Follow The German Ritual</h2>
          <p>
            Click any card to edit its image, destination link, tag, and likes in a simple modal.
          </p>
        </div>

        <div className="heading-actions">
          <button
            type="button"
            onClick={() => refetch()}
            className="button secondary cursor-pointer"
            title="Refresh from server"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} /> Refresh
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="button cursor-pointer"
          >
            <Save size={14} /> {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Section Header Settings */}
        <section className="card">
          <div className="section-head">
            <div>
              <span className="section-icon">
                <Sparkles size={18} />
              </span>
              <h2>Section Headline & Link</h2>
              <p>Customize the headline and default Instagram profile link shown on the homepage.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                Section Heading *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Follow The German Ritual"
                className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-semibold outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                Default Instagram Profile Link *
              </label>
              <input
                type="url"
                required
                value={formData.instagramUrl}
                onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                placeholder="https://instagram.com/lumihaus.bd"
                className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs sm:text-sm outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                Subtitle Description
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Real community glow, daily skincare routines..."
                className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs sm:text-sm outline-none focus:border-emerald-600"
              />
            </div>
          </div>
        </section>

        {/* Clean Showcase Cards Grid */}
        <section className="card">
          <div className="section-head flex items-center justify-between">
            <div>
              <span className="section-icon">
                <Camera size={18} />
              </span>
              <h2>Community Feed Cards ({formData.posts.length})</h2>
              <p>Click any card to open the edit modal and change image or link.</p>
            </div>

            <button
              type="button"
              onClick={handleAddNewCard}
              className="button cursor-pointer flex items-center gap-1.5"
            >
              <Plus size={15} /> Add Card
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
            {formData.posts.map((post, idx) => (
              <div
                key={idx}
                className="group relative rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/60 shadow-xs overflow-hidden transition hover:shadow-md hover:border-emerald-500"
              >
                {/* Direct Delete Button (Top-Right of Card) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Are you sure you want to delete Card #${idx + 1} (${post.tag || "this card"})?`)) {
                      handleDeleteCard(idx);
                    }
                  }}
                  className="absolute top-2.5 right-2.5 z-20 p-2 rounded-lg bg-red-600/90 hover:bg-red-600 text-white shadow-md opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 cursor-pointer hover:scale-105"
                  title="Delete this card"
                  aria-label="Delete Card"
                >
                  <Trash2 size={13} />
                </button>

                {/* 3/4 Aspect Image */}
                <div
                  onClick={() => handleEditCard(idx)}
                  className="relative w-full aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-zinc-800 cursor-pointer"
                >
                  <img
                    src={post.image}
                    alt={post.tag || `Card ${idx + 1}`}
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=600&q=85";
                    }}
                  />

                  {/* Overlay simulating storefront */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
                    <span className="font-bold text-xs truncate drop-shadow-xs">
                      {post.tag || "@lumihaus.bd"}
                    </span>
                    <span className="text-[11px] text-white/90 flex items-center gap-1 drop-shadow-xs mt-0.5">
                      <Heart size={10} fill="currentColor" /> {post.likes || "0"} loves
                    </span>
                  </div>

                  {/* Hover Edit Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-white dark:bg-zinc-800 text-neutral-900 dark:text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5">
                      <Edit2 size={13} /> Edit Card
                    </span>
                  </div>
                </div>

                {/* Card footer details with Edit & Delete actions */}
                <div className="p-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-xs gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-neutral-800 dark:text-neutral-200 block">
                      Card #{idx + 1}
                    </span>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 truncate">
                      <LinkIcon size={10} className="shrink-0" /> {post.link ? "Custom Link" : "Default Instagram"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEditCard(idx)}
                      className="p-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                      title="Edit Card"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete Card #${idx + 1}?`)) {
                          handleDeleteCard(idx);
                        }
                      }}
                      className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
                      title="Delete Card"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Save Action */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="button text-sm px-8 py-3 cursor-pointer"
          >
            <Save size={16} /> {isSaving ? "Saving..." : "Save Changes to Storefront"}
          </button>
        </div>
      </div>

      {/* Edit / Add Card Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#1E211E] p-6 shadow-2xl border border-gray-200 dark:border-zinc-700 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-zinc-700 mb-5">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {activeModal.isNew
                    ? "Add Showcase Card"
                    : `Edit Showcase Card #${activeModal.index + 1}`}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Upload an image from your device and set a custom click destination link.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              {/* Image Preview & Device Upload */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">
                  Card Image *
                </label>

                <div className="flex items-start gap-4">
                  {/* Image Preview Box (3/4 aspect ratio) */}
                  <div className="w-28 h-36 shrink-0 rounded-lg overflow-hidden border border-gray-200 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800 relative">
                    {activeModal.image ? (
                      <img
                        src={activeModal.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src =
                            "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=600&q=85";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-gray-400">
                        <ImageIcon size={24} className="mb-1" />
                        <span className="text-[10px]">No image selected</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Actions */}
                  <div className="flex-1 space-y-2.5">
                    {/* Device Upload Button */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleDeviceUpload(file);
                        e.target.value = "";
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2.5 px-3 rounded-lg border border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition"
                    >
                      <Upload size={15} /> Upload Image from Device
                    </button>

                    <p className="text-[11px] text-gray-500">
                      Upload from computer or phone (JPG, PNG, WebP up to 5MB).
                    </p>

                    {/* Or Paste URL */}
                    <div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                        Or Paste Image URL
                      </span>
                      <input
                        type="url"
                        value={activeModal.image?.startsWith("data:") ? "" : activeModal.image}
                        onChange={(e) =>
                          setActiveModal({ ...activeModal, image: e.target.value })
                        }
                        placeholder={
                          activeModal.image?.startsWith("data:")
                            ? "Image uploaded from device"
                            : "https://images.unsplash.com/..."
                        }
                        className="w-full p-2 text-xs rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Destination Link */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1 flex items-center gap-1">
                  <LinkIcon size={12} className="text-emerald-600" /> Click Destination URL / Link *
                </label>
                <input
                  type="text"
                  required
                  value={activeModal.link}
                  onChange={(e) => setActiveModal({ ...activeModal, link: e.target.value })}
                  placeholder="https://instagram.com/p/... or /shop"
                  className="w-full p-2.5 text-xs rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 outline-none focus:border-emerald-600 font-medium"
                />
                <span className="text-[11px] text-gray-500 mt-1 block">
                  When a customer clicks this card, they will be redirected to this link.
                </span>
              </div>

              {/* Tag & Likes in 2 columns */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                    Tag / Caption
                  </label>
                  <input
                    type="text"
                    value={activeModal.tag}
                    onChange={(e) => setActiveModal({ ...activeModal, tag: e.target.value })}
                    placeholder="@lumihaus.bd"
                    className="w-full p-2 text-xs rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 outline-none focus:border-emerald-600 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                    Likes Count
                  </label>
                  <input
                    type="text"
                    value={activeModal.likes}
                    onChange={(e) => setActiveModal({ ...activeModal, likes: e.target.value })}
                    placeholder="428"
                    className="w-full p-2 text-xs rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-zinc-700 mt-6">
                <div>
                  {!activeModal.isNew && (
                    <button
                      type="button"
                      onClick={() => handleDeleteCard(activeModal.index)}
                      className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={13} /> Delete Card
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 text-xs font-semibold rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="button text-xs px-5 py-2 cursor-pointer"
                  >
                    {activeModal.isNew ? "Add Card" : "Update Card"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
