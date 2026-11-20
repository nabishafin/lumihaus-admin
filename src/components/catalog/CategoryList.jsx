import {
  useGetCategoriesQuery,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation
} from "../../redux/api/catalogApi";
import { useGetProductsQuery } from "../../redux/api/productApi";
import { useMemo, useState } from "react";
import { Edit3, Trash2, X, Check } from "lucide-react";
import toast from "react-hot-toast";
import confirmToast from "../../utils/confirmToast";
import { useAdminUI } from "../../context/AdminUIContext";
import CategoryFields from "./CategoryFields";
import { LIST, ROW, TILE, TITLE, MUTED, ICON_BUTTON, ICON_BUTTON_DANGER, PRIMARY_BUTTON, SECONDARY_BUTTON } from "./ui";


export default function CategoryList() {
  const { categories: localCategories, updateCategory, deleteCategory } = useAdminUI();
  const { data: apiResponse, isLoading } = useGetCategoriesQuery();
  const [deleteCategoryApi] = useDeleteCategoryMutation();
  const [updateCategoryApi] = useUpdateCategoryMutation();
  const categories = apiResponse?.data || apiResponse || localCategories;
  // The categories API has no product counts; count them from the product list (max 100 per request).
  const { data: productsResponse } = useGetProductsQuery({ limit: 100 });
  const productCounts = useMemo(() => {
    const list = productsResponse?.data || productsResponse?.products || [];
    const total = productsResponse?.pagination?.total ?? list.length;
    if (!Array.isArray(list) || total > list.length) return null; // partial list: don't show wrong numbers
    return list.reduce((acc, p) => {
      const key = String(p.category || "").trim().toLowerCase();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [productsResponse]);
  const countFor = (cat) =>
    productCounts ? productCounts[String(cat.name || "").trim().toLowerCase()] || 0 : cat.count;
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
            {/* Initial tile (the store shows categories as text links, not images) */}
            <div className={`${TILE} flex items-center justify-center bg-[#F3EDE2] dark:bg-white/5 font-semibold text-[#2E4235] dark:text-[#D2DDD6]`} aria-hidden="true">
              {(cat.label || cat.name || "?").trim().charAt(0).toUpperCase()}
            </div>

            {/* Name, label, product count */}
            <div className="flex-1 min-w-0">
              <p className={TITLE}>{cat.name}</p>
              <p className={`${MUTED} mt-0.5`}>
                {cat.label && cat.label !== cat.name ? `${cat.label} · ` : ""}
                {countFor(cat) === undefined ? "" : `${countFor(cat)} ${countFor(cat) === 1 ? "product" : "products"}`}
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
              value={editingCat}
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

