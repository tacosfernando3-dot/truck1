"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/button";

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

export function CateringInquiryForm() {
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): FormErrors {
    const next: FormErrors = {};
    if (!form.fullName.trim()) next.fullName = "Full name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = "Enter a valid email.";
    }
    if (!form.phone.trim()) next.phone = "Phone is required.";
    if (!form.eventType.trim()) next.eventType = "Select an event type.";
    if (!form.eventDate) next.eventDate = "Event date is required.";
    const guests = Number(form.guestCount);
    if (!form.guestCount || Number.isNaN(guests) || guests <= 0) {
      next.guestCount = "Guest count must be greater than zero.";
    }
    if (!form.eventLocation.trim()) {
      next.eventLocation = "Event location is required.";
    }
    if (!form.packageId) next.packageId = "Choose a package.";
    if (!form.message.trim()) next.message = "Message is required.";
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
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    setSuccess(true);
    setForm(initial);
  }

  if (success) {
    return (
      <div
        className="rounded-xl border border-yellow/40 bg-surface-dark p-6"
        role="status"
      >
        <h3 className="font-display text-2xl tracking-wide uppercase text-yellow">
          Inquiry received
        </h3>
        <p className="mt-2 text-muted">
          Thanks for reaching out. Our catering team will reply within one
          business day with availability and a custom quote.
        </p>
        <Button className="mt-5" onClick={() => setSuccess(false)}>
          Send another inquiry
        </Button>
      </div>
    );
  }

  const fieldClass =
    "mt-1.5 w-full min-h-11 rounded-md border border-border-dark bg-background px-4 text-white outline-none focus:border-yellow";

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="fullName" className="text-sm text-muted">
            Full name
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
            Email
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
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className="text-sm text-muted">
            Phone
          </label>
          <input
            id="phone"
            type="tel"
            className={fieldClass}
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
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
            Event type
          </label>
          <select
            id="eventType"
            className={fieldClass}
            value={form.eventType}
            onChange={(e) => update("eventType", e.target.value)}
            aria-invalid={!!errors.eventType}
            aria-describedby={errors.eventType ? "eventType-error" : undefined}
          >
            <option value="">Select type</option>
            <option>Corporate lunch</option>
            <option>Wedding / private party</option>
            <option>Festival / market</option>
            <option>Film / production</option>
            <option>Other</option>
          </select>
          {errors.eventType && (
            <p id="eventType-error" className="mt-1 text-sm text-red-400" role="alert">
              {errors.eventType}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="eventDate" className="text-sm text-muted">
            Event date
          </label>
          <input
            id="eventDate"
            type="date"
            className={fieldClass}
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
            Guest count
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
      </div>

      <div>
        <label htmlFor="eventLocation" className="text-sm text-muted">
          Event location
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
          Package
        </label>
        <select
          id="packageId"
          className={fieldClass}
          value={form.packageId}
          onChange={(e) => update("packageId", e.target.value)}
          aria-invalid={!!errors.packageId}
          aria-describedby={errors.packageId ? "packageId-error" : undefined}
        >
          <option value="">Select package</option>
          <option value="essentials">Street Essentials</option>
          <option value="crowd">Crowd Favorite</option>
          <option value="full-truck">Full Truck Experience</option>
        </select>
        {errors.packageId && (
          <p id="packageId-error" className="mt-1 text-sm text-red-400" role="alert">
            {errors.packageId}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="text-sm text-muted">
          Message
        </label>
        <textarea
          id="message"
          rows={5}
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

      <Button type="submit" loading={loading}>
        Submit Inquiry
      </Button>
    </form>
  );
}
