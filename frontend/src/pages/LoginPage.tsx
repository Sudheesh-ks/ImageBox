import { useEffect, useState } from "react";
import { Mail, Lock, Phone, Eye, EyeOff, ArrowRight } from "lucide-react";
import { showErrorToast } from "../utils/errorHandler";
import toast from "react-hot-toast";
import { loginAPI, registerAPI } from "../services/authServices";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Auth handled by PublicRoute
  }, []);

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid email format (e.g., example@test.com)")
      .required("Email is required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters long")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(/[0-9]/, "Password must contain at least one number")
      .matches(/[@$!%*#?&^_-]/, "Password must contain at least one special character")
      .required("Password is required"),
    phone: isLogin
      ? Yup.string().notRequired()
      : Yup.string()
        .matches(/^\d{10}$/, "Phone number must be exactly 10 digits")
        .required("Phone number is required"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      phone: "",
    },
    validationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        if (isLogin) {
          const res = await loginAPI(values.email, values.password);
          if (res?.success) {
            localStorage.setItem("accessToken", res.accessToken);
            toast.success(res.message);
            navigate("/dashboard");
          }
        } else {
          const res = await registerAPI(values);
          if (res?.success) {
            toast.success(res.message);
            navigate("/verify-otp", {
              state: { email: values.email, purpose: "register" },
            });
          }
        }
      } catch (error) {
        showErrorToast(error);
      } finally {
        setLoading(false);
      }
    },
  });

  const toggleMode = () => {
    setIsLogin(!isLogin);
    formik.resetForm();
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

          <form onSubmit={formik.handleSubmit} className="space-y-5">
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
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter your email"
                  className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all font-light text-stone-700 ${formik.touched.email && formik.errors.email
                    ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                    : "border-stone-300 focus:border-amber-400 focus:ring-amber-100"
                    }`}
                />
              </div>
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-500 text-xs mt-1 font-light">{formik.errors.email}</p>
              )}
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
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter your phone number"
                    className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all font-light text-stone-700 ${formik.touched.phone && formik.errors.phone
                      ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                      : "border-stone-300 focus:border-amber-400 focus:ring-amber-100"
                      }`}
                  />
                </div>
                {formik.touched.phone && formik.errors.phone && (
                  <p className="text-red-500 text-xs mt-1 font-light">{formik.errors.phone}</p>
                )}
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
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter your password"
                  className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all font-light text-stone-700 ${formik.touched.password && formik.errors.password
                    ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                    : "border-stone-300 focus:border-amber-400 focus:ring-amber-100"
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="text-red-500 text-xs mt-1 font-light">{formik.errors.password}</p>
              )}
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
              type="submit"
              disabled={loading}
              className={`w-full py-4 text-white rounded-xl font-light text-lg shadow-md flex items-center justify-center gap-2 group transition-all duration-300 ${loading
                ? "bg-stone-300 cursor-not-allowed"
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
          </form>

          <p className="text-center text-sm text-stone-500 font-light mt-6">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={toggleMode}
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
