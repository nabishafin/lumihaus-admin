import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ShieldCheck, Lock, Mail, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { useAdminUI } from "../../context/AdminUIContext";
import { useLoginMutation } from "../../redux/features/authApi";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../redux/slice/authSlice";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { notify } = useAdminUI();
  const [loginApi, { isLoading: isLoggingIn }] = useLoginMutation();

  const [email, setEmail] = useState("admin@lumihaus.com");
  const [password, setPassword] = useState("lumihaus2026");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter your admin email and password");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Verifying credentials...");

    try {
      const res = await loginApi({ email, password }).unwrap();
      const token = res?.data?.token || res?.token;
      const user = res?.data?.user || res?.user || { email, role: "admin" };

      if (token) {
        dispatch(setCredentials({ user, token }));
        localStorage.setItem("lumihaus_admin_token", token);
        localStorage.setItem("admin_token", token);
      } else {
        localStorage.setItem("lumihaus_admin_token", "admin-session-active");
      }

      toast.success("Welcome back to LumiHaus Console!", { id: toastId });
      notify("Welcome back to LumiHaus Console", "success");
      navigate("/");
    } catch (err) {
      const errorMessage =
        err?.data?.message ||
        err?.error ||
        "Invalid email or password. Please try again.";
      toast.error(errorMessage, { id: toastId });
      notify(errorMessage, "warning");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1a13] text-[#F9F6EF] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      <title>LumiHaus Admin — Secure Login</title>

      {/* Ambient background glows */}
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
            lumihaus
          </h1>
          <p className="text-xs text-[#8FAF9A]/80 mt-1.5 tracking-widest uppercase">
            Admin Console · Secure Control Panel
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl border border-[#3a5045]/60 bg-[#1a2820]/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-black/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-[10px] font-bold tracking-[0.15em] text-[#8FAF9A]/80 uppercase mb-1.5">
                Admin Email
              </label>
              <div className="flex items-center gap-2.5 rounded-xl border border-[#3a5045] bg-[#26382E]/50 px-3.5 py-2.5 transition focus-within:border-[#8FAF9A] focus-within:ring-2 focus-within:ring-[#8FAF9A]/20">
                <Mail size={15} className="text-[#8FAF9A]/60 shrink-0" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@lumihaus.com"
                  className="w-full bg-transparent text-xs text-white outline-none placeholder:text-white/30"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-bold tracking-[0.15em] text-[#8FAF9A]/80 uppercase">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] text-[#8FAF9A] hover:text-white hover:underline transition"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl border border-[#3a5045] bg-[#26382E]/50 px-3.5 py-2.5 transition focus-within:border-[#8FAF9A] focus-within:ring-2 focus-within:ring-[#8FAF9A]/20">
                <Lock size={15} className="text-[#8FAF9A]/60 shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-transparent text-xs text-white outline-none placeholder:text-white/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#8FAF9A]/60 hover:text-[#8FAF9A] transition"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-[#F9F6EF]/60">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-white/20 bg-white/5 accent-[#8FAF9A] focus:ring-0 focus:ring-offset-0"
                />
                Remember this session
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#8FAF9A] hover:bg-[#a0c2ab] py-3 text-xs font-bold tracking-wider text-[#26382E] shadow-lg shadow-[#8FAF9A]/20 active:scale-[0.99] transition disabled:opacity-60"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>SIGN IN TO CONSOLE</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Pill */}
          <div className="mt-6 pt-5 border-t border-[#3a5045] text-center">
            <p className="text-[10px] text-[#F9F6EF]/40 mb-2">Demo Admin Credentials:</p>
            <div className="inline-flex items-center gap-2 rounded-lg bg-[#26382E] border border-[#3a5045] px-3 py-1.5 text-[11px] font-mono text-[#8FAF9A]">
              <span>admin@lumihaus.com</span>
              <span className="text-white/30">·</span>
              <span>lumihaus2026</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[10px] text-[#8FAF9A]/30 mt-8 tracking-widest uppercase">
          © 2026 LumiHaus Enterprise · 256-bit SSL Encryption
        </p>
      </div>
    </div>
  );
}
