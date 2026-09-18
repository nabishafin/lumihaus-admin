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
    <div className="min-h-screen bg-[#F9F6EF] text-[#26382E] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans">
      <title>LumiHaus Admin - Forgot Password</title>

      {/* Ambient background glows */}
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
            Forgot Password?
          </h1>
          <p className="text-xs text-[#26382E]/70 font-semibold mt-2 max-w-xs mx-auto leading-relaxed">
            Enter your registered admin email address. We'll send a 6-digit verification code.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-[#DCD6CB] bg-white p-7 sm:p-9 shadow-xl shadow-[#26382E]/5">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-extrabold tracking-[0.12em] text-[#26382E] uppercase mb-2">
                Admin Email Address
              </label>
              <div className="flex items-center gap-2.5 rounded-xl border-2 border-[#DCD6CB] bg-[#F9F6EF] px-4 py-3 transition focus-within:border-[#26382E] focus-within:bg-white">
                <Mail size={17} className="text-[#26382E]/60 shrink-0" />
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

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 flex items-center justify-center gap-2 rounded-xl bg-[#26382E] hover:bg-[#1a2820] py-3.5 text-xs font-bold tracking-wider text-[#F9F6EF] shadow-md shadow-[#26382E]/15 active:scale-[0.99] transition disabled:opacity-60 cursor-pointer"
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

          <div className="mt-6 pt-5 border-t border-[#DCD6CB] text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#26382E]/80 hover:text-[#26382E] transition"
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
