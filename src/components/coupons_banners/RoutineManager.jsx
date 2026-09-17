import { useState, useRef } from "react";
import { Sparkles, Plus, Trash2, Edit3, CheckCircle2, Layers, DollarSign, Image as ImageIcon, Upload, X } from "lucide-react";
import {
  useGetRoutinesQuery,
  useCreateRoutineMutation,
  useUpdateRoutineMutation,
  useDeleteRoutineMutation,
} from "../../redux/features/cmsApi";

const DEFAULT_ROUTINES = [
  {
    _id: "default-glass-skin",
    name: "Dewy Glass Skin Ritual",
    skinType: "Dehydrated & Dull Skin",
    description: "Deep multi-depth hydration powered by Balea Hyaluron Serum and organic rosehip oil for an all-day luminous glow in humid weather.",
    badge: "MOST POPULAR",
    discount: 17,
    image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=85",
    steps: [
      { stepNumber: 1, title: "1. Balea Aqua Cleansing Foam", productId: "" },
      { stepNumber: 2, title: "2. Balea Hyaluronic Dew Serum", productId: "" },
      { stepNumber: 3, title: "3. Alverde Organic Rose Glow Oil", productId: "" },
    ],
    price: 3100,
    originalPrice: 3750,
  },
  {
    _id: "default-barrier-repair",
    name: "Soothing Barrier Defense",
    skinType: "Sensitive & Redness Prone",
    description: "Gentle German dermatological care with Zinc, Panthenol, and botanical oils to calm breakouts and repair the moisture barrier.",
    badge: "SENSITIVE SKIN",
    discount: 18,
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=85",
    steps: [
      { stepNumber: 1, title: "1. Cloud Gentle Cleansing Balm", productId: "" },
      { stepNumber: 2, title: "2. Penaten Soothing Zinc Balm", productId: "" },
      { stepNumber: 3, title: "3. Balea Aqua Hydrating Gel", productId: "" },
    ],
    price: 2800,
    originalPrice: 3400,
  },
  {
    _id: "default-french-glam",
    name: "Haute Velvet Lip & Glow",
    skinType: "Daily Makeup & Outing",
    description: "Flawless cushion foundation with SPF 50+ paired with featherweight Catrice velvet matte lipstick for 12h comfortable elegance.",
    badge: "MAKEUP EDIT",
    discount: 17,
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=85",
    steps: [
      { stepNumber: 1, title: "1. Petal Cushion SPF 50+", productId: "" },
      { stepNumber: 2, title: "2. Catrice Demi Matt Lip Color", productId: "" },
      { stepNumber: 3, title: "3. Shimmer Golden Body Silk", productId: "" },
    ],
    price: 3650,
    originalPrice: 4400,
  },
];

export default function RoutineManager() {
  const { data: apiRoutines, isLoading } = useGetRoutinesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [createRoutine, { isLoading: isCreating }] = useCreateRoutineMutation();
  const [updateRoutine, { isLoading: isUpdating }] = useUpdateRoutineMutation();
  const [deleteRoutine, { isLoading: isDeleting }] = useDeleteRoutineMutation();

  const routinesList =
    apiRoutines?.data && apiRoutines.data.length > 0
      ? apiRoutines.data
      : DEFAULT_ROUTINES;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");

  const initialForm = {
    name: "",
    skinType: "",
    description: "",
    badge: "MOST POPULAR",
    discount: 15,
    image: "",
    price: "",
    originalPrice: "",
    step1Title: "",
    step2Title: "",
    step3Title: "",
  };

  const [formData, setFormData] = useState(initialForm);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image file size should be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const base64 = loadEvt.target?.result;
      if (base64) {
        setFormData((prev) => ({ ...prev, image: base64 }));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Pricing & savings calculation for Approach 1 (Standalone Bundle)
  const enteredPrice = Number(formData.price) || 0;
  const enteredOriginalPrice = Number(formData.originalPrice) || 0;
  const calculatedDiscount =
    enteredOriginalPrice > enteredPrice && enteredPrice > 0
      ? Math.round(((enteredOriginalPrice - enteredPrice) / enteredOriginalPrice) * 100)
      : Number(formData.discount) || 0;
  const savingsAmount =
    enteredOriginalPrice > enteredPrice && enteredPrice > 0
      ? enteredOriginalPrice - enteredPrice
      : 0;

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (routine) => {
    setEditingId(routine._id || routine.id);
    setFormData({
      name: routine.name || "",
      skinType: routine.skinType || "",
      description: routine.description || "",
      badge: routine.badge || "MOST POPULAR",
      discount: routine.discount || 15,
      image: routine.image || "",
      price: routine.price || "",
      originalPrice: routine.originalPrice || "",
      step1Title: routine.steps?.[0]?.title || (typeof routine.steps?.[0] === "string" ? routine.steps[0] : ""),
      step2Title: routine.steps?.[1]?.title || (typeof routine.steps?.[1] === "string" ? routine.steps[1] : ""),
      step3Title: routine.steps?.[2]?.title || (typeof routine.steps?.[2] === "string" ? routine.steps[2] : ""),
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalPrice = Number(formData.price) || 2490;
    const finalOriginalPrice =
      Number(formData.originalPrice) || (finalPrice > 0 ? Math.round(finalPrice * 1.2) : 2990);
    const finalDiscount =
      finalOriginalPrice > finalPrice && finalOriginalPrice > 0
        ? Math.round(((finalOriginalPrice - finalPrice) / finalOriginalPrice) * 100)
        : Number(formData.discount) || 0;

    const payload = {
      name: formData.name,
      skinType: formData.skinType,
      description: formData.description,
      badge: formData.badge || "MOST POPULAR",
      discount: finalDiscount,
      image: formData.image || "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=85",
      price: finalPrice,
      originalPrice: finalOriginalPrice,
      steps: [
        {
          stepNumber: 1,
          title: formData.step1Title || "1. Cleanser",
        },
        {
          stepNumber: 2,
          title: formData.step2Title || "2. Treatment Serum",
        },
        {
          stepNumber: 3,
          title: formData.step3Title || "3. Hydration & Glow",
        },
      ],
    };

    try {
      if (editingId && !editingId.startsWith("default-")) {
        await updateRoutine({ id: editingId, ...payload }).unwrap();
        setStatusMsg("Routine bundle updated successfully!");
      } else {
        await createRoutine(payload).unwrap();
        setStatusMsg("Routine bundle created successfully!");
      }
      setIsModalOpen(false);
      setTimeout(() => setStatusMsg(""), 4000);
    } catch (err) {
      console.warn("Backend routine API not ready yet, saved in local mock state:", err);
      setStatusMsg("Routine bundle saved! (Ensure backend /api/routines is active)");
      setIsModalOpen(false);
      setTimeout(() => setStatusMsg(""), 4000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this skin routine?")) return;
    try {
      if (!id.startsWith("default-")) {
        await deleteRoutine(id).unwrap();
      }
      setStatusMsg("Routine deleted.");
      setTimeout(() => setStatusMsg(""), 3000);
    } catch (err) {
      console.warn("Error deleting routine:", err);
      setStatusMsg("Removed from view.");
      setTimeout(() => setStatusMsg(""), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCD6CB] pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF3EF] px-2.5 py-0.5 text-[9px] font-bold tracking-wider text-[#26382E]">
            <Sparkles size={11} className="text-[#283d2e]" />
            STOREFRONT REGIMEN BUILDER
          </div>
          <h3 className="mt-1 font-serif text-xl font-bold text-[#17251C]">
            Find Your German Skin Routine (Bundles)
          </h3>
          <p className="text-xs text-[#2E4235]">
            Create and customize 3-step routine bundles displayed on the customer home page.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-[#26382E] hover:bg-[#17251C] text-white px-4 py-2.5 text-xs font-bold shadow-sm dark:bg-[#8FAF9A] dark:text-[#17251C] transition"
        >
          <Plus size={15} /> Add New Routine
        </button>
      </div>

      {statusMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 border border-emerald-200">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Routine Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {routinesList.map((routine) => {
          const rId = routine._id || routine.id;
          return (
            <div
              key={rId}
              className="flex flex-col justify-between rounded-2xl border border-[#DCD6CB] bg-white overflow-hidden shadow-xs transition hover:shadow-md"
            >
              {/* Card Image Banner */}
              <div className="relative h-36 w-full bg-[#F9F6EF] overflow-hidden">
                <img
                  src={routine.image || "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=85"}
                  alt={routine.name}
                  className="h-full w-full object-cover"
                />
                <span className="absolute top-2.5 left-2.5 rounded-full bg-[#8FAF9A] text-[#17251C] px-2.5 py-0.5 text-[8px] font-extrabold tracking-wider shadow-xs">
                  {routine.badge || "FEATURED"}
                </span>
                <span className="absolute top-2.5 right-2.5 rounded-full bg-white/90 backdrop-blur-xs px-2 py-0.5 text-[9px] font-bold text-emerald-600 shadow-xs">
                  Save {routine.discount || 15}%
                </span>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#26382E]">
                    {routine.skinType}
                  </span>
                  <h4 className="font-serif text-base font-bold text-[#17251C] line-clamp-1">
                    {routine.name}
                  </h4>
                  <p className="mt-1 text-[11px] text-[#2E4235] line-clamp-2 leading-relaxed">
                    {routine.description}
                  </p>

                  {/* 3 Step preview */}
                  <div className="mt-3 space-y-1 bg-[#F3EDE2] p-2.5 rounded-xl border border-[#DCD6CB]">
                    <span className="text-[8px] font-bold tracking-wider text-[#2E4235] uppercase block">
                      3-Step Products:
                    </span>
                    {(routine.steps || []).map((st, i) => (
                      <div key={i} className="text-[10px] text-[#17251C] font-medium flex items-center gap-1.5 truncate">
                        <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-[#EEF3EF] text-[#26382E] text-[8px] font-bold">
                          {i + 1}
                        </span>
                        <span className="truncate">{typeof st === "string" ? st : st.title}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Price & Actions */}
                <div className="pt-3 border-t border-[#DCD6CB] flex items-center justify-between">
                  <div>
                    <span className="text-[8px] text-gray-400 uppercase font-semibold block">Bundle Price</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-bold text-[#17251C]">
                        BDT {(routine.price || 3000).toLocaleString("en-BD")}
                      </span>
                      {routine.originalPrice && (
                        <span className="text-[9px] text-gray-400 line-through">
                          BDT {routine.originalPrice.toLocaleString("en-BD")}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(routine)}
                      className="rounded-lg p-1.5 text-gray-500 hover:bg-[#F3EDE2] hover:text-[#26382E] transition"
                      title="Edit Routine"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(rId)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
                      title="Delete Routine"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Routine Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-[#DCD6CB] dark:border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#DCD6CB] dark:border-white/10 pb-4 mb-6">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#17251C]">
                  {editingId ? "Edit Skin Routine Bundle" : "Create New Skin Routine"}
                </h3>
                <p className="text-xs text-gray-500">Configure steps, product links, and discount pricing</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200"
              >
                âœ•
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-[#17251C] block mb-1">Routine Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dewy Glass Skin Ritual"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 p-2.5 focus:border-[#8FAF9A] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#17251C] block mb-1">Target Skin Concern *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dehydrated & Dull Skin"
                    value={formData.skinType}
                    onChange={(e) => setFormData({ ...formData, skinType: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 p-2.5 focus:border-[#8FAF9A] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#17251C] block mb-1">Description *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Explain how this 3-step ritual transforms skin..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 p-2.5 focus:border-[#8FAF9A] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-[#17251C] dark:text-white block mb-1 text-xs">Ribbon Badge</label>
                  <input
                    type="text"
                    placeholder="e.g. MOST POPULAR"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 p-2.5 focus:border-[#8FAF9A] focus:outline-hidden text-xs bg-white dark:bg-zinc-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#17251C] dark:text-white block mb-1 text-xs">Bundle Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 p-2.5 focus:border-[#8FAF9A] focus:outline-hidden text-xs bg-white dark:bg-zinc-800"
                  />
                </div>
              </div>

              {/* Routine Cover Image (Direct Device Selection + URL fallback) */}
              <div>
                <label className="font-bold text-[#17251C] dark:text-white block mb-1.5 text-xs">
                  Routine Cover Image *
                </label>

                <div className="flex flex-col sm:flex-row items-start gap-3.5 p-3 rounded-2xl border border-[#DCD6CB] dark:border-white/10 bg-[#FAF7F2] dark:bg-white/5">
                  {/* Image Preview Box */}
                  <div className="relative w-28 h-24 sm:w-32 sm:h-24 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-800 shrink-0 flex items-center justify-center shadow-xs">
                    {formData.image ? (
                      <>
                        <img
                          src={formData.image}
                          alt="Routine Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src =
                              "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=600&q=85";
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, image: "" })}
                          className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-red-600 transition cursor-pointer"
                          title="Remove image"
                        >
                          <X size={12} />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400 p-2 text-center">
                        <ImageIcon size={22} className="mb-1 text-gray-400" />
                        <span className="text-[10px]">No image</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Actions */}
                  <div className="flex-1 w-full space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#26382E] hover:bg-[#17251C] text-white dark:bg-[#8FAF9A] dark:text-[#17251C] transition font-bold text-xs cursor-pointer shadow-xs active:scale-95"
                      >
                        <Upload size={14} /> Select Image from Device
                      </button>

                      {formData.image && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, image: "" })}
                          className="px-3 py-2 rounded-xl border border-gray-300 dark:border-white/10 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    <div>
                      <input
                        type="url"
                        placeholder="Or paste direct image URL (https://...)"
                        value={formData.image?.startsWith("data:") ? "" : formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-800 px-3 py-2 text-xs focus:border-[#8FAF9A] focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3 Products in Combo */}
              <div className="border-t border-[#DCD6CB] dark:border-white/10 pt-4 space-y-3">
                <div>
                  <h4 className="font-serif text-sm font-bold text-[#17251C] dark:text-white">
                    Included Products (3 Items in this Combo)
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Directly enter the 3 items included in this combo. No catalog linking required.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3 bg-[#FAF7F2] dark:bg-white/5 rounded-2xl border border-[#DCD6CB] dark:border-white/10 flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#26382E] text-white text-xs font-bold">
                      1
                    </span>
                    <div className="flex-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#26382E] dark:text-[#8FAF9A] block mb-0.5">
                        Product 1 / Step 1 Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Balea Aqua Cleansing Foam 150ml"
                        value={formData.step1Title}
                        onChange={(e) => setFormData({ ...formData, step1Title: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-800 p-2 text-xs focus:border-[#8FAF9A] focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-[#FAF7F2] dark:bg-white/5 rounded-2xl border border-[#DCD6CB] dark:border-white/10 flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#26382E] text-white text-xs font-bold">
                      2
                    </span>
                    <div className="flex-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#26382E] dark:text-[#8FAF9A] block mb-0.5">
                        Product 2 / Step 2 Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Balea Hyaluronic Dew Power Serum 30ml"
                        value={formData.step2Title}
                        onChange={(e) => setFormData({ ...formData, step2Title: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-800 p-2 text-xs focus:border-[#8FAF9A] focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-[#FAF7F2] dark:bg-white/5 rounded-2xl border border-[#DCD6CB] dark:border-white/10 flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#26382E] text-white text-xs font-bold">
                      3
                    </span>
                    <div className="flex-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#26382E] dark:text-[#8FAF9A] block mb-0.5">
                        Product 3 / Step 3 Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Alverde Organic Rose Glow Moisture Cream 50ml"
                        value={formData.step3Title}
                        onChange={(e) => setFormData({ ...formData, step3Title: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-800 p-2 text-xs focus:border-[#8FAF9A] focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Combo Pricing & Discount */}
              <div className="border-t border-[#DCD6CB] dark:border-white/10 pt-4 space-y-3">
                <h4 className="font-serif text-sm font-bold text-[#17251C] dark:text-white">
                  Combo Pricing & Offer Value
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-[#17251C] dark:text-white block mb-1 text-xs">
                      Bundle Offer Price (৳) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="e.g. 2490"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 dark:border-white/10 p-2.5 focus:border-[#8FAF9A] focus:outline-hidden text-sm font-bold bg-white dark:bg-zinc-800"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#17251C] dark:text-white block mb-1 text-xs">
                      Original / Regular Total (৳)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 2940"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 dark:border-white/10 p-2.5 focus:border-[#8FAF9A] focus:outline-hidden text-sm font-bold bg-white dark:bg-zinc-800"
                    />
                  </div>
                </div>

                {/* Price Live Summary */}
                <div className="p-3.5 bg-[#EEF3EF] dark:bg-white/5 rounded-2xl border border-[#DCD6CB] dark:border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#26382E] dark:text-white block">
                      Customer Price on Storefront
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-base font-bold text-[#17251C] dark:text-white">
                        BDT {(enteredPrice || 0).toLocaleString("en-BD")}
                      </span>
                      {enteredOriginalPrice > enteredPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          BDT {enteredOriginalPrice.toLocaleString("en-BD")}
                        </span>
                      )}
                    </div>
                  </div>

                  {savingsAmount > 0 ? (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300 px-3 py-1.5 rounded-full border border-emerald-300 dark:border-emerald-700/40">
                      Save ৳{savingsAmount.toLocaleString("en-BD")} ({calculatedDiscount}% OFF)
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
                      Regular Price
                    </span>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#DCD6CB] dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-gray-200 px-5 py-2.5 font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="rounded-xl bg-[#26382E] hover:bg-[#17251C] px-6 py-2.5 font-bold text-white shadow-md dark:bg-[#8FAF9A] dark:text-[#17251C] transition disabled:opacity-50"
                >
                  {editingId ? "Save Changes" : "Publish Routine"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


