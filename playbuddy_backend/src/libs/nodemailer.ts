import { createTransport, SendMailOptions } from "nodemailer";
import * as dotenv from "dotenv";

dotenv.config();

export const transporter = createTransport({
  secure: true,
  host: "smtp.gmail.com",
  port: 465,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendPasswordResetEmail(to: string, otp: string) {
  const subject = "Password Reset Request";
  const text = `
Dear User,

You recently requested to reset your password. Use the One-Time Password (OTP) below to complete the process:

Your OTP: ${otp}

Thank you,  
PLAY BUDDY
`;

  try {
    const info = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject,
      text,
    });
    console.log("Password reset email sent:", info.messageId);
  } catch (error) {
    console.error("Error sending password reset email:", error);
  }
}
