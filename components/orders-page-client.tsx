"use client";

import { FormEvent, useState } from "react";
import { BackButton } from "@/components/back-button";
import { Button } from "@/components/button";
import type { OrderRecord } from "@/lib/orders/types";
import { formatCurrency } from "@/lib/utils";

export function OrdersPageClient() {
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<OrderRecord[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setOrders(null);
    setLoading(true);
    try {
      const res = await fetch(
        `/api/orders?email=${encodeURIComponent(email.trim())}`,
        { cache: "no-store" },
      );
      const data = (await res.json().catch(() => null)) as {
        orders?: OrderRecord[];
        error?: string;
      } | null;
      if (!res.ok) {
        throw new Error(data?.error || "Could not load orders");
      }
      setOrders(data?.orders ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load orders");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-site py-10 sm:py-14">
      <BackButton className="mb-6" />
      <p className="text-sm font-semibold tracking-[0.22em] text-green uppercase">
        Orders
      </p>
      <h1 className="mt-2 font-brush text-fluid-section text-white">
        Find your orders
      </h1>
      <p className="mt-3 max-w-xl text-muted">
        Enter the email used at checkout to pull up your recent orders and
        payments.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"
      >
        <label className="sr-only" htmlFor="orders-email">
          Email
        </label>
        <input
          id="orders-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="min-h-11 flex-1 rounded-md border border-border-dark bg-surface-dark px-3 text-white outline-none focus:border-yellow"
        />
        <Button type="submit" loading={loading}>
          Look up
        </Button>
      </form>

      {error ? (
        <p className="mt-4 text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      {orders ? (
        <div className="mt-10 space-y-4">
          {orders.length === 0 ? (
            <p className="text-muted">No orders found for that email.</p>
          ) : (
            orders.map((order) => (
              <article
                key={order.id}
                className="rounded-xl border border-border-dark bg-surface-dark p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-xl tracking-wide uppercase">
                      {order.id}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {new Date(order.createdAt).toLocaleString()} ·{" "}
                      {order.paymentStatus}
                      {order.cardLast4 ? ` · •••• ${order.cardLast4}` : ""}
                    </p>
                  </div>
                  <p className="text-lg font-semibold text-yellow">
                    {formatCurrency(order.total)}
                  </p>
                </div>
                <ul className="mt-4 space-y-2 border-t border-border-dark pt-4 text-sm">
                  {order.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex justify-between gap-4 text-muted"
                    >
                      <span>
                        {item.quantity}× {item.name}
                      </span>
                      <span className="text-white">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
