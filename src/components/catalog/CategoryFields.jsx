import { FIELD_LABEL, FIELD_INPUT } from "./ui";

// Shared fields for the add / edit category modals. `value` is { name, label };
// `onChange(patch)` merges a partial update. Holds no state of its own.
export default function CategoryFields({ value, onChange }) {
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

      <div>
        <label className={FIELD_LABEL}>Display label</label>
        <input
          type="text"
          value={value.label || ""}
          onChange={(e) => onChange({ label: e.target.value })}
          placeholder="e.g. German Skincare"
          className={FIELD_INPUT}
        />
        <p className="mt-1 text-xs text-[#2E4235]/60 dark:text-[#D2DDD6]/60">Shown in the store menu and footer.</p>
      </div>
    </div>
  );
}
