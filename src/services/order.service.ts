import { env } from "@/env";

export type CreateOrderPayload = {
  shippingAddress: string;
  items: { medicineId: string; quantity: number }[];
};

export type OrderResponse = {
  id: string;
  totalAmount: number;
  shippingAddress: string;
  status: "PENDING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  items: Array<{
    id: string;
    orderId: string;
    medicineId: string;
    quantity: number;
    price: number;
  }>;
};

export const orderService = {
  async createOrder(payload: CreateOrderPayload): Promise<OrderResponse> {
    const res = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const json: unknown = await res.json().catch(() => null);

    if (!res.ok) {
      const msg =
        (json as { message?: string })?.message ||
        (json as { error?: string })?.error ||
        (json as { details?: string })?.details ||
        "Order failed";
      throw new Error(msg);
    }

    return json as OrderResponse;
  },
};