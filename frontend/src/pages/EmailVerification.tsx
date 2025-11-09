import { useEffect, useState } from "react";
import { forgotPasswordAPI } from "../services/authServices";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const EmailVerificationPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleSend = async () => {
    if (!email) return toast.error("Please enter your email");
    setLoading(true);
    try {
      await forgotPasswordAPI(email);
      toast.success("OTP sent to your email");
      navigate("/verify-otp", { state: { email, purpose: "reset-password" } });
    } catch (error) {
      console.log(error);
      toast.error("Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-orange-50 to-amber-100">
      <div className="bg-white shadow-lg rounded-3xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-light mb-6 text-center">
          Forgot Password? 🔑
        </h2>
        <p className="text-center text-gray-600 mb-4">
          Enter your registered email to receive a verification code.
        </p>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-xl py-3 px-4 mb-4 text-center focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="w-full py-3 bg-linear-to-r from-amber-400 to-orange-400 text-white rounded-xl shadow hover:scale-[1.02] transition-all"
        >
          {loading ? "Sending..." : "Send OTP"}
        </button>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
