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
    <div className="min-h-screen bg-[#F9F6EF] text-[#26382E] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      <title>LumiHaus Admin — Secure Login</title>

      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#8FAF9A]/20 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#EEF3EF] blur-[130px]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#8FAF9A]/10 blur-[120px]" />

      <div className="w-full max-w-[440px] relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#26382E] text-[#F9F6EF] font-black text-2xl font-serif mb-4 shadow-lg shadow-[#26382E]/15">
            L
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#26382E] tracking-tight">
            lumihaus
          </h1>
          <p className="text-xs text-[#26382E]/70 font-semibold mt-1.5 tracking-widest uppercase">
            Admin Console · Secure Control Panel
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl border border-[#DCD6CB] bg-white p-7 sm:p-9 shadow-xl shadow-[#26382E]/5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-[11px] font-extrabold tracking-[0.12em] text-[#26382E] uppercase mb-1.5">
                Admin Email
              </label>
              <div className="flex items-center gap-2.5 rounded-xl border-2 border-[#DCD6CB] bg-[#F9F6EF] px-3.5 py-2.5 transition focus-within:border-[#26382E] focus-within:bg-white">
                <Mail size={16} className="text-[#26382E]/60 shrink-0" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@lumihaus.com"
                  className="w-full bg-transparent text-sm font-medium text-[#17251C] outline-none placeholder:text-[#26382E]/40"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-extrabold tracking-[0.12em] text-[#26382E] uppercase">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-bold text-[#26382E]/75 hover:text-[#26382E] hover:underline transition"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl border-2 border-[#DCD6CB] bg-[#F9F6EF] px-3.5 py-2.5 transition focus-within:border-[#26382E] focus-within:bg-white">
                <Lock size={16} className="text-[#26382E]/60 shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-transparent text-sm font-medium text-[#17251C] outline-none placeholder:text-[#26382E]/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#26382E]/60 hover:text-[#26382E] transition cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#26382E]/80">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#DCD6CB] text-[#26382E] accent-[#26382E] focus:ring-0"
                />
                Remember this session
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#26382E] hover:bg-[#1a2820] py-3.5 text-xs font-bold tracking-wider text-[#F9F6EF] shadow-md shadow-[#26382E]/15 active:scale-[0.99] transition disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>SIGN IN TO CONSOLE</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Pill */}
          <div className="mt-6 pt-5 border-t border-[#DCD6CB] text-center">
            <p className="text-[10px] font-bold text-[#26382E]/60 uppercase tracking-wider mb-2">
              Click to autofill demo credentials:
            </p>
            <button
              type="button"
              onClick={() => {
                setEmail("admin@lumihaus.com");
                setPassword("lumihaus2026");
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-[#F9F6EF] hover:bg-[#EEF3EF] border border-[#DCD6CB] px-3.5 py-2 text-[11px] font-mono font-bold text-[#26382E] transition cursor-pointer"
            >
              <span>admin@lumihaus.com</span>
              <span className="text-[#26382E]/30">·</span>
              <span>lumihaus2026</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[10px] font-semibold text-[#26382E]/50 mt-8 tracking-widest uppercase">
          © 2026 LumiHaus Enterprise · 256-bit SSL Encryption
        </p>
      </div>
    </div>
  );
}
