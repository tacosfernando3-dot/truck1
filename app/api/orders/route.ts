import { NextResponse } from "next/server";
import { createOrder, listOrdersByEmail } from "@/lib/orders/store";
import type { CreateOrderInput, OrderLineInput } from "@/lib/orders/types";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isOrderLine(value: unknown): value is OrderLineInput {
  if (!value || typeof value !== "object") return false;
  const v = value as OrderLineInput;
  return (
    typeof v.menuItemId === "string" &&
    typeof v.name === "string" &&
    typeof v.unitPrice === "number" &&
    typeof v.quantity === "number" &&
    v.quantity > 0
  );
}

function isCreateOrderInput(value: unknown): value is CreateOrderInput {
  if (!value || typeof value !== "object") return false;
  const v = value as CreateOrderInput;
  return (
    typeof v.email === "string" &&
    typeof v.customerName === "string" &&
    Array.isArray(v.items) &&
    v.items.length > 0 &&
    v.items.every(isOrderLine) &&
    typeof v.subtotal === "number" &&
    typeof v.tax === "number" &&
    typeof v.total === "number"
  );
}

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 503 },
    );
  }

  const email = new URL(request.url).searchParams.get("email")?.trim() ?? "";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }

  try {
    const orders = await listOrdersByEmail(email);
    return NextResponse.json({ orders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load orders";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => null)) as unknown;
  if (!isCreateOrderInput(body)) {
    return NextResponse.json({ error: "Invalid order payload" }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }

  try {
    const order = await createOrder({
      ...body,
      paymentProvider: body.paymentProvider ?? "simulator",
    });
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
