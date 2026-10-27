import { useState, useEffect, useRef } from "react";
import {
  useGetGermanRitualQuery,
  useUpdateGermanRitualMutation,
} from "../../redux/api/cmsApi";
import {
  Plus,
  Trash2,
  Save,
  Heart,
  RefreshCw,
  Upload,
  Link as LinkIcon,
  X,
  Edit2,
  Image as ImageIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import confirmToast from "../../utils/confirmToast";

const CARD =
  "rounded-xl border border-[#DCD6CB] dark:border-white/10 bg-white dark:bg-[#222620] p-5";
const MUTED = "text-[#2E4235]/65 dark:text-[#D2DDD6]/65";
const FIELD =
  "w-full px-3 py-2.5 rounded-lg border border-[#DCD6CB] dark:border-white/10 bg-white dark:bg-[#1B1E1A] text-sm text-[#141f17] dark:text-white outline-none focus:border-[#8FAF9A]";

const DEFAULT_RITUAL = {
  title: "Follow The German Ritual",
  subtitle:
    "Real community glow, daily skincare routines, and authentic German imports shared by our customers.",
  instagramUrl: "https://instagram.com/lumihaus.bd",
  // No demo cards: an empty server feed stays empty (and is saved as such).
  posts: [],
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
        posts: Array.isArray(res.posts) ? res.posts : [],
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
      likes: post?.likes || "0",
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
      likes: "0",
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
  const handleDeleteCard = (index) => {
    const cardToDelete = formData.posts[index];
    const cardTag = cardToDelete?.tag || `Card #${index + 1}`;

    confirmToast({
      title: "Delete Ritual Card?",
      message: `Are you sure you want to delete ${cardTag} from the German Ritual community feed?`,
      confirmLabel: "Yes, Delete",
      onConfirm: async () => {
        const updated = formData.posts.filter((_, i) => i !== index);
        const updatedData = { ...formData, posts: updated };

        setFormData(updatedData);
        setActiveModal(null);

        const toastId = toast.loading(`Deleting ${cardTag}...`);
        try {
          await updateRitualApi(updatedData).unwrap();
          toast.success("Card deleted successfully & synced with storefront!", { id: toastId });
        } catch (err) {
          toast.error(err?.data?.message || "Failed to delete card on server", { id: toastId });
        }
      },
    });
  };

  // Save full ritual section to backend
  const handleSaveAll = async (e) => {
    if (e) e.preventDefault();
    if (!apiResponse) {
      toast.error("The feed has not loaded from the server yet. Refresh and try again.");
      return;
    }
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

      {/* Top Page Heading — the single save action for the whole section */}
      <div className="page-heading flex-wrap">
        <div>
          <h2>German Ritual feed</h2>
          <p>Homepage Instagram section. Click a card to edit it.</p>
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
            disabled={isSaving || !apiResponse}
            className="button cursor-pointer"
          >
            <Save size={14} /> {isSaving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Section text settings */}
        <section className={CARD}>
          <div className="mb-4">
            <h2 className="m-0 text-base font-semibold text-[#141f17] dark:text-white">Section text</h2>
            <p className={`m-0 mt-0.5 text-[13px] ${MUTED}`}>Shown above the feed on the homepage.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="ritual-title" className="block mb-1.5">
                Heading
              </label>
              <input
                id="ritual-title"
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Follow The German Ritual"
                className={FIELD}
              />
            </div>

            <div>
              <label htmlFor="ritual-instagram" className="block mb-1.5">
                Instagram link
              </label>
              <input
                id="ritual-instagram"
                type="url"
                required
                value={formData.instagramUrl}
                onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                placeholder="https://instagram.com/lumihaus.bd"
                className={FIELD}
              />
            </div>

            <div>
              <label htmlFor="ritual-subtitle" className="block mb-1.5">
                Subtitle
              </label>
              <input
                id="ritual-subtitle"
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Real community glow, daily skincare routines..."
                className={FIELD}
              />
            </div>
          </div>
        </section>

        {/* Showcase cards grid */}
        <section className={CARD}>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="min-w-0">
              <h2 className="m-0 text-base font-semibold text-[#141f17] dark:text-white">
                Feed cards{" "}
                <span className="font-normal text-[#2E4235]/60 dark:text-[#D2DDD6]/60">
                  ({formData.posts.length})
                </span>
              </h2>
              <p className={`m-0 mt-0.5 text-[13px] ${MUTED}`}>Image, link, tag and likes per card.</p>
            </div>

            <button
              type="button"
              onClick={handleAddNewCard}
              className="button secondary cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Plus size={15} /> Add card
            </button>
          </div>

          {formData.posts.length === 0 && (
            <div className="rounded-lg border-2 border-dashed border-[#DCD6CB] dark:border-white/10 p-8 text-center">
              <p className={`m-0 text-sm ${MUTED}`}>
                {isLoading ? "Loading feed cards..." : "No feed cards yet. Add a card to show it on the homepage."}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {formData.posts.map((post, idx) => (
              <div
                key={idx}
                className="group relative rounded-lg border border-[#DCD6CB] dark:border-white/10 bg-white dark:bg-[#222620] overflow-hidden"
              >
                {/* 3/4 Aspect Image */}
                <div
                  onClick={() => handleEditCard(idx)}
                  className="relative w-full aspect-[3/4] overflow-hidden bg-[#F1EEE7] dark:bg-white/5 cursor-pointer"
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex flex-col justify-end p-3.5 text-white">
                    <span className="font-semibold text-xs truncate">{post.tag || "@lumihaus.bd"}</span>
                    <span className="text-[11px] text-white/85 flex items-center gap-1 mt-0.5">
                      <Heart size={10} fill="currentColor" /> {post.likes || "0"} loves
                    </span>
                  </div>

                  {/* Hover Edit Overlay */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-white dark:bg-[#222620] text-[#141f17] dark:text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
                      <Edit2 size={13} /> Edit card
                    </span>
                  </div>
                </div>

                {/* Card footer with Edit & Delete actions */}
                <div className="px-3 py-2.5 border-t border-[#DCD6CB] dark:border-white/10 flex items-center justify-between text-xs gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-[#141f17] dark:text-white block">Card {idx + 1}</span>
                    <span className="text-[11px] text-[#2E4235]/60 dark:text-[#D2DDD6]/60 flex items-center gap-1 truncate">
                      <LinkIcon size={10} className="shrink-0" /> {post.link ? "Custom link" : "Default Instagram"}
                    </span>
                  </div>

                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEditCard(idx)}
                      className="p-1.5 rounded-md text-[#2E4235]/70 dark:text-[#D2DDD6]/70 hover:text-[#141f17] dark:hover:text-white hover:bg-[#F1EEE7] dark:hover:bg-white/5 transition cursor-pointer"
                      title="Edit card"
                      aria-label="Edit card"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCard(idx)}
                      className="p-1.5 rounded-md text-[#2E4235]/70 dark:text-[#D2DDD6]/70 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
                      title="Delete card"
                      aria-label="Delete card"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Edit / Add Card Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#1E211E] p-6 shadow-2xl border border-gray-200 dark:border-zinc-700 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-zinc-700 mb-5">
              <div>
                <h3 className="text-lg font-semibold text-[#141f17] dark:text-white">
                  {activeModal.isNew
                    ? "Add card"
                    : `Edit card ${activeModal.index + 1}`}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Image and where the card links to.
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
                <label className="block mb-1.5">
                  Image
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
                      className="button secondary w-full justify-center cursor-pointer"
                    >
                      <Upload size={15} /> Upload image
                    </button>

                    <p className="text-[11px] text-gray-500">
                      Upload from computer or phone (JPG, PNG, WebP up to 5MB).
                    </p>

                    {/* Or Paste URL */}
                    <div>
                      <span className="text-xs text-[#2E4235]/65 dark:text-[#D2DDD6]/65 block mb-1">
                        Or paste an image URL
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
                <label className="mb-1.5 flex items-center gap-1">
                  Link
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
                  <label className="block mb-1.5">
                    Tag
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
                  <label className="block mb-1.5">
                    Likes
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
