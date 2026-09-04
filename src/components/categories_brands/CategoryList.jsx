import { useState } from "react";
import { Edit3, Trash2, Plus, Sparkles, X, Check } from "lucide-react";
import { useAdminUI } from "../../context/AdminUIContext";

export default function CategoryList() {
  const { categories, updateCategory, deleteCategory } = useAdminUI();
  const [editingCat, setEditingCat] = useState(null);

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingCat) return;
    updateCategory(editingCat.id, editingCat);
    setEditingCat(null);
  };

  return (
    <div className="space-y-3">
      <div className="item-list">
        {categories.map((cat) => (
          <div className="list-item group transition hover:border-[#d96b86]/40" key={cat.id}>
            <span className="category-icon text-base">
              {cat.icon || "◇"}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <strong className="text-sm font-bold text-[#2b2427]">{cat.name}</strong>
                {cat.label && (
                  <span className="text-[10px] text-[#8e958d] font-normal hidden sm:inline">
                    • {cat.label}
                  </span>
                )}
              </div>
              <small className="text-[11px] text-[#8e958d]">
                {cat.count ?? 0} active products
              </small>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                className="icon-action text-[#7a8179] hover:text-[#d96b86]"
                onClick={() => setEditingCat(cat)}
                title="Edit Category"
              >
                <Edit3 size={13} />
              </button>
              <button
                type="button"
                className="icon-action text-[#7a8179] hover:text-red-600"
                onClick={() => {
                  if (confirm(`Are you sure you want to delete "${cat.name}" category?`)) {
                    deleteCategory(cat.id);
                  }
                }}
                title="Delete Category"
              >
                <Trash2 size={13} />
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
