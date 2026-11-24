import { DEFAULT_BUSINESS_HOURS } from "@/lib/cms/defaults";
import type {
  BusinessDayHours,
  CmsBusiness,
  GallerySocial,
  Weekday,
} from "@/lib/cms/types";

export const WEEKDAYS: Weekday[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export function categorySectionId(category: string) {
  return `menu-${category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
}

const GALLERY_SOCIALS: GallerySocial[] = [
  "instagram",
  "facebook",
  "tiktok",
];

export function normalizeGallerySocial(
  value: unknown,
): GallerySocial {
  return GALLERY_SOCIALS.includes(value as GallerySocial)
    ? (value as GallerySocial)
    : "instagram";
}

/** Profile URL + visibility for the homepage gallery section (always Instagram). */
export function getGallerySocial(business: CmsBusiness) {
  const url = business.instagram;
  return {
    network: "instagram" as const,
    label: "Instagram",
    url,
    handle: instagramHandleFromUrl(url, business.handle),
    enabled: business.showInstagram && Boolean(url?.trim()),
  };
}

/** Derive @handle from an Instagram profile URL. */
export function instagramHandleFromUrl(url: string, fallback = "") {
  const trimmed = url.trim();
  if (!trimmed) return fallback;
  if (trimmed.startsWith("@")) return trimmed;

  try {
    const parsed = new URL(
      trimmed.startsWith("http") ? trimmed : `https://${trimmed}`,
    );
    const parts = parsed.pathname.split("/").filter(Boolean);
    const reserved = new Set([
      "p",
      "reel",
      "reels",
      "stories",
      "explore",
      "accounts",
    ]);
    const username = parts[0];
    if (username && !reserved.has(username.toLowerCase())) {
      return `@${username.replace(/^@/, "")}`;
    }
  } catch {
    /* keep fallback */
  }

  return fallback;
}

/** Format as (XXX) XXX-XXXX while typing. */
export function formatPhoneInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) {
    return digits.length ? `(${digits}` : "";
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  }
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/** Single-line address for maps, directions, and display. */
export function formatBusinessAddress(
  business: Pick<
    CmsBusiness,
    "streetAddress" | "city" | "state" | "zip"
  >,
) {
  const street = business.streetAddress?.trim() ?? "";
  const city = business.city?.trim() ?? "";
  const state = business.state?.trim() ?? "";
  const zip = business.zip?.trim() ?? "";
  const stateZip = [state, zip].filter(Boolean).join(" ");
  const locality = [city, stateZip].filter(Boolean).join(", ");
  return [street, locality].filter(Boolean).join(", ");
}

function isWeekday(value: unknown): value is Weekday {
  return WEEKDAYS.includes(value as Weekday);
}

function normalizeTime(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return fallback;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (
    !Number.isFinite(hour) ||
    !Number.isFinite(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return fallback;
  }
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/** Fill missing days and clamp times for a weekly schedule. */
export function normalizeBusinessHours(
  value: unknown,
): BusinessDayHours[] {
  const byDay = new Map<Weekday, BusinessDayHours>();
  if (Array.isArray(value)) {
    for (const entry of value) {
      if (!entry || typeof entry !== "object") continue;
      const row = entry as Partial<BusinessDayHours>;
      if (!isWeekday(row.day)) continue;
      const fallback =
        DEFAULT_BUSINESS_HOURS.find((d) => d.day === row.day) ??
        DEFAULT_BUSINESS_HOURS[0];
      byDay.set(row.day, {
        day: row.day,
        open: typeof row.open === "boolean" ? row.open : fallback.open,
        opens: normalizeTime(row.opens, fallback.opens),
        closes: normalizeTime(row.closes, fallback.closes),
        note: typeof row.note === "string" ? row.note.trim() : fallback.note,
      });
    }
  }

  return WEEKDAYS.map((day) => {
    const fallback =
      DEFAULT_BUSINESS_HOURS.find((d) => d.day === day) ??
      DEFAULT_BUSINESS_HOURS[0];
    return byDay.get(day) ?? { ...fallback };
  });
}

function formatClock(time: string) {
  const [hRaw, mRaw] = time.split(":");
  const hour = Number(hRaw);
  const minute = Number(mRaw);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return time;
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return minute === 0
    ? `${hour12}:00 ${suffix}`
    : `${hour12}:${String(minute).padStart(2, "0")} ${suffix}`;
}

/** Public label for a single day (e.g. "11:00 AM–8:00 PM" or "Closed"). */
export function formatBusinessDayHours(
  hours: BusinessDayHours[] | undefined,
  day: string,
): string {
  const entry = (hours ?? []).find((d) => d.day === day);
  if (!entry) return "";
  if (!entry.open) {
    return entry.note?.trim() || "Closed";
  }
  return `${formatClock(entry.opens)}–${formatClock(entry.closes)}`;
}
