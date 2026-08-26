import { getSupabaseAdmin } from "@/lib/supabase/server";
import type {
  CreateSiteMessageInput,
  MessageDepartment,
  MessageStatus,
  SiteMessageRecord,
} from "@/lib/messages/types";

type MessageRow = {
  id: string;
  department: MessageDepartment;
  full_name: string | null;
  email: string;
  phone: string | null;
  message: string | null;
  payload: Record<string, unknown> | null;
  status: MessageStatus;
  email_sent: boolean;
  created_at: string;
};

function mapMessage(row: MessageRow): SiteMessageRecord {
  return {
    id: row.id,
    department: row.department,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    message: row.message,
    payload: row.payload ?? {},
    status: row.status,
    emailSent: row.email_sent,
    createdAt: row.created_at,
  };
}

export async function createSiteMessage(
  input: CreateSiteMessageInput,
): Promise<SiteMessageRecord> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("site_messages")
    .insert({
      department: input.department,
      full_name: input.fullName?.trim() || null,
      email: input.email.trim().toLowerCase(),
      phone: input.phone?.trim() || null,
      message: input.message?.trim() || null,
      payload: input.payload ?? {},
      status: "new",
      email_sent: false,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Failed to save message");
  }

  return mapMessage(data as MessageRow);
}

export async function markMessageEmailSent(id: string) {
  const supabase = getSupabaseAdmin();
  await supabase.from("site_messages").update({ email_sent: true }).eq("id", id);
}

export async function listSiteMessages(limit = 200): Promise<SiteMessageRecord[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("site_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data as MessageRow[] | null)?.map(mapMessage) ?? [];
}

export async function updateMessageStatus(
  id: string,
  status: MessageStatus,
): Promise<SiteMessageRecord> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("site_messages")
    .update({ status })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Failed to update message");
  }

  return mapMessage(data as MessageRow);
}
