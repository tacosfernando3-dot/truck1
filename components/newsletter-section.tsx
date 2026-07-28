"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/button";

export function NewsletterSection({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      return;
    }
    setStatus("success");
    setEmail("");
  }

  return (
    <div className={compact ? "" : "py-8"}>
      {!compact && (
        <>
          <h3 className="font-display text-xl tracking-wide uppercase">
            Join the Crew
          </h3>
          <p className="mt-2 text-sm text-muted">
            Get stop alerts, secret menu drops, and catering deals.
          </p>
        </>
      )}
      {compact && (
        <>
          <h3 className="font-display text-xl tracking-wide uppercase">
            Join the Crew
          </h3>
          <p className="mt-2 text-sm text-muted">
            Fresh stops and specials in your inbox.
          </p>
        </>
      )}
      <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setStatus("idle");
          }}
          placeholder="you@email.com"
          className="min-h-11 flex-1 rounded-md border border-border-dark bg-surface-dark px-4 text-white outline-none placeholder:text-muted focus:border-yellow"
          required
        />
        <Button type="submit" className="w-full sm:w-auto">
          Subscribe
        </Button>
      </form>
      {status === "success" && (
        <p className="mt-2 text-sm text-yellow" role="status">
          You&apos;re on the list. See you at the truck.
        </p>
      )}
      {status === "error" && (
        <p className="mt-2 text-sm text-red-400" role="alert">
          Enter a valid email address.
        </p>
      )}
    </div>
  );
}
