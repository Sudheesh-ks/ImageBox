import React, { useEffect, useState } from "react";
import { Mail, Lock, Phone, Eye, EyeOff, ArrowRight } from "lucide-react";
import { showErrorToast } from "../utils/errorHandler";
import toast from "react-hot-toast";
import { loginAPI, registerAPI } from "../services/authServices";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    phone: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      navigate("/dashboard");
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (
      !formData.email ||
      !formData.password ||
      (!isLogin && !formData.phone)
    ) {
      showErrorToast("Please fill all required fields.");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const res = await loginAPI(formData.email, formData.password);
        if (res?.success) {
          localStorage.setItem("accessToken", res.data.accessToken);
          toast.success(res.message);
          navigate("/dashboard");
        } else {
          toast.error(res.message);
        }
      } else {
        const res = await registerAPI(formData);
        if (res?.success) {
          toast.success(res.message);
          navigate("/verify-otp", {
            state: { email: formData.email, purpose: "register" },
          });
        } else {
          toast.error(res.message);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-light text-stone-800 mb-2 tracking-tight">
            ImageBox 🗃
          </h1>
          <p className="text-stone-500 font-light">
            {isLogin ? "Welcome back! 👋" : "Create your account 🎨"}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-light text-stone-800 mb-2">
              {isLogin ? "Login" : "Create Account"}
            </h2>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-light text-stone-600 mb-2">
                Email address 📧
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-400"
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all font-light text-stone-700"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-light text-stone-600 mb-2">
                  Phone number 📱
                </label>
                <div className="relative">
                  <Phone
                    size={18}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-400"
                  />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    className="w-full pl-12 pr-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all font-light text-stone-700"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-light text-stone-600 mb-2">
                Password 🔒
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-400"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-12 py-3 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all font-light text-stone-700"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => navigate("/verify-email")}
                  className="text-sm text-amber-600 hover:text-amber-700 font-light transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full py-4 text-white rounded-xl font-light text-lg shadow-md flex items-center justify-center gap-2 group transition-all duration-300 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-linear-to-r from-amber-400 to-orange-400 hover:shadow-xl hover:scale-[1.02]"
              }`}
            >
              {loading ? (
                "Processing..."
              ) : (
                <>
                  <span>{isLogin ? "Login" : "Create Account"}</span>
                  <ArrowRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </>
              )}
            </button>
          </div>

          <p className="text-center text-sm text-stone-500 font-light mt-6">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-amber-600 hover:text-amber-700 transition-colors font-normal"
            >
              {isLogin ? "Register here" : "Login here"}
            </button>
          </p>

          {!isLogin && (
            <p className="text-center text-xs text-stone-500 font-light mt-4 leading-relaxed">
              By creating an account, you agree to our Terms of Service and
              Privacy Policy 📜
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
