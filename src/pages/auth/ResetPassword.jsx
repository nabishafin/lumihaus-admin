import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight, ShieldCheck, Check } from "lucide-react";
import { useAdminUI } from "../../context/AdminUIContext";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { notify } = useAdminUI();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Live password strength calculation
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isMatch = password && password === confirmPassword;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!hasMinLength) {
      notify("Password must be at least 8 characters", "warning");
      return;
    }
    if (!isMatch) {
      notify("Passwords do not match", "warning");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem("lumihaus_admin_token", "admin-session-active");
      notify("Password updated successfully! Welcome back.");
      navigate("/");
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[#F9F6EF] text-[#26382E] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans">
      <title>LumiHaus Admin - Set New Password</title>

      <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#8FAF9A]/20 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#EEF3EF] blur-[130px]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#8FAF9A]/10 blur-[120px]" />

      <div className="w-full max-w-[440px] relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/login" className="inline-block" title="LumiHaus">
            <img
              src="/logo.png"
              alt="LumiHaus"
              className="h-16 sm:h-20 w-auto object-contain mx-auto mb-3"
            />
          </Link>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#26382E] tracking-tight">
            Set New Password
          </h1>
          <p className="text-xs text-[#26382E]/70 font-semibold mt-2 max-w-xs mx-auto leading-relaxed">
            Create a secure password for your LumiHaus Enterprise Administrator account.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-[#DCD6CB] bg-white p-7 sm:p-9 shadow-xl shadow-[#26382E]/5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-[11px] font-extrabold tracking-[0.12em] text-[#26382E] uppercase mb-2">
                New Password
              </label>
              <div className="flex items-center gap-2.5 rounded-xl border-2 border-[#DCD6CB] bg-[#F9F6EF] px-4 py-3 transition focus-within:border-[#26382E] focus-within:bg-white">
                <Lock size={17} className="text-[#26382E]/60 shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters..."
                  className="w-full bg-transparent text-sm font-medium text-[#17251C] outline-none placeholder:text-[#26382E]/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#26382E]/60 hover:text-[#26382E] transition cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[11px] font-extrabold tracking-[0.12em] text-[#26382E] uppercase mb-2">
                Confirm Password
              </label>
              <div className="flex items-center gap-2.5 rounded-xl border-2 border-[#DCD6CB] bg-[#F9F6EF] px-4 py-3 transition focus-within:border-[#26382E] focus-within:bg-white">
                <Lock size={17} className="text-[#26382E]/60 shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password..."
                  className="w-full bg-transparent text-sm font-medium text-[#17251C] outline-none placeholder:text-[#26382E]/40"
                />
              </div>
            </div>

            {/* Password Requirements Checklist */}
            <div className="rounded-xl bg-[#F9F6EF] border border-[#DCD6CB] p-3.5 space-y-2 text-xs font-semibold">
              <div className={`flex items-center gap-2.5 ${hasMinLength ? "text-emerald-700" : "text-[#26382E]/40"}`}>
                <Check size={15} className={hasMinLength ? "text-emerald-700" : "text-[#26382E]/30"} />
                <span>At least 8 characters</span>
              </div>
              <div className={`flex items-center gap-2.5 ${hasNumber ? "text-emerald-700" : "text-[#26382E]/40"}`}>
                <Check size={15} className={hasNumber ? "text-emerald-700" : "text-[#26382E]/30"} />
                <span>Includes a number</span>
              </div>
              <div className={`flex items-center gap-2.5 ${isMatch ? "text-emerald-700" : "text-[#26382E]/40"}`}>
                <Check size={15} className={isMatch ? "text-emerald-700" : "text-[#26382E]/30"} />
                <span>Passwords match</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !hasMinLength || !isMatch}
              className="w-full mt-3 flex items-center justify-center gap-2 rounded-xl bg-[#26382E] hover:bg-[#1a2820] py-3.5 text-xs font-bold tracking-wider text-[#F9F6EF] shadow-md shadow-[#26382E]/15 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <span>UPDATING PASSWORD...</span>
              ) : (
                <>
                  <span>SAVE & LOG IN</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#DCD6CB] text-center">
            <Link
              to="/login"
              className="text-xs font-bold text-[#26382E]/80 hover:text-[#26382E] transition"
            >
              Cancel & Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
