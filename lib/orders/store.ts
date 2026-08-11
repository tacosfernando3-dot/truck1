import { getSupabaseAdmin } from "@/lib/supabase/server";
import type {
  CreateOrderInput,
  OrderItemRecord,
  OrderRecord,
} from "@/lib/orders/types";

type OrderRow = {
  id: string;
  email: string;
  customer_name: string;
  status: OrderRecord["status"];
  subtotal: number | string;
  tax: number | string;
  total: number | string;
  currency: string;
  payment_provider: "simulator" | "stripe";
  payment_status: OrderRecord["paymentStatus"];
  payment_intent_id: string | null;
  card_last4: string | null;
  created_at: string;
};

type OrderItemRow = {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  name: string;
  unit_price: number | string;
  quantity: number;
  image: string | null;
};

function money(value: number | string) {
  return typeof value === "number" ? value : Number(value);
}

function mapItem(row: OrderItemRow): OrderItemRecord {
  return {
    id: row.id,
    orderId: row.order_id,
    menuItemId: row.menu_item_id,
    name: row.name,
    unitPrice: money(row.unit_price),
    quantity: row.quantity,
    image: row.image,
  };
}

function mapOrder(row: OrderRow, items: OrderItemRow[]): OrderRecord {
  return {
    id: row.id,
    email: row.email,
    customerName: row.customer_name,
    status: row.status,
    subtotal: money(row.subtotal),
    tax: money(row.tax),
    total: money(row.total),
    currency: row.currency,
    paymentProvider: row.payment_provider,
    paymentStatus: row.payment_status,
    paymentIntentId: row.payment_intent_id,
    cardLast4: row.card_last4,
    createdAt: row.created_at,
    items: items.map(mapItem),
  };
}

function makeOrderId() {
  return `LC-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;
}

export async function createOrder(input: CreateOrderInput): Promise<OrderRecord> {
  const supabase = getSupabaseAdmin();
  const id = makeOrderId();
  const provider = input.paymentProvider ?? "simulator";

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      id,
      email: input.email.trim().toLowerCase(),
      customer_name: input.customerName.trim(),
      status: "paid",
      subtotal: input.subtotal,
      tax: input.tax,
      total: input.total,
      currency: "usd",
      payment_provider: provider,
      payment_status: "succeeded",
      payment_intent_id: input.paymentIntentId ?? null,
      card_last4: input.cardLast4 ?? null,
    })
    .select("*")
    .single();

  if (orderError || !order) {
    throw new Error(orderError?.message || "Failed to create order");
  }

  const lines = input.items.map((item) => ({
    order_id: id,
    menu_item_id: item.menuItemId,
    name: item.name,
    unit_price: item.unitPrice,
    quantity: item.quantity,
    image: item.image ?? null,
  }));

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .insert(lines)
    .select("*");

  if (itemsError) {
    await supabase.from("orders").delete().eq("id", id);
    throw new Error(itemsError.message);
  }

  return mapOrder(order as OrderRow, (items ?? []) as OrderItemRow[]);
}

export async function listOrdersByEmail(email: string): Promise<OrderRecord[]> {
  const supabase = getSupabaseAdmin();
  const normalized = email.trim().toLowerCase();

  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .eq("email", normalized)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  if (!orders?.length) return [];

  const ids = orders.map((o) => o.id as string);
  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .in("order_id", ids);

  if (itemsError) throw new Error(itemsError.message);

  const byOrder = new Map<string, OrderItemRow[]>();
  for (const item of (items ?? []) as OrderItemRow[]) {
    const list = byOrder.get(item.order_id) ?? [];
    list.push(item);
    byOrder.set(item.order_id, list);
  }

  return (orders as OrderRow[]).map((order) =>
    mapOrder(order, byOrder.get(order.id) ?? []),
  );
}

export async function listRecentOrders(limit = 50): Promise<OrderRecord[]> {
  const supabase = getSupabaseAdmin();

  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  if (!orders?.length) return [];

  const ids = orders.map((o) => o.id as string);
  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .in("order_id", ids);

  if (itemsError) throw new Error(itemsError.message);

  const byOrder = new Map<string, OrderItemRow[]>();
  for (const item of (items ?? []) as OrderItemRow[]) {
    const list = byOrder.get(item.order_id) ?? [];
    list.push(item);
    byOrder.set(item.order_id, list);
  }

  return (orders as OrderRow[]).map((order) =>
    mapOrder(order, byOrder.get(order.id) ?? []),
  );
}
