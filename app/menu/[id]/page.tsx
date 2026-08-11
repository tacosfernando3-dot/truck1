import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MenuItemPageClient } from "@/components/menu-item-page-client";
import { menuItems } from "@/data/menu";
import { readCms } from "@/lib/cms/store";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const dynamicParams = true;

export function generateStaticParams() {
  return menuItems.map((item) => ({ id: item.id }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const item = (await readCms()).menu.find((entry) => entry.id === id);
  if (!item) return { title: "Menu item" };

  return {
    title: item.name,
    description: item.description,
  };
}

export default async function MenuItemPage({ params }: PageProps) {
  const { id } = await params;
  const cms = await readCms();
  const item = cms.menu.find((entry) => entry.id === id);
  if (!item) notFound();

  const related = cms.menu
    .filter((other) => other.category === item.category && other.id !== item.id)
    .slice(0, 3);

  return <MenuItemPageClient item={item} related={related} />;
}
