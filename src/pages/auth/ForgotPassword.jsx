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
    <div className="min-h-screen bg-[#0f1a13] text-[#F9F6EF] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans">
      <title>LumiHaus Admin - Forgot Password</title>

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
            Forgot Password?
          </h1>
          <p className="text-sm font-medium text-[#c5d6cc] mt-2 max-w-xs mx-auto leading-relaxed">
            Enter your registered admin email address. We'll send a 6-digit verification code.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-[#3a5045]/60 bg-[#1a2820]/95 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-black/50">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-extrabold tracking-[0.15em] text-[#8FAF9A] uppercase mb-2">
                Admin Email Address
              </label>
              <div className="flex items-center gap-2.5 rounded-xl border border-[#3a5045] bg-[#26382E]/50 px-4 py-3 transition focus-within:border-[#8FAF9A] focus-within:ring-2 focus-within:ring-[#8FAF9A]/20">
                <Mail size={17} className="text-[#8FAF9A] shrink-0" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@lumihaus.com"
                  className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/40"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8FAF9A] to-[#6d947b] hover:from-[#a0c2ab] hover:to-[#7ca68a] py-3.5 text-sm font-black tracking-wider text-[#0f1a13] shadow-lg shadow-[#8FAF9A]/20 active:scale-[0.99] transition disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <span>SENDING CODE...</span>
              ) : (
                <>
                  <span>SEND VERIFICATION CODE</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#3a5045]/60 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#8FAF9A] hover:text-white transition"
            >
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
