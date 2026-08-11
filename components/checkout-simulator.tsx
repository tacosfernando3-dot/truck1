"use client";

import { FormEvent, useEffect, useState } from "react";
import { CheckCircle2, Lock, X } from "lucide-react";
import { Button } from "@/components/button";
import { useCart } from "@/components/cart-provider";
import { useI18n, useT } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
};

type FieldErrors = {
  email?: string;
  card?: string;
  expiry?: string;
  cvc?: string;
  name?: string;
};

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function formatCardNumber(value: string) {
  return onlyDigits(value)
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();
}

function formatExpiry(value: string) {
  const digits = onlyDigits(value).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function CheckoutSimulator({ open, onClose }: Props) {
  const { items, subtotal, clearCart, closeCart } = useCart();
  const t = useT();
  const { locale } = useI18n();
  const [email, setEmail] = useState("");
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"form" | "processing" | "success">(
    "form",
  );
  const [orderId, setOrderId] = useState("");
  const [paidTotal, setPaidTotal] = useState(0);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && status !== "processing") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose, status]);

  useEffect(() => {
    if (!open) {
      setStatus("form");
      setErrors({});
    }
  }, [open]);

  if (!open) return null;

  const tax = Math.round(subtotal * 0.08875 * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = t("checkout.validEmail");
    }
    const cardDigits = onlyDigits(card);
    if (cardDigits.length < 15) {
      next.card = t("checkout.completeCard");
    }
    const expDigits = onlyDigits(expiry);
    if (expDigits.length !== 4) {
      next.expiry = t("checkout.useMmYy");
    } else {
      const month = Number(expDigits.slice(0, 2));
      if (month < 1 || month > 12) next.expiry = t("checkout.invalidMonth");
    }
    if (onlyDigits(cvc).length < 3) {
      next.cvc = t("checkout.enterCvc");
    }
    if (!name.trim()) next.name = t("checkout.nameRequired");
    return next;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next = validate();
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    setStatus("processing");
    setPaidTotal(total);
    setErrors({});

    const cardDigits = onlyDigits(card);
    const cardLast4 = cardDigits.slice(-4);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          customerName: name.trim(),
          subtotal,
          tax,
          total,
          cardLast4,
          paymentProvider: "simulator",
          items: items.map((item) => ({
            menuItemId: item.id,
            name: item.name,
            unitPrice: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
        }),
      });

      const data = (await res.json().catch(() => null)) as {
        order?: { id: string };
        error?: string;
      } | null;

      if (!res.ok || !data?.order?.id) {
        throw new Error(data?.error || "Payment failed");
      }

      setOrderId(data.order.id);
      clearCart();
      setStatus("success");
    } catch (error) {
      setStatus("form");
      setErrors({
        name:
          error instanceof Error
            ? error.message
            : "Could not complete payment. Try again.",
      });
    }
  }

  function finish() {
    setEmail("");
    setCard("");
    setExpiry("");
    setCvc("");
    setName("");
    setStatus("form");
    onClose();
    closeCart();
  }

  const field =
    "mt-1.5 w-full min-h-11 rounded-md border border-black/15 bg-white px-3 text-[15px] text-background outline-none focus:border-[#635bff] focus:ring-2 focus:ring-[#635bff]/30";

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/75 animate-fade-in"
        aria-label={t("checkout.close")}
        onClick={() => status !== "processing" && onClose()}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("checkout.simulatorAria")}
        className="relative z-10 flex max-h-[min(92vh,720px)] w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-white text-background shadow-2xl animate-slide-up sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[#635bff] uppercase">
              {t("checkout.stripeSim")}
            </p>
            <h2 className="text-lg font-semibold">{t("checkout.brand")}</h2>
          </div>
          {status !== "processing" && (
            <button
              type="button"
              onClick={status === "success" ? finish : onClose}
              className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-md hover:bg-black/5"
              aria-label={t("checkout.close")}
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {status === "success" ? (
            <div className="flex flex-col items-center py-8 text-center">
              <CheckCircle2 className="h-14 w-14 text-emerald-500" aria-hidden />
              <h3 className="mt-4 text-2xl font-semibold">{t("checkout.success")}</h3>
              <p className="mt-2 text-sm text-background/65">{t("checkout.simulated")}</p>
              <p className="mt-2 text-sm text-background/65">
                Look up this order anytime at{" "}
                <a href="/orders" className="font-medium text-[#635bff] underline">
                  /orders
                </a>{" "}
                with your email.
              </p>
              <div className="mt-6 w-full rounded-xl border border-black/10 bg-[#f6f9fc] p-4 text-left text-sm">
                <div className="flex justify-between">
                  <span className="text-background/60">{t("checkout.order")}</span>
                  <span className="font-medium">{orderId}</span>
                </div>
                <div className="mt-2 flex justify-between">
                  <span className="text-background/60">{t("checkout.totalPaid")}</span>
                  <span className="font-semibold">{formatCurrency(paidTotal, locale)}</span>
                </div>
                <p className="mt-3 text-xs text-background/55">
                  {t("checkout.showConfirmation")}
                </p>
              </div>
              <Button className="mt-6 w-full" onClick={finish}>
                {t("common.done")}
              </Button>
            </div>
          ) : status === "processing" ? (
            <div className="flex flex-col items-center py-16 text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#635bff] border-t-transparent" />
              <p className="mt-5 font-medium">{t("checkout.processing")}</p>
              <p className="mt-1 text-sm text-background/60">{t("checkout.simulating")}</p>
            </div>
          ) : (
            <>
              <div className="mb-5 rounded-xl border border-black/10 bg-[#f6f9fc] p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-background/60">
                    {t(items.length === 1 ? "checkout.item" : "checkout.items", {
                      count: items.length,
                    })}
                  </span>
                  <span>{formatCurrency(subtotal, locale)}</span>
                </div>
                <div className="mt-1 flex justify-between text-sm">
                  <span className="text-background/60">{t("checkout.estTax")}</span>
                  <span>{formatCurrency(tax, locale)}</span>
                </div>
                <div className="mt-3 flex justify-between border-t border-black/10 pt-3 text-base font-semibold">
                  <span>{t("checkout.totalDue")}</span>
                  <span>{formatCurrency(total, locale)}</span>
                </div>
              </div>

              <form onSubmit={onSubmit} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="stripe-email" className="text-sm font-medium">
                    {t("checkout.email")}
                  </label>
                  <input
                    id="stripe-email"
                    type="email"
                    autoComplete="email"
                    className={field}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600" role="alert">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="stripe-card" className="text-sm font-medium">
                    {t("checkout.cardInfo")}
                  </label>
                  <input
                    id="stripe-card"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder={t("checkout.cardNumber")}
                    className={`${field} rounded-b-none`}
                    value={card}
                    onChange={(e) => {
                      setCard(formatCardNumber(e.target.value));
                      setErrors((prev) => ({ ...prev, card: undefined }));
                    }}
                    aria-invalid={!!errors.card}
                  />
                  <div className="grid grid-cols-2">
                    <input
                      id="stripe-expiry"
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      placeholder={t("checkout.mmYy")}
                      className={`${field} mt-0 rounded-none rounded-bl-md border-t-0`}
                      value={expiry}
                      onChange={(e) => {
                        setExpiry(formatExpiry(e.target.value));
                        setErrors((prev) => ({ ...prev, expiry: undefined }));
                      }}
                      aria-invalid={!!errors.expiry}
                      aria-label={t("checkout.expiry")}
                    />
                    <input
                      id="stripe-cvc"
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      placeholder={t("checkout.cvc")}
                      className={`${field} mt-0 rounded-none rounded-br-md border-t-0 border-l-0`}
                      value={cvc}
                      onChange={(e) => {
                        setCvc(onlyDigits(e.target.value).slice(0, 4));
                        setErrors((prev) => ({ ...prev, cvc: undefined }));
                      }}
                      aria-invalid={!!errors.cvc}
                      aria-label={t("checkout.cvc")}
                    />
                  </div>
                  {(errors.card || errors.expiry || errors.cvc) && (
                    <p className="mt-1 text-sm text-red-600" role="alert">
                      {errors.card || errors.expiry || errors.cvc}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="stripe-name" className="text-sm font-medium">
                    {t("checkout.nameOnCard")}
                  </label>
                  <input
                    id="stripe-name"
                    autoComplete="cc-name"
                    className={field}
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    aria-invalid={!!errors.name}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600" role="alert">
                      {errors.name}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-[#635bff] px-5 py-2.5 text-sm font-semibold tracking-wide text-white uppercase transition hover:bg-[#5851ea] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#635bff]"
                >
                  <Lock className="h-4 w-4" aria-hidden />
                  {t("checkout.pay", { total: formatCurrency(total, locale) })}
                </button>
              </form>
            </>
          )}
        </div>

        <div className="border-t border-black/10 px-5 py-3 text-center text-[11px] text-background/45">
          {t("checkout.powered")}
        </div>
      </div>
    </div>
  );
}
