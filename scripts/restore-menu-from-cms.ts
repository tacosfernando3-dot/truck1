import { readFileSync } from "fs";
import { writeCms } from "../lib/cms/store";
import type { CmsContent } from "../lib/cms/types";
import { getSupabaseAdmin } from "../lib/supabase/server";

async function main() {
  const cms = JSON.parse(
    readFileSync("data/cms.json", "utf8"),
  ) as CmsContent;
  const burgerUrl =
    "https://pwptpxvhdlscyebbqgkt.supabase.co/storage/v1/object/public/menu-uploads/1787764134302-dd46e129.jpg";

  const menu = cms.menu
    .filter((item) => item.id !== "item-1787764109012")
    .map((item) => {
      if (
        item.id === "burgers-los-compadres-burger" ||
        item.name === "Los Compadres Burger"
      ) {
        return {
          ...item,
          image: burgerUrl,
          imageFocus: { x: 48, y: 58 },
          featured: true,
        };
      }
      return item;
    });

  await writeCms({ ...cms, menu });

  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from("menu_items")
    .select("*", { count: "exact", head: true });
  if (error) throw error;
  console.log("restored menu_items count:", count);

  const { data: burger } = await supabase
    .from("menu_items")
    .select("id,name,image")
    .eq("id", "burgers-los-compadres-burger")
    .maybeSingle();
  console.log("burger:", burger);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
