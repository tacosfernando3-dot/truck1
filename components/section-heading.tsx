import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  dark = false,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  action?: ReactNode;
  dark?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="mb-2 text-sm font-semibold tracking-[0.22em] text-yellow uppercase">
            {eyebrow}
          </p>
        )}
        <h2
          className={cn(
            "font-brush text-fluid-section",
            dark ? "text-white" : "text-background",
          )}
        >
          {title}
        </h2>
        {description && (
          <p
            className={cn(
              "mt-3 max-w-xl text-base",
              dark ? "text-muted" : "text-background/70",
            )}
          >
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
