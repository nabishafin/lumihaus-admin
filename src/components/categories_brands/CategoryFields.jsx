import { Upload } from "lucide-react";
import { FIELD_LABEL, FIELD_INPUT } from "./ui";

// Shared fields for the add / edit category modals. `value` is { name, label, icon, image };
// `onChange(patch)` merges a partial update. Holds no state of its own.
export default function CategoryFields({ value, onChange }) {
  const image = value.image || "";

  const pickFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange({ image: ev.target.result });
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      <div>
        <label className={FIELD_LABEL}>Name *</label>
        <input
          type="text"
          required
          value={value.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="e.g. Skin, Makeup, Supplements"
          className={FIELD_INPUT}
        />
        <p className="mt-1 text-xs text-[#2E4235]/60 dark:text-[#D2DDD6]/60">Short name used in shop filters.</p>
      </div>

      <div className="grid grid-cols-[1fr_96px] gap-3">
        <div>
          <label className={FIELD_LABEL}>Display label</label>
          <input
            type="text"
            value={value.label || ""}
            onChange={(e) => onChange({ label: e.target.value })}
            placeholder="e.g. German Skincare"
            className={FIELD_INPUT}
          />
        </div>
        <div>
          <label className={FIELD_LABEL}>Icon</label>
          <input
            type="text"
            value={value.icon}
            onChange={(e) => onChange({ icon: e.target.value })}
            placeholder="✨"
            className={`${FIELD_INPUT} text-center`}
          />
        </div>
      </div>

      <div>
        <label className={`${FIELD_LABEL} flex! items-baseline gap-1`}>
          Cover image <span className="font-normal text-[#2E4235]/50 dark:text-[#D2DDD6]/50">optional</span>
        </label>
        {image ? (
          <div className="flex items-center gap-3">
            <img
              src={image}
              alt="Cover preview"
              className="h-16 w-16 shrink-0 rounded-lg object-cover border border-[#DCD6CB] dark:border-white/10"
            />
            <div className="flex gap-2">
              <label className="inline-flex! items-center px-3 py-1.5 text-xs! font-medium! rounded-lg border border-[#DCD6CB] dark:border-white/10 text-[#2E4235]! dark:text-[#D2DDD6]! hover:bg-[#F3EDE2] dark:hover:bg-white/5 transition cursor-pointer">
                Change
                <input type="file" accept="image/*" className="hidden" onChange={pickFile} />
              </label>
              <button
                type="button"
                onClick={() => onChange({ image: "" })}
                className="px-3 py-1.5 text-xs font-medium rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition cursor-pointer"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <label className="flex! items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-[#DCD6CB] dark:border-white/15 bg-[#FAF8F4] dark:bg-white/5 hover:border-[#8FAF9A] text-xs! font-normal! text-[#2E4235]/70! dark:text-[#D2DDD6]/70! transition cursor-pointer">
            <Upload size={14} />
            <span>Upload image</span>
            <input type="file" accept="image/*" className="hidden" onChange={pickFile} />
          </label>
        )}
        <input
          type="url"
          value={image.startsWith("data:") ? "" : image}
          onChange={(e) => onChange({ image: e.target.value })}
          placeholder="Or paste an image link"
          className={`${FIELD_INPUT} mt-2`}
        />
      </div>
    </div>
  );
}
