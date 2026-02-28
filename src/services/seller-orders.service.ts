import { env } from "@/env";

export type OrderStatus = "PENDING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export type SellerOrderItem = {
  id: string;
  quantity: number;
  price: number;
  medicine: {
    name: string;
    manufacturer: string;
    price: number;
  };
};

export type SellerOrder = {
  id: string;
  totalAmount: number;
  shippingAddress: string;
  status: OrderStatus;
  createdAt: string;
  customer: {
    name: string;
    email: string;
  };
  items: SellerOrderItem[];
};

function extractOrders(payload: unknown): SellerOrder[] {
  // Accept:
  // 1) array
  // 2) { data: array }
  // 3) { success, data: array }
  if (Array.isArray(payload)) return payload as SellerOrder[];

  const p = payload as { data?: unknown };
  if (Array.isArray(p?.data)) return p.data as SellerOrder[];

  throw new Error("Invalid orders response format");
}

export const sellerOrdersService = {
  async getManageOrders(): Promise<SellerOrder[]> {
    const res = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/api/orders/manage`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    const data: unknown = await res.json().catch(() => null);

    if (!res.ok) {
      const msg =
        (data as { message?: string })?.message ||
        (data as { error?: string })?.error ||
        "Failed to load seller orders";
      throw new Error(msg);
    }

    return extractOrders(data);
  },

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    const res = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    });

    const data: unknown = await res.json().catch(() => null);

    if (!res.ok) {
      const msg =
        (data as { message?: string })?.message ||
        (data as { error?: string })?.error ||
        "Failed to update order status";
      throw new Error(msg);
    }

    return data;
  },
};