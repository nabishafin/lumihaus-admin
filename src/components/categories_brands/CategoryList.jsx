import {
  useGetCategoriesQuery,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation
} from "../../redux/features/catalogApi";
import { useState } from "react";
import { Edit3, Trash2, X, Check } from "lucide-react";
import toast from "react-hot-toast";
import confirmToast from "../../utils/confirmToast";
import { useAdminUI } from "../../context/AdminUIContext";
import CategoryFields from "./CategoryFields";
import { LIST, ROW, TILE, TITLE, MUTED, ICON_BUTTON, ICON_BUTTON_DANGER, PRIMARY_BUTTON, SECONDARY_BUTTON } from "./ui";


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
    const toastId = toast.loading(`Updating "${editingCat.name}" category...`);
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
      updateCategory(catId, editingCat, true);
      setEditingCat(null);
      toast.success(`Category "${editingCat.name}" updated successfully!`, { id: toastId });
    } catch (error) {
      // Keep the edit form open; a local-only change would never reach the storefront.
      toast.error(error?.data?.message || `Could not update "${editingCat.name}". Nothing was saved.`, { id: toastId, duration: 6000 });
    }
  };

  return (
    <div>
      <ul className={LIST}>
        {categories.map((cat) => (
          <li key={cat._id || cat.id} className={ROW}>
            {/* Category image */}
            <div className={`${TILE} bg-[#F3EDE2] dark:bg-white/5`}>
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

            {/* Name, label, product count */}
            <div className="flex-1 min-w-0">
              <p className={TITLE}>{cat.name}</p>
              <p className={`${MUTED} mt-0.5`}>
                {cat.label && cat.label !== cat.name ? `${cat.label} · ` : ""}
                {cat.count ?? 0} {(cat.count ?? 0) === 1 ? "product" : "products"}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                type="button"
                className={ICON_BUTTON}
                onClick={() => setEditingCat(cat)}
                title="Edit category"
                aria-label={`Edit ${cat.name}`}
              >
                <Edit3 size={15} />
              </button>
              <button
                type="button"
                className={ICON_BUTTON_DANGER}
                aria-label={`Delete ${cat.name}`}
                onClick={() => {
                  confirmToast({
                    title: "Delete Category?",
                    message: `Are you sure you want to permanently delete "${cat.name}"? Products under this category may become unassigned.`,
                    confirmLabel: "Yes, Delete",
                    onConfirm: async () => {
                      const toastId = toast.loading(`Deleting "${cat.name}" category...`);
                      try {
                        await deleteCategoryApi(cat._id || cat.id).unwrap();
                        deleteCategory(cat.id || cat._id, true);
                        toast.success(`Category "${cat.name}" deleted successfully!`, { id: toastId });
                      } catch (err) {
                        toast.error(err?.data?.message || `Could not delete "${cat.name}". It is still live.`, { id: toastId, duration: 6000 });
                      }
                    },
                  });
                }}
                title="Delete category"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Edit Category Modal */}
      {editingCat && (
        <div className="modal-backdrop">
          <form className="modal" onSubmit={handleSaveEdit}>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#141f17] dark:text-white">Edit category</h2>
              <button type="button" className={ICON_BUTTON} onClick={() => setEditingCat(null)} aria-label="Close">
                <X size={16} />
              </button>
            </div>

            <CategoryFields
              value={{ ...editingCat, icon: editingCat.icon || "✨" }}
              onChange={(patch) => setEditingCat({ ...editingCat, ...patch })}
            />

            <div className="flex justify-end gap-2">
              <button type="button" className={SECONDARY_BUTTON} onClick={() => setEditingCat(null)}>
                Cancel
              </button>
              <button type="submit" className={PRIMARY_BUTTON}>
                <Check size={14} /> Save changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

