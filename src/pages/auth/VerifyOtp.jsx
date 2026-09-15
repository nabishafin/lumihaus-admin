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
    <div className="min-h-screen bg-[#F9F6EF] text-[#26382E] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans">
      <title>LumiHaus Admin - Verify OTP</title>

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
            Security Verification
          </h1>
          <p className="text-xs text-[#26382E]/70 font-semibold mt-2 max-w-xs mx-auto leading-relaxed">
            Enter the 6-digit security code sent to <strong className="text-[#26382E] font-bold">{email}</strong>
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-[#DCD6CB] bg-white p-7 sm:p-9 shadow-xl shadow-[#26382E]/5">
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
                  className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl border-2 border-[#DCD6CB] bg-[#F9F6EF] text-center font-mono text-xl sm:text-2xl font-bold text-[#17251C] outline-none transition focus:border-[#26382E] focus:bg-white focus:ring-2 focus:ring-[#26382E]/10"
                />
              ))}
            </div>

            {/* Resend Timer */}
            <div className="flex items-center justify-between text-xs font-semibold text-[#26382E]/70 pt-1">
              <span>Didn't receive code?</span>
              {timer > 0 ? (
                <span className="font-mono text-[#26382E] font-bold">Resend in {timer}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="inline-flex items-center gap-1 font-bold text-[#26382E] hover:underline transition cursor-pointer"
                >
                  <RefreshCw size={13} /> Resend Now
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#26382E] hover:bg-[#1a2820] py-3.5 text-xs font-bold tracking-wider text-[#F9F6EF] shadow-md shadow-[#26382E]/15 active:scale-[0.99] transition disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <span>VERIFYING...</span>
              ) : (
                <>
                  <span>VERIFY & CONTINUE</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#DCD6CB] text-center">
            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#26382E]/80 hover:text-[#26382E] transition"
            >
              <ArrowLeft size={16} />
              Change Email
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
