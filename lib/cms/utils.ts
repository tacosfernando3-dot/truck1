import type { CmsBusiness, GallerySocial } from "@/lib/cms/types";

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

/** Profile URL + visibility for the homepage gallery section. */
export function getGallerySocial(business: CmsBusiness) {
  const network = normalizeGallerySocial(business.gallerySocial);
  const labels = {
    instagram: "Instagram",
    facebook: "Facebook",
    tiktok: "TikTok",
  } as const;

  const url = business[network];
  const visible =
    network === "instagram"
      ? business.showInstagram
      : network === "facebook"
        ? business.showFacebook
        : business.showTikTok;

  return {
    network,
    label: labels[network],
    url,
    enabled: visible && Boolean(url?.trim()),
  };
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
