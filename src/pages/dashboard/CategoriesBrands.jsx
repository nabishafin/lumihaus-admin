import { useCreateCategoryMutation } from "../../redux/features/catalogApi";
import { useState } from "react";
import { Plus, X, Sparkles, Check, UploadCloud } from "lucide-react";
import CategoryList from "../../components/categories_brands/CategoryList";
import BrandLogoUpload from "../../components/categories_brands/BrandLogoUpload";
import { useAdminUI } from "../../context/AdminUIContext";

export default function CategoriesBrands() {
  const { addCategory } = useAdminUI();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatLabel, setNewCatLabel] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("✨");
  const [newCatImage, setNewCatImage] = useState("");

  const [createCategoryApi] = useCreateCategoryMutation();

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      await createCategoryApi({
        name: newCatName.trim(),
        label: newCatLabel.trim() || newCatName.trim(),
        icon: newCatIcon.trim() || "✨",
        image: newCatImage.trim() || undefined,
      }).unwrap();

      addCategory({
        name: newCatName.trim(),
        label: newCatLabel.trim() || newCatName.trim(),
        icon: newCatIcon.trim() || "✨",
        image: newCatImage.trim() || "",
      });

      setNewCatName("");
      setNewCatLabel("");
      setNewCatIcon("✨");
      setNewCatImage("");
      setShowAddModal(false);
    } catch (error) {
      console.error("Failed to save category to backend:", error);
    }
  };

  return (
    <>
      <title>Lumihaus Admin · Categories & Brands</title>

      <div className="page-heading">
        <div>
          <span className="page-kicker">CATALOG MERCHANDISING</span>
          <h2>Categories & Brands</h2>
          <p>Organize categories and brands that appear dynamically across your storefront.</p>
        </div>
        <button
          className="button"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={15} /> New category
        </button>
      </div>

      <div className="two-column">
        {/* Categories Section */}
        <section className="card">
          <div className="section-head">
            <div>
              <h2>Catalog Categories</h2>
              <p>Active categories linked to product filters & shop navigation.</p>
            </div>
            <button
              className="button secondary text-xs"
              onClick={() => setShowAddModal(true)}
            >
              + Add
            </button>
          </div>
          <CategoryList />
        </section>

        {/* Brand Assets Section */}
        <section className="card">
          <div className="section-head">
            <div>
              <h2>German Brand Partners</h2>
              <p>Curated drugstore brands sourced directly from Europe.</p>
            </div>
          </div>
          <BrandLogoUpload />
        </section>
      </div>

      {/* Add New Category Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <form className="modal" onSubmit={handleCreateCategory}>
            <div className="section-head">
              <div>
                <span className="page-kicker">NEW ENTRY</span>
                <h2>Add New Category</h2>
              </div>
              <button
                type="button"
                className="icon-action"
                onClick={() => setShowAddModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            <label className="block text-xs font-bold text-[#60685f]">
              Category Code / Short Name * (e.g. Skin, Makeup, Supplements)
              <input
                type="text"
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="e.g. Supplements, Fragrance, Mom"
                className="mt-1 w-full"
              />
            </label>

            <label className="block text-xs font-bold text-[#60685f]">
              Full Display Label (e.g. German Dietary Supplements)
              <input
                type="text"
                value={newCatLabel}
                onChange={(e) => setNewCatLabel(e.target.value)}
                placeholder="e.g. German Wellness & Supplements"
                className="mt-1 w-full"
              />
            </label>

            <label className="block text-xs font-bold text-[#60685f]">
              Icon / Emoji Symbol
              <input
                type="text"
                value={newCatIcon}
                onChange={(e) => setNewCatIcon(e.target.value)}
                placeholder="💊, ✨, 🧴, 🌸"
                className="mt-1 w-full"
              />
            </label>

            {/* Category Cover Image - Direct Upload & Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#60685f]">
                  Category Cover Image (সরাসরি ছবি আপলোড করুন)
                </span>
                <span className="text-[10px] text-neutral-400">ঐচ্ছিক / Optional</span>
              </div>

              {newCatImage ? (
                <div className="relative w-full h-36 rounded-xl overflow-hidden border border-neutral-300 bg-neutral-100 group">
                  <img
                    src={newCatImage}
                    alt="Category Cover Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <label className="bg-white text-[#1e171b] text-xs font-bold px-3 py-1.5 rounded-md cursor-pointer hover:bg-neutral-100 transition shadow-sm">
                      Change Photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => setNewCatImage(ev.target.result);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setNewCatImage("")}
                      className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-md hover:bg-red-700 transition shadow-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded font-medium">
                    Hover to change / remove
                  </span>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#dfe3dc] bg-[#fafbf9] hover:border-[#d96b86]/70 hover:bg-[#fff9fa] rounded-xl transition">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => setNewCatImage(ev.target.result);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <div className="h-10 w-10 rounded-full bg-[#fdf2f6] text-[#b55871] flex items-center justify-center mb-1.5">
                    <UploadCloud size={20} />
                  </div>
                  <p className="text-xs font-bold text-[#2b2427]">
                    কম্পিউটার বা ডিভাইস থেকে ছবি নির্বাচন করুন (Browse Image)
                  </p>
                  <p className="text-[10px] text-[#8e958d] mt-0.5">
                    PNG, JPG, WEBP ফাইল সাপোর্টেড
                  </p>
                </label>
              )}

              <input
                type="url"
                value={newCatImage.startsWith("data:") ? "" : newCatImage}
                onChange={(e) => setNewCatImage(e.target.value)}
                placeholder="অথবা অনলাইন ছবির লিঙ্ক পেস্ট করুন (e.g. https://...)"
                className="w-full text-[11px] px-3 py-1.5 border border-neutral-200 rounded-lg outline-none focus:border-black"
              />
              <span className="block text-[10px] text-neutral-400">
                💡 খালি রাখলে সিস্টেম নিজে থেকেই এই ক্যাটাগরির প্রোডাক্টের ছবি দেখাবে।
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="button secondary"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="button">
                <Check size={14} /> Create Category
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
