import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { getDefaultCms } from "@/lib/cms/defaults";
import { joinMenuImage, splitMenuImage } from "@/lib/cms/image-focus";
import type { CmsBusiness, CmsContent } from "@/lib/cms/types";
import { instagramHandleFromUrl } from "@/lib/cms/utils";
import type { GalleryItem, MenuItem } from "@/lib/types";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";

const CMS_PATH = path.join(process.cwd(), "data", "cms.json");

type MenuItemRow = {
  id: string;
  name: string;
  category: string;
  description: string;
  long_description: string;
  price: number | string;
  image: string;
  featured: boolean;
  available?: boolean | null;
  serves: string | null;
  heat: MenuItem["heat"] | null;
  includes: string[] | null;
  allergens: string[] | null;
  sort_order: number;
};

type GalleryRow = {
  id: string;
  alt: string;
  image: string;
  sort_order: number;
};

type BusinessRow = {
  name: string;
  short_name: string;
  handle: string;
  phone: string;
  email: string;
  cuisine: string;
  price_range: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  show_instagram?: boolean | null;
  show_facebook?: boolean | null;
  show_tiktok?: boolean | null;
  gallery_social?: string | null;
  street_address: string;
  city: string;
  state: string;
  zip: string;
  footer_blurb: string;
};

type CategoryRow = {
  name: string;
  sort_order: number;
  available?: boolean | null;
};

function normalizeBusiness(
  business: CmsBusiness & {
    area?: string;
    address?: string;
  },
): CmsBusiness {
  const defaults = getDefaultCms().business;
  const legacyStreet =
    business.address?.trim() || business.area?.trim() || "";
  const instagram = business.instagram?.trim() || defaults.instagram;

  return {
    name: business.name?.trim() || defaults.name,
    shortName: business.shortName?.trim() || defaults.shortName,
    handle: instagramHandleFromUrl(
      instagram,
      business.handle?.trim() || defaults.handle,
    ),
    phone: business.phone?.trim() || defaults.phone,
    email: business.email?.trim() || defaults.email,
    cuisine: business.cuisine?.trim() || defaults.cuisine,
    priceRange: business.priceRange?.trim() || defaults.priceRange,
    instagram,
    facebook: business.facebook?.trim() || defaults.facebook,
    tiktok: business.tiktok?.trim() || defaults.tiktok,
    showInstagram: business.showInstagram ?? defaults.showInstagram,
    showFacebook: business.showFacebook ?? defaults.showFacebook,
    showTikTok: business.showTikTok ?? defaults.showTikTok,
    gallerySocial: "instagram",
    streetAddress:
      business.streetAddress?.trim() || legacyStreet || defaults.streetAddress,
    city: business.city?.trim() || defaults.city,
    state: business.state?.trim() || defaults.state,
    zip: business.zip?.trim() || defaults.zip,
    footerBlurb: business.footerBlurb?.trim() || defaults.footerBlurb,
  };
}

function normalizeCms(content: CmsContent): CmsContent {
  const fromMenu = content.menu.map((item) => item.category);
  const base =
    Array.isArray(content.categories) && content.categories.length > 0
      ? content.categories
      : [...new Set(fromMenu)];

  const categories = [...base];
  for (const category of fromMenu) {
    if (category && !categories.includes(category)) categories.push(category);
  }

  return {
    ...content,
    categories,
    hiddenCategories: (content.hiddenCategories ?? []).filter((name) =>
      categories.includes(name),
    ),
    menu: content.menu.map((item) => {
      const split = splitMenuImage(item.image ?? "");
      return {
        ...item,
        image: split.src,
        imageFocus: item.imageFocus ?? split.focus,
      };
    }),
    business: normalizeBusiness(content.business),
  };
}

function isCmsContent(value: unknown): value is CmsContent {
  if (!value || typeof value !== "object") return false;
  const v = value as CmsContent;
  return Array.isArray(v.menu) && Array.isArray(v.gallery) && !!v.business;
}

function mapMenuItem(row: MenuItemRow): MenuItem {
  const split = splitMenuImage(row.image ?? "");
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    description: row.description ?? "",
    longDescription: row.long_description ?? "",
    price: typeof row.price === "number" ? row.price : Number(row.price),
    image: split.src,
    featured: Boolean(row.featured),
    available: row.available !== false,
    imageFocus: split.focus,
    serves: row.serves ?? undefined,
    heat: row.heat ?? undefined,
    includes: row.includes ?? undefined,
    allergens: row.allergens ?? undefined,
  };
}

function mapGallery(row: GalleryRow): GalleryItem {
  return {
    id: row.id,
    alt: row.alt,
    image: row.image,
  };
}

function mapBusiness(row: BusinessRow): CmsBusiness {
  return normalizeBusiness({
    name: row.name,
    shortName: row.short_name,
    handle: row.handle,
    phone: row.phone,
    email: row.email,
    cuisine: row.cuisine,
    priceRange: row.price_range,
    instagram: row.instagram,
    facebook: row.facebook,
    tiktok: row.tiktok,
    showInstagram: row.show_instagram ?? true,
    showFacebook: row.show_facebook ?? true,
    showTikTok: row.show_tiktok ?? true,
    gallerySocial: "instagram",
    streetAddress: row.street_address,
    city: row.city,
    state: row.state,
    zip: row.zip,
    footerBlurb: row.footer_blurb,
  });
}

async function readCmsFromSupabase(): Promise<CmsContent> {
  const supabase = getSupabaseAdmin();

  const [categoriesRes, menuRes, galleryRes, businessRes] = await Promise.all([
    supabase
      .from("menu_categories")
      .select("name, sort_order, available")
      .order("sort_order", { ascending: true }),
    supabase
      .from("menu_items")
      .select("*")
      .order("sort_order", { ascending: true }),
    supabase
      .from("gallery_items")
      .select("*")
      .order("sort_order", { ascending: true }),
    supabase.from("business_profile").select("*").eq("id", 1).maybeSingle(),
  ]);

  if (categoriesRes.error) throw new Error(categoriesRes.error.message);
  if (menuRes.error) throw new Error(menuRes.error.message);
  if (galleryRes.error) throw new Error(galleryRes.error.message);
  if (businessRes.error) throw new Error(businessRes.error.message);

  const menu = ((menuRes.data ?? []) as MenuItemRow[]).map(mapMenuItem);
  const categoryRowsFromDb = (categoriesRes.data ?? []) as CategoryRow[];
  const categoriesFromDb = categoryRowsFromDb.map((row) => row.name);
  const categories =
    categoriesFromDb.length > 0
      ? categoriesFromDb
      : [...new Set(menu.map((item) => item.category))];
  const hiddenCategories = categoryRowsFromDb
    .filter((row) => row.available === false)
    .map((row) => row.name);

  const defaults = getDefaultCms();
  const business = businessRes.data
    ? mapBusiness(businessRes.data as BusinessRow)
    : defaults.business;

  return normalizeCms({
    categories,
    hiddenCategories,
    menu,
    gallery: ((galleryRes.data ?? []) as GalleryRow[]).map(mapGallery),
    business,
  });
}

async function writeCmsToSupabase(content: CmsContent) {
  const normalized = normalizeCms(content);
  const supabase = getSupabaseAdmin();

  const { data: existingCategories, error: existingCatError } = await supabase
    .from("menu_categories")
    .select("name");
  if (existingCatError) throw new Error(existingCatError.message);

  const nextCategorySet = new Set(normalized.categories);
  const toRemove = (existingCategories ?? [])
    .map((row) => row.name as string)
    .filter((name) => !nextCategorySet.has(name));

  // Upsert categories first (FK target for menu items)
  const hidden = new Set(normalized.hiddenCategories ?? []);
  const categoryRows = normalized.categories.map((name, index) => ({
    name,
    sort_order: index,
    available: !hidden.has(name),
  }));
  const { error: catUpsertError } = await supabase
    .from("menu_categories")
    .upsert(categoryRows, { onConflict: "name" });
  if (catUpsertError) throw new Error(catUpsertError.message);

  const menuRows = normalized.menu.map((item, index) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    description: item.description ?? "",
    long_description: item.longDescription ?? item.description ?? "",
    price: item.price,
    image: joinMenuImage(item.image, item.imageFocus),
    featured: Boolean(item.featured),
    available: item.available !== false,
    serves: item.serves ?? null,
    heat: item.heat ?? null,
    includes: item.includes ?? [],
    allergens: item.allergens ?? [],
    sort_order: index,
    updated_at: new Date().toISOString(),
  }));

  const { data: existingMenu, error: existingMenuError } = await supabase
    .from("menu_items")
    .select("id");
  if (existingMenuError) throw new Error(existingMenuError.message);

  const nextMenuIds = new Set(normalized.menu.map((item) => item.id));
  const menuToDelete = (existingMenu ?? [])
    .map((row) => row.id as string)
    .filter((id) => !nextMenuIds.has(id));

  if (menuRows.length) {
    const { error: menuUpsertError } = await supabase
      .from("menu_items")
      .upsert(menuRows, { onConflict: "id" });
    if (menuUpsertError) throw new Error(menuUpsertError.message);
  }
  if (menuToDelete.length) {
    const { error } = await supabase
      .from("menu_items")
      .delete()
      .in("id", menuToDelete);
    if (error) throw new Error(error.message);
  }

  // Remove unused categories after menu rows are updated
  if (toRemove.length) {
    const { error } = await supabase
      .from("menu_categories")
      .delete()
      .in("name", toRemove);
    if (error) throw new Error(error.message);
  }

  const galleryRows = normalized.gallery.map((item, index) => ({
    id: item.id,
    alt: item.alt,
    image: item.image,
    sort_order: index,
  }));

  const { data: existingGallery, error: existingGalleryError } = await supabase
    .from("gallery_items")
    .select("id");
  if (existingGalleryError) throw new Error(existingGalleryError.message);

  const nextGalleryIds = new Set(normalized.gallery.map((item) => item.id));
  const galleryToDelete = (existingGallery ?? [])
    .map((row) => row.id as string)
    .filter((id) => !nextGalleryIds.has(id));

  if (galleryRows.length) {
    const { error } = await supabase
      .from("gallery_items")
      .upsert(galleryRows, { onConflict: "id" });
    if (error) throw new Error(error.message);
  }
  if (galleryToDelete.length) {
    const { error } = await supabase
      .from("gallery_items")
      .delete()
      .in("id", galleryToDelete);
    if (error) throw new Error(error.message);
  }

  const b = normalized.business;
  const { error: businessError } = await supabase.from("business_profile").upsert(
    {
      id: 1,
      name: b.name,
      short_name: b.shortName,
      handle: b.handle,
      phone: b.phone,
      email: b.email,
      cuisine: b.cuisine,
      price_range: b.priceRange,
      instagram: b.instagram,
      facebook: b.facebook,
      tiktok: b.tiktok,
      show_instagram: b.showInstagram,
      show_facebook: b.showFacebook,
      show_tiktok: b.showTikTok,
      gallery_social: b.gallerySocial,
      street_address: b.streetAddress,
      city: b.city,
      state: b.state,
      zip: b.zip,
      footer_blurb: b.footerBlurb,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
  if (businessError) throw new Error(businessError.message);

  return normalized;
}

function readCmsFromFile(): CmsContent {
  try {
    if (existsSync(CMS_PATH)) {
      const parsed = JSON.parse(readFileSync(CMS_PATH, "utf8")) as unknown;
      if (isCmsContent(parsed)) return normalizeCms(parsed);
    }
  } catch {
    // fall through to defaults
  }
  return getDefaultCms();
}

function writeCmsToFile(content: CmsContent) {
  const dir = path.dirname(CMS_PATH);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const normalized = normalizeCms(content);
  writeFileSync(CMS_PATH, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
  return normalized;
}

export async function readCms(): Promise<CmsContent> {
  if (isSupabaseConfigured()) {
    try {
      const content = await readCmsFromSupabase();
      // Empty Supabase project → seed from local defaults so the site still works
      if (content.menu.length === 0) {
        const fallback = readCmsFromFile();
        await writeCmsToSupabase(fallback);
        return fallback;
      }
      return content;
    } catch (error) {
      console.error("[cms] Supabase read failed, using local file:", error);
      return readCmsFromFile();
    }
  }
  return readCmsFromFile();
}

export async function writeCms(content: CmsContent): Promise<CmsContent> {
  const normalized = normalizeCms(content);
  if (isSupabaseConfigured()) {
    try {
      return await writeCmsToSupabase(normalized);
    } catch (error) {
      console.error("[cms] Supabase write failed, writing local file:", error);
      return writeCmsToFile(normalized);
    }
  }
  return writeCmsToFile(normalized);
}
