import nodemailer from "nodemailer";
import type { CreateSiteMessageInput, SiteMessageRecord } from "@/lib/messages/types";
import { MESSAGE_DEPARTMENTS } from "@/lib/messages/types";

const DEFAULT_NOTIFY = "tacosfernando3@gmail.com";

export function getInquiryNotifyEmail() {
  return (
    process.env.INQUIRY_NOTIFY_EMAIL?.trim() ||
    process.env.CONTACT_NOTIFY_EMAIL?.trim() ||
    DEFAULT_NOTIFY
  );
}

function departmentLabel(department: CreateSiteMessageInput["department"]) {
  return (
    MESSAGE_DEPARTMENTS.find((d) => d.id === department)?.label ?? department
  );
}

function buildBody(input: CreateSiteMessageInput, saved: SiteMessageRecord) {
  const lines = [
    `Department: ${departmentLabel(input.department)}`,
    `From: ${input.fullName?.trim() || "(no name)"}`,
    `Email: ${input.email.trim()}`,
    `Phone: ${input.phone?.trim() || "(none)"}`,
    `Message ID: ${saved.id}`,
    `Submitted: ${new Date(saved.createdAt).toLocaleString()}`,
  ];

  if (input.message?.trim()) {
    lines.push("", "Message:", input.message.trim());
  }

  const payload = input.payload ?? {};
  const extras = Object.entries(payload).filter(
    ([, value]) => value !== undefined && value !== null && value !== "",
  );
  if (extras.length) {
    lines.push("", "Details:");
    for (const [key, value] of extras) {
      lines.push(`- ${key}: ${String(value)}`);
    }
  }

  return lines.join("\n");
}

async function sendWithResend(
  to: string,
  subject: string,
  text: string,
  replyTo: string,
) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return false;

  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Los Compadres <onboarding@resend.dev>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: replyTo,
      subject,
      text,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend failed (${res.status}): ${detail}`);
  }

  return true;
}

async function sendWithSmtp(
  to: string,
  subject: string,
  text: string,
  replyTo: string,
) {
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  if (!user || !pass) return false;

  const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT?.trim() || "465");
  const secure =
    process.env.SMTP_SECURE?.trim() === "false" ? false : port === 465;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM?.trim() || `Los Compadres <${user}>`,
    to,
    replyTo,
    subject,
    text,
  });

  return true;
}

export function isMailConfigured() {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() ||
      (process.env.SMTP_USER?.trim() && process.env.SMTP_PASS?.trim()),
  );
}

export async function notifyInquiryEmail(
  input: CreateSiteMessageInput,
  saved: SiteMessageRecord,
): Promise<{ sent: boolean; error?: string }> {
  const to = getInquiryNotifyEmail();
  const subject = `[Los Compadres · ${departmentLabel(input.department)}] New inquiry`;
  const text = buildBody(input, saved);
  const replyTo = input.email.trim();

  try {
    if (await sendWithResend(to, subject, text, replyTo)) {
      return { sent: true };
    }
    if (await sendWithSmtp(to, subject, text, replyTo)) {
      return { sent: true };
    }
    return {
      sent: false,
      error:
        "No email provider configured. Set SMTP_USER + SMTP_PASS (Gmail App Password) or RESEND_API_KEY.",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Email send failed";
    console.error("[inquiry-email]", message);
    return { sent: false, error: message };
  }
}
