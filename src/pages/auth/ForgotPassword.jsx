import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ShieldCheck, Mail, ArrowRight, ArrowLeft, KeyRound } from "lucide-react";
import { useAdminUI } from "../../context/AdminUIContext";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { notify } = useAdminUI();
  const [email, setEmail] = useState("admin@lumihaus.com");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      notify("Please enter your registered email", "warning");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem("lumihaus_reset_email", email);
      notify("6-digit OTP sent to your email & mobile");
      navigate("/verify-otp");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#171315] text-[#f5eaee] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      <title>LumiHaus Admin · Forgot Password</title>

      <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#d96b86]/15 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#d96b86]/10 blur-[140px]" />

      <div className="w-full max-w-[440px] relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            Forgot Password?
          </h1>
          <p className="text-xs text-[#b8a6ad] mt-1.5 max-w-xs mx-auto leading-relaxed">
            Enter your registered admin email address. We'll send a 6-digit verification code.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-white/10 bg-[#241c21]/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-black/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold tracking-[0.15em] text-[#c9b5be] uppercase mb-1.5">
                Admin Email Address
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

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d96b86] to-[#c25671] py-3 text-xs font-bold tracking-wider text-white shadow-lg shadow-[#d96b86]/25 hover:opacity-95 active:scale-[0.99] transition disabled:opacity-60"
            >
              {loading ? (
                <span>Sending Code...</span>
              ) : (
                <>
                  <span>SEND VERIFICATION CODE</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#f5c6d3] hover:text-white transition"
            >
              <ArrowLeft size={14} />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
