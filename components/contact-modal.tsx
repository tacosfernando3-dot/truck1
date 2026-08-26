"use client";

import { FormEvent, useEffect, useId, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/button";
import { useContact } from "@/components/contact-provider";
import { formatPhoneInput } from "@/lib/cms/utils";
import { useT } from "@/lib/i18n";

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  message: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const initial: FormState = {
  fullName: "",
  email: "",
  phone: "",
  message: "",
};

export function ContactModal() {
  const t = useT();
  const { isContactOpen, closeContact } = useContact();
  const titleId = useId();
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!isContactOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeContact();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isContactOpen, closeContact]);

  useEffect(() => {
    if (!isContactOpen) {
      setForm(initial);
      setErrors({});
      setSuccess(false);
      setLoading(false);
      setSubmitError("");
    }
  }, [isContactOpen]);

  if (!isContactOpen) return null;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): FormErrors {
    const next: FormErrors = {};
    if (!form.fullName.trim()) next.fullName = t("contactForm.nameRequired");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = t("contactForm.emailInvalid");
    }
    if (!form.phone.trim()) next.phone = t("contactForm.phoneRequired");
    if (!form.message.trim()) next.message = t("contactForm.messageRequired");
    return next;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next = validate();
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    setLoading(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          department: "contact",
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          message: form.message.trim(),
        }),
      });
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!res.ok) {
        throw new Error(data?.error || t("contactForm.submitFailed"));
      }
      setSuccess(true);
      setForm(initial);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : t("contactForm.submitFailed"),
      );
    } finally {
      setLoading(false);
    }
  }

  const fieldClass =
    "mt-1.5 w-full min-h-11 rounded-md border border-border-dark bg-background px-4 text-white outline-none focus:border-yellow";

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/75 animate-fade-in"
        aria-label={t("contactForm.closeOverlay")}
        onClick={closeContact}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-label={t("contactForm.dialogAria")}
        className="relative z-10 flex max-h-[min(92vh,640px)] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-border-dark bg-surface-dark shadow-2xl animate-fade-up sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border-dark px-5 py-4 sm:px-6">
          <div>
            <h2
              id={titleId}
              className="font-display text-2xl tracking-wide uppercase text-yellow"
            >
              {t("contactForm.title")}
            </h2>
            <p className="mt-1 text-sm text-muted">{t("contactForm.subtitle")}</p>
          </div>
          <button
            type="button"
            onClick={closeContact}
            className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md text-white hover:bg-background"
            aria-label={t("contactForm.close")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {success ? (
            <div role="status">
              <h3 className="font-display text-2xl tracking-wide uppercase text-yellow">
                {t("contactForm.successTitle")}
              </h3>
              <p className="mt-2 text-muted">{t("contactForm.successBody")}</p>
              <Button className="mt-5" onClick={() => setSuccess(false)}>
                {t("contactForm.sendAnother")}
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              {submitError ? (
                <p className="text-sm text-red-400" role="alert">
                  {submitError}
                </p>
              ) : null}
              <div>
                <label htmlFor="contact-fullName" className="text-sm text-muted">
                  {t("contactForm.fullName")}
                </label>
                <input
                  id="contact-fullName"
                  className={fieldClass}
                  value={form.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  aria-invalid={!!errors.fullName}
                  aria-describedby={
                    errors.fullName ? "contact-fullName-error" : undefined
                  }
                  autoComplete="name"
                />
                {errors.fullName && (
                  <p
                    id="contact-fullName-error"
                    className="mt-1 text-sm text-red-400"
                    role="alert"
                  >
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-email" className="text-sm text-muted">
                    {t("contactForm.email")}
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    className={fieldClass}
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    aria-invalid={!!errors.email}
                    aria-describedby={
                      errors.email ? "contact-email-error" : undefined
                    }
                    autoComplete="email"
                  />
                  {errors.email && (
                    <p
                      id="contact-email-error"
                      className="mt-1 text-sm text-red-400"
                      role="alert"
                    >
                      {errors.email}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="contact-phone" className="text-sm text-muted">
                    {t("contactForm.phone")}
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="(555) 555-5555"
                    className={fieldClass}
                    value={form.phone}
                    onChange={(e) =>
                      update("phone", formatPhoneInput(e.target.value))
                    }
                    aria-invalid={!!errors.phone}
                    aria-describedby={
                      errors.phone ? "contact-phone-error" : undefined
                    }
                  />
                  {errors.phone && (
                    <p
                      id="contact-phone-error"
                      className="mt-1 text-sm text-red-400"
                      role="alert"
                    >
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="contact-message" className="text-sm text-muted">
                  {t("contactForm.message")}
                </label>
                <textarea
                  id="contact-message"
                  rows={4}
                  className={`${fieldClass} py-3`}
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                  aria-invalid={!!errors.message}
                  aria-describedby={
                    errors.message ? "contact-message-error" : undefined
                  }
                />
                {errors.message && (
                  <p
                    id="contact-message-error"
                    className="mt-1 text-sm text-red-400"
                    role="alert"
                  >
                    {errors.message}
                  </p>
                )}
              </div>

              <Button type="submit" loading={loading} className="w-full sm:w-auto">
                {t("contactForm.submit")}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
