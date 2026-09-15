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
    <div className="min-h-screen bg-[#0f1a13] text-[#F9F6EF] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans">
      <title>LumiHaus Admin - Set New Password</title>

      <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#8FAF9A]/15 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#26382E]/40 blur-[140px]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#8FAF9A]/5 blur-[100px]" />

      <div className="w-full max-w-[440px] relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#8FAF9A] text-[#26382E] font-black text-2xl font-serif mb-4 shadow-lg shadow-[#8FAF9A]/20">
            L
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
            Set New Password
          </h1>
          <p className="text-sm font-medium text-[#c5d6cc] mt-2 max-w-xs mx-auto leading-relaxed">
            Create a secure password for your LumiHaus Enterprise Administrator account.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-[#3a5045]/60 bg-[#1a2820]/95 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-black/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-xs font-extrabold tracking-[0.15em] text-[#8FAF9A] uppercase mb-2">
                New Password
              </label>
              <div className="flex items-center gap-2.5 rounded-xl border border-[#3a5045] bg-[#26382E]/50 px-4 py-3 transition focus-within:border-[#8FAF9A] focus-within:ring-2 focus-within:ring-[#8FAF9A]/20">
                <Lock size={17} className="text-[#8FAF9A] shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters..."
                  className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#8FAF9A] hover:text-white transition cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-extrabold tracking-[0.15em] text-[#8FAF9A] uppercase mb-2">
                Confirm Password
              </label>
              <div className="flex items-center gap-2.5 rounded-xl border border-[#3a5045] bg-[#26382E]/50 px-4 py-3 transition focus-within:border-[#8FAF9A] focus-within:ring-2 focus-within:ring-[#8FAF9A]/20">
                <Lock size={17} className="text-[#8FAF9A] shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password..."
                  className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/40"
                />
              </div>
            </div>

            {/* Password Requirements Checklist */}
            <div className="rounded-xl bg-[#26382E]/60 border border-[#3a5045] p-3.5 space-y-2 text-xs font-semibold">
              <div className={`flex items-center gap-2.5 ${hasMinLength ? "text-emerald-300" : "text-[#8FAF9A]/60"}`}>
                <Check size={15} className={hasMinLength ? "text-emerald-300" : "text-white/20"} />
                <span>At least 8 characters</span>
              </div>
              <div className={`flex items-center gap-2.5 ${hasNumber ? "text-emerald-300" : "text-[#8FAF9A]/60"}`}>
                <Check size={15} className={hasNumber ? "text-emerald-300" : "text-white/20"} />
                <span>Includes a number</span>
              </div>
              <div className={`flex items-center gap-2.5 ${isMatch ? "text-emerald-300" : "text-[#8FAF9A]/60"}`}>
                <Check size={15} className={isMatch ? "text-emerald-300" : "text-white/20"} />
                <span>Passwords match</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !hasMinLength || !isMatch}
              className="w-full mt-3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8FAF9A] to-[#6d947b] hover:from-[#a0c2ab] hover:to-[#7ca68a] py-3.5 text-sm font-black tracking-wider text-[#0f1a13] shadow-lg shadow-[#8FAF9A]/20 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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

          <div className="mt-6 pt-5 border-t border-[#3a5045]/60 text-center">
            <Link
              to="/login"
              className="text-sm font-bold text-[#8FAF9A] hover:text-white transition"
            >
              Cancel & Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
