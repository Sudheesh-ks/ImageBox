import { useEffect, useState } from "react";
import { resetPasswordAPI } from "../services/authServices";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { showErrorToast } from "../utils/errorHandler";

const NewPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .min(8, "Password must be at least 8 characters long")
        .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
        .matches(/[a-z]/, "Password must contain at least one lowercase letter")
        .matches(/[0-9]/, "Password must contain at least one number")
        .matches(/[@$!%*#?&^_-]/, "Password must contain at least one special character")
        .required("Password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "Passwords do not match")
        .required("Please confirm your password"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await resetPasswordAPI(email, values.password);
        toast.success("Password reset successfully");
        navigate("/");
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
          Reset Password 🔒
        </h2>
        <p className="text-center text-stone-600 mb-6 font-light">
          Enter your new password for <b>{email}</b>
        </p>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div>
            <input
              type="password"
              name="password"
              placeholder="Enter new password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full border rounded-xl py-3 px-4 text-center focus:outline-none focus:ring-2 transition-all font-light ${formik.touched.password && formik.errors.password
                ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                : "border-gray-300 focus:border-amber-400 focus:ring-amber-100"
                }`}
            />
            {formik.touched.password && formik.errors.password && (
              <p className="text-red-500 text-xs mt-2 text-center font-light">{formik.errors.password}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full border rounded-xl py-3 px-4 text-center focus:outline-none focus:ring-2 transition-all font-light ${formik.touched.confirmPassword && formik.errors.confirmPassword
                ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                : "border-gray-300 focus:border-amber-400 focus:ring-amber-100"
                }`}
            />
            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-2 text-center font-light">{formik.errors.confirmPassword}</p>
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
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewPasswordPage;
