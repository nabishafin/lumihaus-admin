import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { ShieldCheck, ArrowRight, ArrowLeft, RefreshCw, Sparkles } from "lucide-react";
import { useAdminUI } from "../../context/AdminUIContext";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const { notify } = useAdminUI();

  const [otp, setOtp] = useState(["7", "2", "9", "4", "1", "0"]);
  const [timer, setTimer] = useState(45);
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef([]);

  const email = localStorage.getItem("lumihaus_reset_email") || "admin@lumihaus.com";

  // Countdown timer for OTP
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5 && inputsRef.current[index + 1]) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      setOtp(pastedData.split(""));
      inputsRef.current[5]?.focus();
    }
  };

  const handleResend = () => {
    if (timer > 0) return;
    setTimer(60);
    notify("A new 6-digit OTP code has been sent!");
  };

  const handleVerify = (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      notify("Please enter complete 6-digit OTP code", "warning");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      notify("OTP verified successfully");
      navigate("/reset-password");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#171315] text-[#f5eaee] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      <title>LumiHaus Admin · Verify OTP</title>

      <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#d96b86]/15 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#d96b86]/10 blur-[140px]" />

      <div className="w-full max-w-[440px] relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            Security Verification
          </h1>
          <p className="text-xs text-[#b8a6ad] mt-1.5 max-w-xs mx-auto leading-relaxed">
            Enter the 6-digit security code sent to <strong className="text-white">{email}</strong>
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-white/10 bg-[#241c21]/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-black/50">
          <form onSubmit={handleVerify} className="space-y-6">
            {/* 6 Digit Boxes */}
            <div className="flex items-center justify-between gap-2 sm:gap-2.5" onPaste={handlePaste}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputsRef.current[idx] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl border border-white/15 bg-white/5 text-center font-mono text-xl sm:text-2xl font-bold text-white outline-none transition focus:border-[#d96b86] focus:bg-[#2e2027] focus:ring-2 focus:ring-[#d96b86]/20"
                />
              ))}
            </div>

            {/* Resend Timer */}
            <div className="flex items-center justify-between text-xs text-[#a8959e] pt-1">
              <span>Didn't receive code?</span>
              {timer > 0 ? (
                <span className="font-mono text-[#f5c6d3]">Resend in {timer}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="inline-flex items-center gap-1 font-bold text-[#f5c6d3] hover:text-white transition"
                >
                  <RefreshCw size={12} /> Resend Now
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d96b86] to-[#c25671] py-3 text-xs font-bold tracking-wider text-white shadow-lg shadow-[#d96b86]/25 hover:opacity-95 active:scale-[0.99] transition disabled:opacity-60"
            >
              {loading ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <span>VERIFY & CONTINUE</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#f5c6d3] hover:text-white transition"
            >
              <ArrowLeft size={14} />
              Change Email
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
