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

/** Zero-config fallback so inquiries still reach the inbox without Resend. */
async function sendWithFormSubmit(
  to: string,
  subject: string,
  input: CreateSiteMessageInput,
  saved: SiteMessageRecord,
) {
  const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(to)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      _subject: subject,
      _template: "table",
      _replyto: input.email.trim(),
      department: departmentLabel(input.department),
      full_name: input.fullName?.trim() || "",
      email: input.email.trim(),
      phone: input.phone?.trim() || "",
      message: input.message?.trim() || "",
      message_id: saved.id,
      ...(input.payload ?? {}),
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`FormSubmit failed (${res.status}): ${detail}`);
  }

  return true;
}

export async function notifyInquiryEmail(
  input: CreateSiteMessageInput,
  saved: SiteMessageRecord,
): Promise<boolean> {
  const to = getInquiryNotifyEmail();
  const subject = `[Los Compadres · ${departmentLabel(input.department)}] New inquiry`;
  const text = buildBody(input, saved);

  try {
    if (await sendWithResend(to, subject, text, input.email.trim())) {
      return true;
    }
    return await sendWithFormSubmit(to, subject, input, saved);
  } catch (error) {
    console.error("[inquiry-email]", error);
    return false;
  }
}
