import type { CmsBusiness } from "@/lib/cms/types";

export function categorySectionId(category: string) {
  return `menu-${category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
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
