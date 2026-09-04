import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ShieldCheck, Lock, Mail, Eye, EyeOff, ArrowRight, Sparkles, CheckCircle } from "lucide-react";
import { useAdminUI } from "../../context/AdminUIContext";

export default function Login() {
  const navigate = useNavigate();
  const { notify } = useAdminUI();

  const [email, setEmail] = useState("admin@lumihaus.com");
  const [password, setPassword] = useState("lumihaus2026");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      notify("Please enter your admin credentials", "warning");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem("lumihaus_admin_token", "admin-session-active");
      notify("Welcome back to LumiHaus Console");
      navigate("/");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#171315] text-[#f5eaee] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      <title>LumiHaus Admin · Secure Login</title>

      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#d96b86]/15 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#d96b86]/10 blur-[140px]" />

      <div className="w-full max-w-[440px] relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
            lumihaus
          </h1>
          <p className="text-xs text-[#b8a6ad] mt-1.5">
            Admin Console · Secure Control Panel
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl border border-white/10 bg-[#241c21]/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-black/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-[10px] font-bold tracking-[0.15em] text-[#c9b5be] uppercase mb-1.5">
                Admin Email
              </label>
              <div className="flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 transition focus-within:border-[#d96b86] focus-within:ring-2 focus-within:ring-[#d96b86]/20">
                <Mail size={15} className="text-[#a8959e] shrink-0" />
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
                <label className="text-[10px] font-bold tracking-[0.15em] text-[#c9b5be] uppercase">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] text-[#f5c6d3] hover:text-white hover:underline transition"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 transition focus-within:border-[#d96b86] focus-within:ring-2 focus-within:ring-[#d96b86]/20">
                <Lock size={15} className="text-[#a8959e] shrink-0" />
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
                  className="text-[#a8959e] hover:text-white transition"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-[#b8a6ad]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-white/20 bg-white/5 text-[#d96b86] focus:ring-0 focus:ring-offset-0"
                />
                Remember this session
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d96b86] to-[#c25671] py-3 text-xs font-bold tracking-wider text-white shadow-lg shadow-[#d96b86]/25 hover:opacity-95 active:scale-[0.99] transition disabled:opacity-60"
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
          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <p className="text-[10px] text-[#9c8991] mb-2">Demo Admin Credentials:</p>
            <div className="inline-flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-[11px] font-mono text-[#f5c6d3]">
              <span>admin@lumihaus.com</span>
              <span className="text-white/30">•</span>
              <span>lumihaus2026</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[10px] text-[#85747c] mt-8 tracking-widest uppercase">
          © 2026 LUMIHAUS ENTERPRISE · 256-BIT SSL ENCRYPTION
        </p>
      </div>
    </div>
  );
}
