import nodemailer from "nodemailer";
import logger from "../config/logger.js";

const transporter = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    })
  : null;

export async function sendEmail({ to, subject, text }) {
  if (!transporter) {
    logger.info("email skipped: SMTP is not configured", { to, subject });
    return { skipped: true };
  }
  await transporter.sendMail({ from: process.env.MAIL_FROM || "DevFocus <noreply@devfocus.local>", to, subject, text });
  return { skipped: false };
}

export const sendWelcomeEmail = (email, nickname) =>
  sendEmail({ to: email, subject: "DevFocus 가입을 환영합니다", text: `${nickname}님, DevFocus에서 학습을 시작해보세요.` });

export const sendEnrollmentEmail = (email, nickname, courseTitle) =>
  sendEmail({ to: email, subject: "수강 신청 완료", text: `${nickname}님, ${courseTitle} 수강 신청이 완료되었습니다.` });

export const sendPaymentEmail = (email, courseTitle, amount) =>
  sendEmail({ to: email, subject: "결제 완료", text: `${courseTitle} 결제 ${amount.toLocaleString()}원이 완료되었습니다.` });
