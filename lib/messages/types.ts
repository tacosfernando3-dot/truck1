export type MessageDepartment = "contact" | "catering" | "newsletter";
export type MessageStatus = "new" | "read" | "archived";

export type SiteMessageRecord = {
  id: string;
  department: MessageDepartment;
  fullName: string | null;
  email: string;
  phone: string | null;
  message: string | null;
  payload: Record<string, unknown>;
  status: MessageStatus;
  emailSent: boolean;
  createdAt: string;
};

export type CreateSiteMessageInput = {
  department: MessageDepartment;
  fullName?: string;
  email: string;
  phone?: string;
  message?: string;
  payload?: Record<string, unknown>;
};

export const MESSAGE_DEPARTMENTS: {
  id: MessageDepartment;
  label: string;
}[] = [
  { id: "contact", label: "Contact" },
  { id: "catering", label: "Catering" },
  { id: "newsletter", label: "Newsletter" },
];
