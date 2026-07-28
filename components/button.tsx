import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant =
  | "primary"
  | "secondary"
  | "outline-light"
  | "outline-dark"
  | "text";

const variants: Record<Variant, string> = {
  primary:
    "bg-yellow text-background hover:bg-background hover:text-yellow border border-transparent hover:border-yellow",
  secondary:
    "bg-background text-white hover:bg-surface-dark-2",
  "outline-light":
    "border border-white/40 bg-transparent text-white hover:border-yellow hover:text-yellow",
  "outline-dark":
    "border border-background/20 bg-transparent text-background hover:border-background hover:bg-background hover:text-cream",
  text: "bg-transparent text-yellow underline-offset-4 hover:underline",
};

type Common = {
  variant?: Variant;
  className?: string;
  children: ReactNode;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

type AsButton = Common &
  Omit<ComponentProps<"button">, "className" | "children"> & {
    href?: undefined;
  };

type AsLink = Common & {
  href: string;
} & Omit<ComponentProps<"a">, "className" | "children" | "href">;

export function Button(props: AsButton | AsLink) {
  const {
    variant = "primary",
    className,
    children,
    loading,
    leftIcon,
    rightIcon,
    ...rest
  } = props;

  const classes = cn(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold tracking-wide uppercase transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    className,
  );

  const content = (
    <>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </>
  );

  if ("href" in props && props.href) {
    const { href, ...linkRest } = rest as AsLink;
    return (
      <Link href={href} className={classes} {...linkRest}>
        {content}
      </Link>
    );
  }

  return (
    <button
      className={classes}
      disabled={loading || (rest as AsButton).disabled}
      {...(rest as Omit<AsButton, keyof Common>)}
    >
      {content}
    </button>
  );
}
