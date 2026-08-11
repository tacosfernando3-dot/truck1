"use client";

import Image from "next/image";
import Link from "next/link";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  imageClassName,
  onClick,
}: {
  className?: string;
  imageClassName?: string;
  onClick?: () => void;
}) {
  const t = useT();

  return (
    <Link
      href="/"
      onClick={onClick}
      className={cn(
        "group relative inline-flex items-center transition hover:opacity-90",
        className,
      )}
      aria-label={t("logo.home")}
    >
      <Image
        src="/images/los-compadres-banner.png"
        alt={t("logo.alt")}
        width={1018}
        height={395}
        priority
        className={cn(
          "w-auto object-contain",
          imageClassName ?? "h-10 sm:h-12",
        )}
      />
    </Link>
  );
}
