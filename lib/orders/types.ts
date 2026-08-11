export type OrderStatus =
  | "pending"
  | "paid"
  | "failed"
  | "cancelled"
  | "refunded";

export type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded";

export type OrderLineInput = {
  menuItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  image?: string;
};

export type CreateOrderInput = {
  email: string;
  customerName: string;
  items: OrderLineInput[];
  subtotal: number;
  tax: number;
  total: number;
  cardLast4?: string;
  paymentProvider?: "simulator" | "stripe";
  paymentIntentId?: string;
};

export type OrderItemRecord = {
  id: string;
  orderId: string;
  menuItemId: string | null;
  name: string;
  unitPrice: number;
  quantity: number;
  image: string | null;
};

export type OrderRecord = {
  id: string;
  email: string;
  customerName: string;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  paymentProvider: "simulator" | "stripe";
  paymentStatus: PaymentStatus;
  paymentIntentId: string | null;
  cardLast4: string | null;
  createdAt: string;
  items: OrderItemRecord[];
};
