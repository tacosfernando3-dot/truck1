/**
 * Seed Supabase from local data/cms.json (or defaults).
 *
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/seed-supabase.ts
 */
import { readFileSync, existsSync } from "fs";
import path from "path";
import { getDefaultCms } from "../lib/cms/defaults";
import { writeCms } from "../lib/cms/store";
import type { CmsContent } from "../lib/cms/types";
import { isSupabaseConfigured } from "../lib/supabase/server";

const CMS_PATH = path.join(process.cwd(), "data", "cms.json");

function loadLocal(): CmsContent {
  if (existsSync(CMS_PATH)) {
    return JSON.parse(readFileSync(CMS_PATH, "utf8")) as CmsContent;
  }
  return getDefaultCms();
}

async function main() {
  if (!isSupabaseConfigured()) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    );
    process.exit(1);
  }

  const content = loadLocal();
  console.log(
    `Seeding ${content.menu.length} menu items, ${content.gallery.length} gallery images…`,
  );
  await writeCms(content);
  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
