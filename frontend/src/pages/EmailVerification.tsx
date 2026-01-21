import { useEffect, useState } from "react";
import { forgotPasswordAPI } from "../services/authServices";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { showErrorToast } from "../utils/errorHandler";

const EmailVerificationPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid email format (e.g., example@test.com)")
        .required("Email is required"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await forgotPasswordAPI(values.email);
        toast.success("OTP sent to your email");
        navigate("/verify-otp", { state: { email: values.email, purpose: "reset-password" } });
      } catch (error) {
        showErrorToast(error);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-orange-50 to-amber-100 p-6">
      <div className="bg-white shadow-lg rounded-3xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-light mb-6 text-center">
          Forgot Password? 🔑
        </h2>
        <p className="text-center text-stone-600 mb-6 font-light leading-relaxed">
          Enter your registered email to receive a verification code.
        </p>

        <form onSubmit={formik.handleSubmit}>
          <div className="mb-6">
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full border rounded-xl py-3 px-4 text-center focus:outline-none focus:ring-2 transition-all font-light ${formik.touched.email && formik.errors.email
                ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                : "border-gray-300 focus:border-amber-400 focus:ring-amber-100"
                }`}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-red-500 text-xs mt-2 text-center font-light">{formik.errors.email}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-white rounded-xl shadow transition-all duration-300 font-light ${loading
              ? "bg-stone-300 cursor-not-allowed"
              : "bg-linear-to-r from-amber-400 to-orange-400 hover:scale-[1.02] hover:shadow-lg"
              }`}
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
