import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BackButton } from "@/components/back-button";
import { MenuCard } from "@/components/menu-card";
import { MenuItemAddButton } from "@/components/menu-item-add-button";
import {
  getMenuItemById,
  getRelatedMenuItems,
  menuItems,
} from "@/data/menu";
import { formatCurrency } from "@/lib/utils";

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

const heatLabel = {
  mild: "Mild",
  medium: "Medium",
  hot: "Hot",
} as const;

export default async function MenuItemPage({ params }: PageProps) {
  const { id } = await params;
  const item = getMenuItemById(id);
  if (!item) notFound();

  const related = getRelatedMenuItems(item);

  return (
    <div className="bg-background">
      <div className="container-site pt-4 pb-12 sm:pt-6 sm:pb-16">
        <BackButton className="mb-6" fallbackHref="/menu" />

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-12">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border-dark sm:aspect-[16/11]">
            <Image
              src={item.image}
              alt={item.name}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 55vw"
            />
          </div>

          <div>
            <p className="text-sm font-semibold tracking-[0.22em] text-yellow uppercase">
              {item.category}
            </p>
            <h1 className="mt-2 font-brush text-fluid-section text-white">
              {item.name}
            </h1>
            <p className="mt-2 font-display text-3xl tracking-wide text-yellow">
              {formatCurrency(item.price)}
            </p>
            <p className="mt-4 max-w-xl text-muted">{item.longDescription}</p>

            <dl className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {item.serves && (
                <div>
                  <dt className="inline text-muted">Serves </dt>
                  <dd className="inline font-semibold text-white">
                    {item.serves}
                  </dd>
                </div>
              )}
              {item.heat && (
                <div>
                  <dt className="inline text-muted">Heat </dt>
                  <dd className="inline font-semibold text-white">
                    {heatLabel[item.heat]}
                  </dd>
                </div>
              )}
            </dl>

            {item.includes && item.includes.length > 0 && (
              <div className="mt-8">
                <h2 className="text-sm font-semibold tracking-[0.18em] text-yellow uppercase">
                  What&apos;s included
                </h2>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {item.includes.map((line) => (
                    <li
                      key={line}
                      className="border-l-2 border-yellow/70 pl-3 text-sm text-muted"
                    >
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {item.allergens && item.allergens.length > 0 && (
              <p className="mt-6 text-xs text-muted/80">
                {item.allergens.join(" · ")}
              </p>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <MenuItemAddButton item={item} className="w-full sm:w-auto" />
              <Link
                href="/menu"
                className="inline-flex min-h-12 items-center justify-center px-2 text-sm font-semibold tracking-wide text-muted uppercase transition hover:text-yellow"
              >
                View full menu
              </Link>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-16 border-t border-border-dark pt-12">
            <h2 className="font-brush text-fluid-section text-white">
              More {item.category}
            </h2>
            <p className="mt-2 text-muted">
              Keep the line moving with something from the same board.
            </p>
            <div className="mt-8 hidden gap-6 md:grid md:grid-cols-2 xl:grid-cols-3">
              {related.map((relatedItem) => (
                <MenuCard key={relatedItem.id} item={relatedItem} />
              ))}
            </div>
            <div className="mt-6 grid gap-4 md:hidden">
              {related.map((relatedItem) => (
                <MenuCard key={relatedItem.id} item={relatedItem} compact />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
