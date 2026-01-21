import { useEffect, useState } from "react";
import { verifyOtpAPI, resendOtpAPI } from "../services/authServices";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { showErrorToast } from "../utils/errorHandler";

const OtpVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const purpose = location.state?.purpose || "register";

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

  const formik = useFormik({
    initialValues: {
      otp: "",
    },
    validationSchema: Yup.object({
      otp: Yup.string()
        .length(6, "OTP must be exactly 6 digits")
        .matches(/^\d+$/, "OTP must contain only numbers")
        .required("OTP is required"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const res = await verifyOtpAPI(email, values.otp, purpose);
        if (res?.data?.purpose === "reset-password") {
          toast.success("OTP verified! Proceed to reset password");
          navigate("/reset-password", { state: { email } });
        } else if (res?.data?.accessToken) {
          localStorage.setItem("accessToken", res.data.accessToken);
          toast.success("OTP verified successfully");
          navigate("/dashboard");
        } else {
          toast.error("Verification successful but missing next step");
        }
      } catch (error) {
        showErrorToast(error);
      } finally {
        setLoading(false);
      }
    },
  });

  const handleResend = async () => {
    if (timer > 0) return;
    try {
      await resendOtpAPI(email);
      setTimer(60);
      toast.success("OTP resent successfully");
    } catch (error) {
      showErrorToast(error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-orange-50 to-amber-100 p-6">
      <div className="bg-white shadow-lg rounded-3xl p-8 w-full max-w-md text-center">
        <h2 className="text-2xl font-light mb-6">Verify OTP 🔐</h2>
        <p className="text-stone-600 mb-6 font-light">
          We’ve sent a 6-digit OTP to <b>{email}</b>
        </p>

        <form onSubmit={formik.handleSubmit}>
          <div className="mb-6">
            <input
              type="text"
              name="otp"
              maxLength={6}
              placeholder="Enter OTP"
              value={formik.values.otp}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full border rounded-xl py-3 px-4 text-center tracking-widest text-lg focus:outline-none focus:ring-2 transition-all font-light ${formik.touched.otp && formik.errors.otp
                  ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                  : "border-gray-300 focus:border-amber-400 focus:ring-amber-100"
                }`}
            />
            {formik.touched.otp && formik.errors.otp && (
              <p className="text-red-500 text-xs mt-2 font-light">{formik.errors.otp}</p>
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
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <div className="mt-8">
          {timer > 0 ? (
            <p className="text-sm text-stone-500 font-light">
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
