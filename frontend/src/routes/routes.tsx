import { Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import Dashboard from "../pages/Dashboard";
import EmailVerificationPage from "../pages/EmailVerification";
import OtpVerificationPage from "../pages/OtpVerification";
import NewPasswordPage from "../pages/NewPassword";

const UserRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/verify-email" element={<EmailVerificationPage />} />
      <Route path="/verify-otp" element={<OtpVerificationPage />} />
      <Route path="/reset-password" element={<NewPasswordPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
};

export default UserRoutes;
