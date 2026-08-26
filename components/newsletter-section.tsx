"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/button";
import { useT } from "@/lib/i18n";

export function NewsletterSection({ compact = false }: { compact?: boolean }) {
  const t = useT();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      setErrorMessage(t("newsletter.invalid"));
      return;
    }
    setStatus("loading");
    setErrorMessage("");
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          department: "newsletter",
          email: email.trim(),
        }),
      });
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!res.ok) {
        throw new Error(data?.error || t("newsletter.submitFailed"));
      }
      setStatus("success");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : t("newsletter.submitFailed"),
      );
    }
  }

  return (
    <div className={compact ? "" : "py-8"}>
      {!compact && (
        <>
          <h3 className="font-display text-xl tracking-wide uppercase">
            {t("newsletter.title")}
          </h3>
          <p className="mt-2 text-sm text-muted">{t("newsletter.subtitle")}</p>
        </>
      )}
      {compact && (
        <>
          <h3 className="font-display text-xl tracking-wide uppercase">
            {t("newsletter.title")}
          </h3>
          <p className="mt-2 text-sm text-muted">{t("newsletter.subtitleCompact")}</p>
        </>
      )}
      <form
        onSubmit={onSubmit}
        className={
          compact
            ? "mt-4 flex min-w-0 flex-col gap-2"
            : "mt-4 flex min-w-0 flex-col gap-2 sm:flex-row"
        }
      >
        <label htmlFor="newsletter-email" className="sr-only">
          {t("newsletter.emailLabel")}
        </label>
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setStatus("idle");
            setErrorMessage("");
          }}
          placeholder={t("newsletter.placeholder")}
          className="min-h-11 w-full min-w-0 flex-1 rounded-md border border-border-dark bg-surface-dark px-4 text-white outline-none placeholder:text-muted focus:border-yellow"
          required
        />
        <Button
          type="submit"
          loading={status === "loading"}
          className={
            compact
              ? "w-full shrink-0 hover:!bg-white hover:!text-background"
              : "w-full shrink-0 hover:!bg-white hover:!text-background sm:w-auto"
          }
        >
          {t("newsletter.subscribe")}
        </Button>
      </form>
      {status === "success" && (
        <p className="mt-2 text-sm text-yellow" role="status">
          {t("newsletter.success")}
        </p>
      )}
      {status === "error" && (
        <p className="mt-2 text-sm text-red-400" role="alert">
          {errorMessage || t("newsletter.invalid")}
        </p>
      )}
    </div>
  );
}
