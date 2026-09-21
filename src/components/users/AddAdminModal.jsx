import { useState } from "react";
import { X, ShieldCheck, Eye, EyeOff, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

const MIN_PASSWORD = 8;

export default function AddAdminModal({ onClose, onCreate, isSaving }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "admin",
  });
  const [showPassword, setShowPassword] = useState(false);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    if (!name) return toast.error("Enter the admin's full name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return toast.error("Enter a valid email address.");
    }
    if (form.password.length < MIN_PASSWORD) {
      return toast.error(`Password must be at least ${MIN_PASSWORD} characters.`);
    }
    if (form.password !== form.confirmPassword) {
      return toast.error("Passwords do not match.");
    }

    await onCreate({
      name,
      email,
      phone: form.phone.trim() || undefined,
      password: form.password,
      role: form.role,
    });
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form
        className="modal"
        style={{ width: "min(520px, calc(100% - 30px))" }}
        onMouseDown={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="section-head flex items-start justify-between pb-3 border-b border-neutral-200 dark:border-white/10">
          <div>
            <span className="page-kicker text-[11px] font-bold tracking-wider text-[#8FAF9A] uppercase flex items-center gap-1.5">
              <ShieldCheck size={14} />
              CONSOLE ACCESS
            </span>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white mt-0.5">
              Add a new admin
            </h2>
            <p className="text-xs text-neutral-500 dark:text-zinc-400 mt-0.5">
              They can sign in at the console immediately with this email and password.
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

        <div className="form-grid" style={{ marginTop: 0 }}>
          <label className="full" style={{ gridColumn: "1 / -1" }}>
            Full name *
            <input
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="e.g. Shafin Ahmed"
              required
            />
          </label>

          <label>
            Email address *
            <input
              type="email"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="name@lumihaus.com"
              autoComplete="off"
              required
            />
          </label>

          <label>
            Mobile number
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
              placeholder="01712345678"
            />
          </label>

          <label>
            Password *
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setField("password", e.target.value)}
                placeholder={`Min ${MIN_PASSWORD} characters`}
                autoComplete="new-password"
                required
                style={{ paddingRight: 36 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-zinc-200 cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </label>

          <label>
            Confirm password *
            <input
              type={showPassword ? "text" : "password"}
              value={form.confirmPassword}
              onChange={(e) => setField("confirmPassword", e.target.value)}
              placeholder="Repeat password"
              autoComplete="new-password"
              required
            />
          </label>

          <label style={{ gridColumn: "1 / -1" }}>
            Role
            <select value={form.role} onChange={(e) => setField("role", e.target.value)}>
              <option value="admin">Admin — full console access</option>
              <option value="super_admin">
                Super Admin — can also manage admins and roles
              </option>
            </select>
          </label>
        </div>

        {form.role === "super_admin" && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-lg text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            A super admin can create and delete other admins, including you. Only
            grant this to someone who should have that control.
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
          <button type="submit" className="button cursor-pointer" disabled={isSaving}>
            <UserPlus size={14} />
            {isSaving ? "Creating..." : "Create admin"}
          </button>
        </div>
      </form>
    </div>
  );
}
