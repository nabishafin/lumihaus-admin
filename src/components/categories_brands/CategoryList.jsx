import {
  useGetCategoriesQuery,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation
} from "../../redux/features/catalogApi";
import { useState } from "react";
import { Edit3, Trash2, Plus, Sparkles, X, Check, UploadCloud } from "lucide-react";
import { useAdminUI } from "../../context/AdminUIContext";


const CATEGORY_DEFAULT_IMAGES = {
  skin: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=300&q=80",
  makeup: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=300&q=80",
  body: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=300&q=80",
  baby: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=300&q=80",
  fragrance: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=300&q=80",
};

const getCatImage = (cat) => {
  if (cat.image && typeof cat.image === 'string' && cat.image.trim()) {
    return cat.image;
  }
  const key = (cat.name || '').toLowerCase().trim();
  return CATEGORY_DEFAULT_IMAGES[key] || "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=300&q=80";
};

export default function CategoryList() {
  const { categories: localCategories, updateCategory, deleteCategory } = useAdminUI();
  const { data: apiResponse, isLoading } = useGetCategoriesQuery();
  const [deleteCategoryApi] = useDeleteCategoryMutation();
  const [updateCategoryApi] = useUpdateCategoryMutation();
  const categories = apiResponse?.data || apiResponse || localCategories;
  const [editingCat, setEditingCat] = useState(null);

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingCat) return;
    const catId = editingCat._id || editingCat.id;
    try {
      if (catId) {
        await updateCategoryApi({
          id: catId,
          name: editingCat.name,
          label: editingCat.label,
          icon: editingCat.icon,
          image: editingCat.image,
        }).unwrap();
      }
      updateCategory(catId, editingCat);
      setEditingCat(null);
    } catch (error) {
      console.error("Failed to update category on backend:", error);
    }
  };

  return (
    <div className="space-y-3">
      <div className="item-list">
                {categories.map((cat) => (
          <div
            key={cat._id || cat.id}
            className="flex items-center gap-3.5 p-3 rounded-xl border border-[#eceeea] bg-white hover:border-[#d96b86]/50 hover:shadow-xs transition duration-200"
          >
            {/* Category Image Box */}
            <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-[#dfe3dc] bg-neutral-100 shrink-0 shadow-xs">
              <img
                src={getCatImage(cat)}
                alt={cat.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=300&q=80";
                }}
              />
            </div>

            {/* Title & Metadata */}
            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-center gap-2">
                <strong className="text-sm font-bold text-[#2b2427] truncate">
                  {cat.name}
                </strong>
                {cat.label && (
                  <span className="text-[11px] text-[#8e958d] font-normal truncate hidden sm:inline">
                    • {cat.label}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#8e958d] mt-0.5 font-medium">
                {cat.count ?? 0} active products
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                className="icon-action text-[#7a8179] hover:text-[#d96b86] p-1.5 rounded hover:bg-neutral-100 transition cursor-pointer"
                onClick={() => setEditingCat(cat)}
                title="Edit Category"
              >
                <Edit3 size={15} />
              </button>
              <button
                type="button"
                className="icon-action text-[#7a8179] hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition cursor-pointer"
                onClick={async () => {
                  if (confirm(`Are you sure you want to delete "${cat.name}" category?`)) {
                    try {
                      await deleteCategoryApi(cat._id || cat.id).unwrap();
                    } catch (err) {
                      console.error("API delete category notice:", err);
                    }
                    deleteCategory(cat.id);
                  }
                }}
                title="Delete Category"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Category Modal */}
      {editingCat && (
        <div className="modal-backdrop">
          <form className="modal" onSubmit={handleSaveEdit}>
            <div className="section-head">
              <h2>Edit Category</h2>
              <button
                type="button"
                className="icon-action"
                onClick={() => setEditingCat(null)}
              >
                <X size={16} />
              </button>
            </div>

            <label className="block text-xs font-bold text-[#60685f]">
              Category Code / Short Name (used in filters)
              <input
                type="text"
                required
                value={editingCat.name}
                onChange={(e) => setEditingCat({ ...editingCat, name: e.target.value })}
                className="mt-1 w-full"
              />
            </label>

            <label className="block text-xs font-bold text-[#60685f]">
              Full Display Label
              <input
                type="text"
                value={editingCat.label || ""}
                onChange={(e) => setEditingCat({ ...editingCat, label: e.target.value })}
                placeholder="e.g. German Skincare & Elixirs"
                className="mt-1 w-full"
              />
            </label>

            <label className="block text-xs font-bold text-[#60685f]">
              Emoji / Icon Symbol
              <input
                type="text"
                value={editingCat.icon || "✨"}
                onChange={(e) => setEditingCat({ ...editingCat, icon: e.target.value })}
                className="mt-1 w-full"
              />
            </label>

            {/* Edit Cover Image - Direct Upload & Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#60685f]">
                  Category Cover Image (সরাসরি ছবি আপলোড করুন)
                </span>
                <span className="text-[10px] text-neutral-400">ঐচ্ছিক / Optional</span>
              </div>

              {editingCat.image ? (
                <div className="relative w-full h-36 rounded-xl overflow-hidden border border-neutral-300 bg-neutral-100 group">
                  <img
                    src={editingCat.image}
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
                            reader.onload = (ev) => setEditingCat({ ...editingCat, image: ev.target.result });
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setEditingCat({ ...editingCat, image: "" })}
                      className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-md hover:bg-red-700 transition shadow-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center p-5 border-2 border-dashed border-[#dfe3dc] bg-[#fafbf9] hover:border-[#d96b86]/70 hover:bg-[#fff9fa] rounded-xl transition">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => setEditingCat({ ...editingCat, image: ev.target.result });
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <div className="h-9 w-9 rounded-full bg-[#fdf2f6] text-[#b55871] flex items-center justify-center mb-1">
                    <UploadCloud size={18} />
                  </div>
                  <p className="text-xs font-bold text-[#2b2427]">
                    কম্পিউটার থেকে ছবি বাছাই করুন (Browse Image)
                  </p>
                </label>
              )}

              <input
                type="url"
                value={editingCat.image?.startsWith("data:") ? "" : (editingCat.image || "")}
                onChange={(e) => setEditingCat({ ...editingCat, image: e.target.value })}
                placeholder="অথবা অনলাইন ছবির লিঙ্ক পেস্ট করুন (e.g. https://...)"
                className="w-full text-[11px] px-3 py-1.5 border border-neutral-200 rounded-lg outline-none focus:border-black"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="button secondary"
                onClick={() => setEditingCat(null)}
              >
                Cancel
              </button>
              <button type="submit" className="button">
                <Check size={14} /> Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
