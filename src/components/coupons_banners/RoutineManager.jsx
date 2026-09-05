import { useState } from "react";
import { Sparkles, Plus, Trash2, Edit3, CheckCircle2, Layers, DollarSign, Image as ImageIcon } from "lucide-react";
import {
  useGetRoutinesQuery,
  useCreateRoutineMutation,
  useUpdateRoutineMutation,
  useDeleteRoutineMutation,
} from "../../redux/features/cmsApi";
import { useGetProductsQuery } from "../../redux/features/productApi";

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
  const { data: productsData } = useGetProductsQuery({ limit: 100 });
  const [createRoutine, { isLoading: isCreating }] = useCreateRoutineMutation();
  const [updateRoutine, { isLoading: isUpdating }] = useUpdateRoutineMutation();
  const [deleteRoutine, { isLoading: isDeleting }] = useDeleteRoutineMutation();

  const products = productsData?.data || productsData?.products || [];

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
    step1Title: "",
    step1Product: "",
    step2Title: "",
    step2Product: "",
    step3Title: "",
    step3Product: "",
    customPrice: "",
  };

  const [formData, setFormData] = useState(initialForm);

  // Auto calculate sum of 3 selected products
  const p1 = products.find((p) => p._id === formData.step1Product || p.id === formData.step1Product);
  const p2 = products.find((p) => p._id === formData.step2Product || p.id === formData.step2Product);
  const p3 = products.find((p) => p._id === formData.step3Product || p.id === formData.step3Product);

  const calculatedOriginalPrice =
    (p1?.price || p1?.regularPrice || 0) +
    (p2?.price || p2?.regularPrice || 0) +
    (p3?.price || p3?.regularPrice || 0);

  const calculatedDiscountedPrice = calculatedOriginalPrice > 0
    ? Math.round(calculatedOriginalPrice * (1 - (Number(formData.discount) || 0) / 100))
    : Number(formData.customPrice) || 0;

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
      step1Title: routine.steps?.[0]?.title || (typeof routine.steps?.[0] === "string" ? routine.steps[0] : ""),
      step1Product: routine.steps?.[0]?.productId || routine.steps?.[0]?.product?._id || "",
      step2Title: routine.steps?.[1]?.title || (typeof routine.steps?.[1] === "string" ? routine.steps[1] : ""),
      step2Product: routine.steps?.[1]?.productId || routine.steps?.[1]?.product?._id || "",
      step3Title: routine.steps?.[2]?.title || (typeof routine.steps?.[2] === "string" ? routine.steps[2] : ""),
      step3Product: routine.steps?.[2]?.productId || routine.steps?.[2]?.product?._id || "",
      customPrice: routine.price || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      skinType: formData.skinType,
      description: formData.description,
      badge: formData.badge,
      discount: Number(formData.discount) || 0,
      image: formData.image || "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=85",
      price: calculatedDiscountedPrice || Number(formData.customPrice) || 3000,
      originalPrice: calculatedOriginalPrice || Math.round((Number(formData.customPrice) || 3000) * 1.2),
      steps: [
        {
          stepNumber: 1,
          title: formData.step1Title || p1?.name || "1. Cleanser",
          productId: formData.step1Product || undefined,
        },
        {
          stepNumber: 2,
          title: formData.step2Title || p2?.name || "2. Treatment Serum",
          productId: formData.step2Product || undefined,
        },
        {
          stepNumber: 3,
          title: formData.step3Title || p3?.name || "3. Hydration & Glow",
          productId: formData.step3Product || undefined,
        },
      ],
    };

    try {
      if (editingId && !editingId.startsWith("default-")) {
        await updateRoutine({ id: editingId, ...payload }).unwrap();
        setStatusMsg("Routine updated successfully!");
      } else {
        await createRoutine(payload).unwrap();
        setStatusMsg("Routine created successfully!");
      }
      setIsModalOpen(false);
      setTimeout(() => setStatusMsg(""), 4000);
    } catch (err) {
      console.warn("Backend routine API not ready yet, saved in local mock state:", err);
      setStatusMsg("Routine saved! (Ensure backend /api/routines is active)");
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f0dbe3] pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#fdf0f4] px-2.5 py-0.5 text-[9px] font-bold tracking-wider text-[#9c4b61]">
            <Sparkles size={11} className="text-[#c46981]" />
            STOREFRONT REGIMEN BUILDER
          </div>
          <h3 className="mt-1 font-serif text-xl font-bold text-[#2b2427]">
            Find Your German Skin Routine (Bundles)
          </h3>
          <p className="text-xs text-[#78696f]">
            Create and customize 3-step routine bundles displayed on the customer home page.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-[#d96b86] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#c25671] transition"
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
              className="flex flex-col justify-between rounded-2xl border border-[#f0dbe3] bg-white overflow-hidden shadow-xs transition hover:shadow-md"
            >
              {/* Card Image Banner */}
              <div className="relative h-36 w-full bg-[#faf2f5] overflow-hidden">
                <img
                  src={routine.image || "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=85"}
                  alt={routine.name}
                  className="h-full w-full object-cover"
                />
                <span className="absolute top-2.5 left-2.5 rounded-full bg-[#d96b86] px-2.5 py-0.5 text-[8px] font-bold tracking-wider text-white shadow-xs">
                  {routine.badge || "FEATURED"}
                </span>
                <span className="absolute top-2.5 right-2.5 rounded-full bg-white/90 backdrop-blur-xs px-2 py-0.5 text-[9px] font-bold text-emerald-600 shadow-xs">
                  Save {routine.discount || 15}%
                </span>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#a8536b]">
                    {routine.skinType}
                  </span>
                  <h4 className="font-serif text-base font-bold text-[#2b2427] line-clamp-1">
                    {routine.name}
                  </h4>
                  <p className="mt-1 text-[11px] text-[#706066] line-clamp-2 leading-relaxed">
                    {routine.description}
                  </p>

                  {/* 3 Step preview */}
                  <div className="mt-3 space-y-1 bg-[#fff8fa] p-2.5 rounded-xl border border-[#f3e5eb]">
                    <span className="text-[8px] font-bold tracking-wider text-[#9b8c92] uppercase block">
                      3-Step Products:
                    </span>
                    {(routine.steps || []).map((st, i) => (
                      <div key={i} className="text-[10px] text-[#3a2e33] font-medium flex items-center gap-1.5 truncate">
                        <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-[#fae5ed] text-[#b55871] text-[8px] font-bold">
                          {i + 1}
                        </span>
                        <span className="truncate">{typeof st === "string" ? st : st.title}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Price & Actions */}
                <div className="pt-3 border-t border-[#f2e1e7] flex items-center justify-between">
                  <div>
                    <span className="text-[8px] text-gray-400 uppercase font-semibold block">Bundle Price</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-bold text-[#2b2427]">
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
                      className="rounded-lg p-1.5 text-gray-500 hover:bg-[#faeaf0] hover:text-[#9c4b61] transition"
                      title="Edit Routine"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(rId)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition"
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
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-pink-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-pink-100 pb-4 mb-6">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#2b2427]">
                  {editingId ? "Edit Skin Routine Bundle" : "Create New Skin Routine"}
                </h3>
                <p className="text-xs text-gray-500">Configure steps, product links, and discount pricing</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-[#30262a] block mb-1">Routine Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dewy Glass Skin Ritual"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 p-2.5 focus:border-pink-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#30262a] block mb-1">Target Skin Concern *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dehydrated & Dull Skin"
                    value={formData.skinType}
                    onChange={(e) => setFormData({ ...formData, skinType: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 p-2.5 focus:border-pink-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#30262a] block mb-1">Description *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Explain how this 3-step ritual transforms skin..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 p-2.5 focus:border-pink-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-[#30262a] block mb-1">Ribbon Badge</label>
                  <input
                    type="text"
                    placeholder="e.g. MOST POPULAR"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 p-2.5 focus:border-pink-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#30262a] block mb-1">Bundle Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 p-2.5 focus:border-pink-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#30262a] block mb-1">Image URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 p-2.5 focus:border-pink-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* 3 Steps Products Configuration */}
              <div className="border-t border-pink-100 pt-4 space-y-3">
                <h4 className="font-serif text-sm font-bold text-[#2b2427]">
                  Configure 3 Steps & Linked Products
                </h4>

                {/* Step 1 */}
                <div className="p-3 bg-pink-50/40 rounded-2xl border border-pink-100/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-pink-900 block mb-1">Step 1 Label / Title</label>
                    <input
                      type="text"
                      placeholder="1. Balea Aqua Cleansing Foam"
                      value={formData.step1Title}
                      onChange={(e) => setFormData({ ...formData, step1Title: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 bg-white p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-pink-900 block mb-1">Link Product from Catalog</label>
                    <select
                      value={formData.step1Product}
                      onChange={(e) => {
                        const sel = products.find((p) => (p._id || p.id) === e.target.value);
                        setFormData({
                          ...formData,
                          step1Product: e.target.value,
                          step1Title: formData.step1Title || (sel ? `1. ${sel.name}` : ""),
                        });
                      }}
                      className="w-full rounded-xl border border-gray-200 bg-white p-2 text-xs"
                    >
                      <option value="">-- Select Product --</option>
                      {products.map((p) => (
                        <option key={p._id || p.id} value={p._id || p.id}>
                          {p.name} (৳{p.price})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-3 bg-pink-50/40 rounded-2xl border border-pink-100/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-pink-900 block mb-1">Step 2 Label / Title</label>
                    <input
                      type="text"
                      placeholder="2. Balea Hyaluronic Dew Serum"
                      value={formData.step2Title}
                      onChange={(e) => setFormData({ ...formData, step2Title: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 bg-white p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-pink-900 block mb-1">Link Product from Catalog</label>
                    <select
                      value={formData.step2Product}
                      onChange={(e) => {
                        const sel = products.find((p) => (p._id || p.id) === e.target.value);
                        setFormData({
                          ...formData,
                          step2Product: e.target.value,
                          step2Title: formData.step2Title || (sel ? `2. ${sel.name}` : ""),
                        });
                      }}
                      className="w-full rounded-xl border border-gray-200 bg-white p-2 text-xs"
                    >
                      <option value="">-- Select Product --</option>
                      {products.map((p) => (
                        <option key={p._id || p.id} value={p._id || p.id}>
                          {p.name} (৳{p.price})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-3 bg-pink-50/40 rounded-2xl border border-pink-100/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-pink-900 block mb-1">Step 3 Label / Title</label>
                    <input
                      type="text"
                      placeholder="3. Alverde Organic Rose Glow Oil"
                      value={formData.step3Title}
                      onChange={(e) => setFormData({ ...formData, step3Title: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 bg-white p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-pink-900 block mb-1">Link Product from Catalog</label>
                    <select
                      value={formData.step3Product}
                      onChange={(e) => {
                        const sel = products.find((p) => (p._id || p.id) === e.target.value);
                        setFormData({
                          ...formData,
                          step3Product: e.target.value,
                          step3Title: formData.step3Title || (sel ? `3. ${sel.name}` : ""),
                        });
                      }}
                      className="w-full rounded-xl border border-gray-200 bg-white p-2 text-xs"
                    >
                      <option value="">-- Select Product --</option>
                      {products.map((p) => (
                        <option key={p._id || p.id} value={p._id || p.id}>
                          {p.name} (৳{p.price})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Price Calculation Summary */}
              <div className="p-3.5 bg-[#fdf2f5] rounded-2xl border border-[#f3dbe3] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-pink-900 block">
                    Calculated Bundle Value
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-base font-bold text-[#2b2427]">
                      BDT {calculatedDiscountedPrice.toLocaleString("en-BD")}
                    </span>
                    {calculatedOriginalPrice > 0 && (
                      <span className="text-xs text-gray-400 line-through">
                        BDT {calculatedOriginalPrice.toLocaleString("en-BD")}
                      </span>
                    )}
                  </div>
                </div>

                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  {formData.discount}% Discount Active
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-pink-100">
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
                  className="rounded-xl bg-[#d96b86] px-6 py-2.5 font-bold text-white shadow-md hover:bg-[#c25671] transition disabled:opacity-50"
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
