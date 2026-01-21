import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const { MAIL_EMAIL, MAIL_PASSWORD } = process.env as Record<string, string>;

console.log("Mail Config:", {
  user: MAIL_EMAIL ? "Present" : "Missing",
  pass: MAIL_PASSWORD ? "Present" : "Missing"
});

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Use SSL
  auth: { user: MAIL_EMAIL, pass: MAIL_PASSWORD },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const info = await transporter.sendMail({ from: MAIL_EMAIL, to, subject, html });
    console.log("Email sent successfully:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

// OTP
export const sendOTP = async (email: string, otp: string) =>
  sendEmail(
    email,
    "ImageBox - Your Verification Code",
    `
    <div style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 20px;">
      <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 8px; padding: 24px; border: 1px solid #eee;">
        <h2 style="text-align: center; color: #333;">Verify Your Email</h2>
        <p style="color: #555; font-size: 15px;">
          Hello,
        </p>
        <p style="color: #555; font-size: 15px;">
          Thank you for signing up with <strong>ImageBox</strong>. Please use the OTP below to verify your account.
        </p>
        <div style="text-align: center; margin: 25px 0;">
          <div style="display: inline-block; font-size: 24px; font-weight: bold; color: #222; background: #f1f1f1; padding: 12px 24px; border-radius: 6px;">
            ${otp}
          </div>
        </div>
        <p style="color: #777; font-size: 14px; text-align: center;">
          This OTP is valid for 1 minute. Please do not share it with anyone.
        </p>
        <p style="color: #aaa; font-size: 13px; text-align: center; margin-top: 20px;">
          © ${new Date().getFullYear()} ImageBox. All rights reserved.
        </p>
      </div>
    </div>
    `
  );
