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
    <div className="min-h-screen bg-[#171315] text-[#f5eaee] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      <title>LumiHaus Admin · Set New Password</title>

      <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#d96b86]/15 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#d96b86]/10 blur-[140px]" />

      <div className="w-full max-w-[440px] relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            Set New Password
          </h1>
          <p className="text-xs text-[#b8a6ad] mt-1.5 max-w-xs mx-auto leading-relaxed">
            Create a secure password for your LumiHaus Enterprise Administrator account.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-white/10 bg-[#241c21]/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-black/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-[10px] font-bold tracking-[0.15em] text-[#c9b5be] uppercase mb-1.5">
                New Password
              </label>
              <div className="flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 transition focus-within:border-[#d96b86] focus-within:ring-2 focus-within:ring-[#d96b86]/20">
                <Lock size={15} className="text-[#a8959e] shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters..."
                  className="w-full bg-transparent text-xs text-white outline-none placeholder:text-white/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#a8959e] hover:text-white transition"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[10px] font-bold tracking-[0.15em] text-[#c9b5be] uppercase mb-1.5">
                Confirm Password
              </label>
              <div className="flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 transition focus-within:border-[#d96b86] focus-within:ring-2 focus-within:ring-[#d96b86]/20">
                <Lock size={15} className="text-[#a8959e] shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password..."
                  className="w-full bg-transparent text-xs text-white outline-none placeholder:text-white/30"
                />
              </div>
            </div>

            {/* Password Requirements Checklist */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-3 space-y-1.5 text-[11px]">
              <div className={`flex items-center gap-2 ${hasMinLength ? "text-emerald-400" : "text-[#a8959e]"}`}>
                <Check size={13} className={hasMinLength ? "text-emerald-400" : "text-white/20"} />
                <span>At least 8 characters</span>
              </div>
              <div className={`flex items-center gap-2 ${hasNumber ? "text-emerald-400" : "text-[#a8959e]"}`}>
                <Check size={13} className={hasNumber ? "text-emerald-400" : "text-white/20"} />
                <span>Includes a number</span>
              </div>
              <div className={`flex items-center gap-2 ${isMatch ? "text-emerald-400" : "text-[#a8959e]"}`}>
                <Check size={13} className={isMatch ? "text-emerald-400" : "text-white/20"} />
                <span>Passwords match</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !hasMinLength || !isMatch}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d96b86] to-[#c25671] py-3 text-xs font-bold tracking-wider text-white shadow-lg shadow-[#d96b86]/25 hover:opacity-95 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span>Updating Password...</span>
              ) : (
                <>
                  <span>SAVE & LOG IN</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <Link
              to="/login"
              className="text-xs font-semibold text-[#f5c6d3] hover:text-white transition"
            >
              Cancel & Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
