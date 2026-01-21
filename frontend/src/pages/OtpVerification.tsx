import { useEffect, useState } from "react";
import { verifyOtpAPI, resendOtpAPI } from "../services/authServices";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";

const OtpVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const purpose = location.state?.purpose || "register";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleVerify = async () => {
    if (!otp) return toast.error("Please enter the OTP");
    setLoading(true);
    try {
      const res = await verifyOtpAPI(email, otp, purpose);
      // Backend returns data in a 'data' property
      if (res?.data?.purpose === "reset-password") {
        toast.success("OTP verified! Proceed to reset password");
        navigate("/reset-password", { state: { email } });
      } else if (res?.data?.accessToken) {
        localStorage.setItem("accessToken", res.data.accessToken);
        toast.success("OTP verified successfully");
        navigate("/dashboard");
      } else {
        // Fallback for unexpected response structure
        toast.error("Verification successful but missing next step");
      }
    } catch (error) {
      console.log(error);
      toast.error("Invalid or expired OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    try {
      await resendOtpAPI(email);
      setTimer(60);
      toast.success("OTP resent successfully");
    } catch {
      toast.error("Failed to resend OTP. Try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-orange-50 to-amber-100">
      <div className="bg-white shadow-lg rounded-3xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-light mb-6 text-center">Verify OTP 🔐</h2>
        <p className="text-center text-gray-600 mb-4">
          We’ve sent a 6-digit OTP to <b>{email}</b>
        </p>

        <input
          type="text"
          maxLength={6}
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full border border-gray-300 rounded-xl py-3 px-4 mb-4 text-center tracking-widest text-lg focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none"
        />

        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full py-3 bg-linear-to-r from-amber-400 to-orange-400 text-white rounded-xl shadow hover:scale-[1.02] transition-all"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        <div className="text-center mt-6">
          {timer > 0 ? (
            <p className="text-sm text-gray-500 font-light">
              Resend OTP in <span className="text-amber-600 font-medium">{timer}s</span>
            </p>
          ) : (
            <button
              onClick={handleResend}
              className="text-sm text-amber-600 hover:text-amber-700 hover:underline transition-colors font-medium focus:outline-none"
            >
              Resend OTP
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OtpVerificationPage;
