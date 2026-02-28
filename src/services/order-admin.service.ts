import { env } from "@/env";

export type OrderStatus = "PENDING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export type AdminOrderItem = {
  id: string;
  orderId: string;
  medicineId: string;
  quantity: number;
  price: number;
  medicine?: {
    name?: string;
    manufacturer?: string;
    price?: number;
  };
};

export type AdminOrder = {
  id: string;
  totalAmount: number;
  shippingAddress: string;
  status: OrderStatus;
  createdAt: string;
  customer?: {
    name?: string;
    email?: string;
  };
  items: AdminOrderItem[];
};

function pickMsg(json: unknown) {
  const j = json as { message?: string; error?: string; details?: string };
  return j?.message || j?.error || j?.details || "Request failed";
}

export const adminOrderService = {
  async getAllOrders(): Promise<AdminOrder[]> {
    const res = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/api/orders/admin/orders`, {
      credentials: "include",
      cache: "no-store",
    });

    const json: unknown = await res.json().catch(() => null);
    if (!res.ok) throw new Error(pickMsg(json));

    const maybe = json as { data?: unknown };
    return (maybe?.data ?? json) as AdminOrder[];
  },

  async updateStatus(orderId: string, status: OrderStatus) {
    const res = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    });

    const json: unknown = await res.json().catch(() => null);
    if (!res.ok) throw new Error(pickMsg(json));
    return json;
  },
};