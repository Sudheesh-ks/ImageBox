import { useEffect, useState } from "react";
import { resetPasswordAPI } from "../services/authServices";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";

const NewPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleReset = async () => {
    if (!password || !confirmPassword) {
      return toast.error("Please fill in both fields");
    }

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }
    setLoading(true);
    try {
      await resetPasswordAPI(email, password);
      toast.success("Password reset successfully");
      navigate("/");
    } catch (error) {
      console.log(error);
      toast.error("Error resetting password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-orange-50 to-amber-100">
      <div className="bg-white shadow-lg rounded-3xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-light mb-6 text-center">
          Reset Password 🔒
        </h2>
        <p className="text-center text-gray-600 mb-4">
          Enter your new password for <b>{email}</b>
        </p>

        <input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-xl py-3 px-4 mb-4 text-center focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none"
        />

        <input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-xl py-3 px-4 mb-4 text-center focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none"
        />
        <button
          onClick={handleReset}
          disabled={loading}
          className="w-full py-3 bg-linear-to-r from-amber-400 to-orange-400 text-white rounded-xl shadow hover:scale-[1.02] transition-all"
        >
          {loading ? "Updating..." : "Reset Password"}
        </button>
      </div>
    </div>
  );
};

export default NewPasswordPage;
