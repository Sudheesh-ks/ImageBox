import * as SibApiV3Sdk from "sib-api-v3-sdk";
import dotenv from "dotenv";

dotenv.config()


const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY; 

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

export const sendOTP = async (email: string, otp: string): Promise<void> => {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.subject = `Verify your Account`;
  sendSmtpEmail.sender = { "name": "Image Box", "email": process.env.SENDER_EMAIL };
  sendSmtpEmail.to = [{ "email": email }];

  sendSmtpEmail.htmlContent =
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
    `;

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('OTP sent successfully using Brevo API.');
  } catch (error: any) {
    console.error('Error sending OTP via Brevo API:', error.response?.body || error);
    throw new Error('Failed to send OTP email.');
  }
};