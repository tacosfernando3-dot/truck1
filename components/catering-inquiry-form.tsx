"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/button";
import { formatPhoneInput } from "@/lib/cms/utils";
import { useT } from "@/lib/i18n";

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  guestCount: string;
  eventLocation: string;
  packageId: string;
  message: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const initial: FormState = {
  fullName: "",
  email: "",
  phone: "",
  eventType: "",
  eventDate: "",
  guestCount: "",
  eventLocation: "",
  packageId: "",
  message: "",
};

const eventTypeOptions = [
  { value: "corporate", key: "cateringForm.typeCorporate" },
  { value: "wedding", key: "cateringForm.typeWedding" },
  { value: "festival", key: "cateringForm.typeFestival" },
  { value: "film", key: "cateringForm.typeFilm" },
  { value: "other", key: "cateringForm.typeOther" },
] as const;

const packageOptions = [
  { value: "essentials", key: "catering.pkgEssentials" },
  { value: "crowd", key: "catering.pkgCrowd" },
  { value: "full-truck", key: "catering.pkgFull" },
] as const;

export function CateringInquiryForm() {
  const t = useT();
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): FormErrors {
    const next: FormErrors = {};
    if (!form.fullName.trim()) next.fullName = t("cateringForm.nameRequired");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = t("cateringForm.emailInvalid");
    }
    if (!form.phone.trim()) next.phone = t("cateringForm.phoneRequired");
    if (!form.eventType.trim()) next.eventType = t("cateringForm.eventTypeRequired");
    if (!form.eventDate) next.eventDate = t("cateringForm.dateRequired");
    const guests = Number(form.guestCount);
    if (!form.guestCount || Number.isNaN(guests) || guests <= 0) {
      next.guestCount = t("cateringForm.guestsInvalid");
    }
    if (!form.eventLocation.trim()) {
      next.eventLocation = t("cateringForm.locationRequired");
    }
    if (!form.packageId) next.packageId = t("cateringForm.packageRequired");
    if (!form.message.trim()) next.message = t("cateringForm.messageRequired");
    return next;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next = validate();
    if (Object.keys(next).length) {
      setErrors(next);
      setSuccess(false);
      return;
    }
    setLoading(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          department: "catering",
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          message: form.message.trim(),
          payload: {
            eventType: form.eventType,
            eventDate: form.eventDate,
            guestCount: form.guestCount,
            eventLocation: form.eventLocation,
            packageId: form.packageId,
          },
        }),
      });
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!res.ok) {
        throw new Error(data?.error || t("cateringForm.submitFailed"));
      }
      setSuccess(true);
      setForm(initial);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : t("cateringForm.submitFailed"),
      );
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div
        className="rounded-xl border border-yellow/40 bg-surface-dark p-6"
        role="status"
      >
        <h3 className="font-display text-2xl tracking-wide uppercase text-yellow">
          {t("cateringForm.successTitle")}
        </h3>
        <p className="mt-2 text-muted">{t("cateringForm.successBody")}</p>
        <Button className="mt-5" onClick={() => setSuccess(false)}>
          {t("cateringForm.sendAnother")}
        </Button>
      </div>
    );
  }

  const fieldClass =
    "mt-1.5 w-full min-h-11 rounded-md border border-border-dark bg-background px-4 text-white outline-none focus:border-yellow";

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {submitError ? (
        <p className="text-sm text-red-400" role="alert">
          {submitError}
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label htmlFor="fullName" className="text-sm text-muted">
            {t("cateringForm.fullName")}
          </label>
          <input
            id="fullName"
            className={fieldClass}
            value={form.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            aria-invalid={!!errors.fullName}
            aria-describedby={errors.fullName ? "fullName-error" : undefined}
          />
          {errors.fullName && (
            <p id="fullName-error" className="mt-1 text-sm text-red-400" role="alert">
              {errors.fullName}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="email" className="text-sm text-muted">
            {t("cateringForm.email")}
          </label>
          <input
            id="email"
            type="email"
            className={fieldClass}
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-sm text-red-400" role="alert">
              {errors.email}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="phone" className="text-sm text-muted">
            {t("cateringForm.phone")}
          </label>
          <input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="(555) 555-5555"
            className={fieldClass}
            value={form.phone}
            onChange={(e) => update("phone", formatPhoneInput(e.target.value))}
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "phone-error" : undefined}
          />
          {errors.phone && (
            <p id="phone-error" className="mt-1 text-sm text-red-400" role="alert">
              {errors.phone}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="eventType" className="text-sm text-muted">
            {t("cateringForm.eventType")}
          </label>
          <select
            id="eventType"
            className={fieldClass}
            value={form.eventType}
            onChange={(e) => update("eventType", e.target.value)}
            aria-invalid={!!errors.eventType}
            aria-describedby={errors.eventType ? "eventType-error" : undefined}
          >
            <option value="">{t("cateringForm.selectType")}</option>
            {eventTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.key)}
              </option>
            ))}
          </select>
          {errors.eventType && (
            <p id="eventType-error" className="mt-1 text-sm text-red-400" role="alert">
              {errors.eventType}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="eventDate" className="text-sm text-muted">
            {t("cateringForm.eventDate")}
          </label>
          <input
            id="eventDate"
            type="date"
            className={`${fieldClass} date-input-dark`}
            value={form.eventDate}
            onChange={(e) => update("eventDate", e.target.value)}
            aria-invalid={!!errors.eventDate}
            aria-describedby={errors.eventDate ? "eventDate-error" : undefined}
          />
          {errors.eventDate && (
            <p id="eventDate-error" className="mt-1 text-sm text-red-400" role="alert">
              {errors.eventDate}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="guestCount" className="text-sm text-muted">
            {t("cateringForm.guestCount")}
          </label>
          <input
            id="guestCount"
            type="number"
            min={1}
            className={fieldClass}
            value={form.guestCount}
            onChange={(e) => update("guestCount", e.target.value)}
            aria-invalid={!!errors.guestCount}
            aria-describedby={errors.guestCount ? "guestCount-error" : undefined}
          />
          {errors.guestCount && (
            <p id="guestCount-error" className="mt-1 text-sm text-red-400" role="alert">
              {errors.guestCount}
            </p>
          )}
        </div>
        <div className="sm:col-span-2 lg:col-span-2">
          <label htmlFor="eventLocation" className="text-sm text-muted">
            {t("cateringForm.eventLocation")}
          </label>
          <input
            id="eventLocation"
            className={fieldClass}
            value={form.eventLocation}
            onChange={(e) => update("eventLocation", e.target.value)}
            aria-invalid={!!errors.eventLocation}
            aria-describedby={
              errors.eventLocation ? "eventLocation-error" : undefined
            }
          />
          {errors.eventLocation && (
            <p id="eventLocation-error" className="mt-1 text-sm text-red-400" role="alert">
              {errors.eventLocation}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="packageId" className="text-sm text-muted">
            {t("cateringForm.package")}
          </label>
          <select
            id="packageId"
            className={fieldClass}
            value={form.packageId}
            onChange={(e) => update("packageId", e.target.value)}
            aria-invalid={!!errors.packageId}
            aria-describedby={errors.packageId ? "packageId-error" : undefined}
          >
            <option value="">{t("cateringForm.selectPackage")}</option>
            {packageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.key)}
              </option>
            ))}
          </select>
          {errors.packageId && (
            <p id="packageId-error" className="mt-1 text-sm text-red-400" role="alert">
              {errors.packageId}
            </p>
          )}
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <label htmlFor="message" className="text-sm text-muted">
            {t("cateringForm.message")}
          </label>
          <textarea
            id="message"
            rows={3}
            className={`${fieldClass} py-3`}
            value={form.message}
            onChange={(e) => update("message", e.target.value)}
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? "message-error" : undefined}
          />
          {errors.message && (
            <p id="message-error" className="mt-1 text-sm text-red-400" role="alert">
              {errors.message}
            </p>
          )}
        </div>
      </div>

      <Button type="submit" loading={loading}>
        {t("cateringForm.submit")}
      </Button>
    </form>
  );
}
