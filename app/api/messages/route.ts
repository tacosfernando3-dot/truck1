import { NextResponse } from "next/server";
import { notifyInquiryEmail } from "@/lib/messages/notify";
import { createSiteMessage, markMessageEmailSent } from "@/lib/messages/store";
import type {
  CreateSiteMessageInput,
  MessageDepartment,
} from "@/lib/messages/types";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEPARTMENTS: MessageDepartment[] = ["contact", "catering", "newsletter"];

function isDepartment(value: unknown): value is MessageDepartment {
  return typeof value === "string" && DEPARTMENTS.includes(value as MessageDepartment);
}

function parseBody(value: unknown): CreateSiteMessageInput | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (!isDepartment(v.department)) return null;
  if (typeof v.email !== "string") return null;

  const email = v.email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;

  if (v.department === "newsletter") {
    return { department: "newsletter", email };
  }

  if (typeof v.fullName !== "string" || !v.fullName.trim()) return null;
  if (typeof v.message !== "string" || !v.message.trim()) return null;

  const phone =
    typeof v.phone === "string" && v.phone.trim() ? v.phone.trim() : undefined;

  if (v.department === "contact") {
    if (!phone) return null;
    return {
      department: "contact",
      fullName: v.fullName.trim(),
      email,
      phone,
      message: v.message.trim(),
    };
  }

  // catering
  const payload =
    v.payload && typeof v.payload === "object"
      ? (v.payload as Record<string, unknown>)
      : {};

  return {
    department: "catering",
    fullName: v.fullName.trim(),
    email,
    phone,
    message: v.message.trim(),
    payload,
  };
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 503 },
    );
  }

  const body = parseBody(await request.json().catch(() => null));
  if (!body) {
    return NextResponse.json({ error: "Invalid message payload" }, { status: 400 });
  }

  if (body.department === "catering") {
    const p = body.payload ?? {};
    const required = [
      "eventType",
      "eventDate",
      "guestCount",
      "eventLocation",
      "packageId",
    ] as const;
    for (const key of required) {
      if (!p[key] && p[key] !== 0) {
        return NextResponse.json(
          { error: `Missing catering field: ${key}` },
          { status: 400 },
        );
      }
    }
  }

  try {
    const message = await createSiteMessage(body);
    const emailSent = await notifyInquiryEmail(body, message);
    if (emailSent) {
      await markMessageEmailSent(message.id);
    }

    return NextResponse.json(
      { message: { ...message, emailSent }, emailSent },
      { status: 201 },
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to submit";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
