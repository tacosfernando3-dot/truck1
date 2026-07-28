import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MenuItemPageClient } from "@/components/menu-item-page-client";
import {
  getMenuItemById,
  getRelatedMenuItems,
  menuItems,
} from "@/data/menu";

type PageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return menuItems.map((item) => ({ id: item.id }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const item = getMenuItemById(id);
  if (!item) return { title: "Menu item" };

  return {
    title: item.name,
    description: item.description,
  };
}

export default async function MenuItemPage({ params }: PageProps) {
  const { id } = await params;
  const item = getMenuItemById(id);
  if (!item) notFound();

  const related = getRelatedMenuItems(item);

  return <MenuItemPageClient item={item} related={related} />;
}
