import { useState } from "react";
import { X, UserCog, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

const ROLES = [
  {
    value: "customer",
    label: "Customer",
    desc: "Storefront only. No access to this console.",
  },
  {
    value: "admin",
    label: "Admin",
    desc: "Full console access: orders, products, expenses, CMS.",
  },
  {
    value: "super_admin",
    label: "Super Admin",
    desc: "Everything an admin can do, plus creating, demoting and deleting admins.",
  },
];

export default function ChangeRoleModal({ user, onClose, onSave, isSaving }) {
  const currentRole = user?.role || "customer";
  const [role, setRole] = useState(currentRole);

  if (!user) return null;

  const hasChanged = role !== currentRole;
  const isDemotingStaff =
    (currentRole === "admin" || currentRole === "super_admin") && role === "customer";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    if (!hasChanged) {
      toast("No change to save.");
      return;
    }
    await onSave(user, role);
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form
        className="modal"
        style={{ width: "min(500px, calc(100% - 30px))" }}
        onMouseDown={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="section-head flex items-start justify-between pb-3 border-b border-neutral-200 dark:border-white/10">
          <div>
            <span className="page-kicker text-[11px] font-bold tracking-wider text-[#8FAF9A] uppercase flex items-center gap-1.5">
              <UserCog size={14} />
              ROLE & PERMISSIONS
            </span>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white mt-0.5">
              {user.name || user.email}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-zinc-400 mt-0.5">
              {user.email}
            </p>
          </div>
          <button
            type="button"
            className="icon-action cursor-pointer"
            onClick={onClose}
            disabled={isSaving}
          >
            <X size={17} />
          </button>
        </div>

        <div className="grid gap-2">
          {ROLES.map((option) => {
            const isActive = role === option.value;
            return (
              <label
                key={option.value}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                  isActive
                    ? "border-[#26382E] bg-[#EEF3EF] dark:bg-white/5"
                    : "border-neutral-200 dark:border-white/10 hover:border-[#8FAF9A]"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={option.value}
                  checked={isActive}
                  onChange={() => setRole(option.value)}
                  className="mt-0.5 accent-[#26382E]"
                  style={{ width: "auto" }}
                />
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-neutral-900 dark:text-white">
                    {option.label}
                    {option.value === currentRole && (
                      <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-[#8FAF9A]">
                        Current
                      </span>
                    )}
                  </span>
                  <span className="block text-xs text-neutral-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                    {option.desc}
                  </span>
                </span>
              </label>
            );
          })}
        </div>

        {isDemotingStaff && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-lg text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2 leading-relaxed">
            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            <span>
              This removes their console access immediately. Any session they
              have open stops working on the next request.
            </span>
          </div>
        )}

        <div className="modal-actions" style={{ justifyContent: "flex-end" }}>
          <button
            type="button"
            className="button secondary cursor-pointer"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="button cursor-pointer"
            disabled={isSaving || !hasChanged}
          >
            {isSaving ? "Saving..." : "Save role"}
          </button>
        </div>
      </form>
    </div>
  );
}
