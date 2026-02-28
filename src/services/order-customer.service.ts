import { env } from "@/env";

export type OrderStatus = "PENDING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export type MyOrderItem = {
  id: string;
  orderId: string;
  medicineId: string;
  quantity: number;
  price: number;
  medicine?: {
    name?: string;
    manufacturer?: string;
  };
};

export type MyOrder = {
  id: string;
  totalAmount: number;
  shippingAddress: string;
  status: OrderStatus;
  createdAt: string;
  items: MyOrderItem[];
};

function pickMsg(json: unknown) {
  const j = json as { message?: string; error?: string; details?: string };
  return j?.message || j?.error || j?.details || "Request failed";
}

export const customerOrderService = {
  async getMyOrders(): Promise<MyOrder[]> {
    const res = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/api/orders/my-orders`, {
      credentials: "include",
      cache: "no-store",
    });

    const json: unknown = await res.json().catch(() => null);

    if (!res.ok) throw new Error(pickMsg(json));

    // Your controllers sometimes return {success,data} and sometimes raw.
    // Support both:
    const maybe = json as { data?: unknown };
    return (maybe?.data ?? json) as MyOrder[];
  },

  async cancelOrder(orderId: string) {
    const res = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status: "CANCELLED" }),
    });

    const json: unknown = await res.json().catch(() => null);
    if (!res.ok) throw new Error(pickMsg(json));
    return json;
  },
};