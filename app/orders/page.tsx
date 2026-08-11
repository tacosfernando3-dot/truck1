import type { Metadata } from "next";
import { OrdersPageClient } from "@/components/orders-page-client";

export const metadata: Metadata = {
  title: "Your Orders",
  description: "Look up past food truck orders by email.",
};

export default function OrdersPage() {
  return <OrdersPageClient />;
}
