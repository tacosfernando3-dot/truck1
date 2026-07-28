import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href="/"
      onClick={onClick}
      className={cn(
        "group relative inline-flex items-center transition hover:opacity-90",
        className,
      )}
      aria-label="Street Crave Food Truck home"
    >
      <Image
        src="/images/street-crave-logo.png"
        alt="Street Crave Food Truck"
        width={602}
        height={245}
        priority
        className="h-10 w-auto object-contain sm:h-12"
      />
    </Link>
  );
}
