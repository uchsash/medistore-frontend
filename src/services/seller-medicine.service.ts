import { env } from "@/env";

export type CreateMedicinePayload = {
  name: string;
  description: string;
  manufacturer: string;
  price: number;
  stock: number;
  categoryId: string;
  imageUrl?: string;
};

export type MyMedicinesQuery = {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "name" | "price" | "manufacturer" | "stock";
  sortOrder?: "asc" | "desc";
  categoryId?: string;
};

function qs(params: MyMedicinesQuery) {
  const sp = new URLSearchParams();
  if (params.search) sp.set("search", params.search);
  if (params.page) sp.set("page", String(params.page));
  if (params.limit) sp.set("limit", String(params.limit));
  if (params.sortBy) sp.set("sortBy", params.sortBy);
  if (params.sortOrder) sp.set("sortOrder", params.sortOrder);
  if (params.categoryId) sp.set("categoryId", params.categoryId);
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export type MedicineRow = {
  id: string;
  name: string;
  description: string;
  price: number;
  manufacturer: string;
  stock: number;
  imageUrl?: string | null;
  createdAt: string;
  category?: { name: string };
  _count?: { reviews: number };
  reviews?: { rating: number }[];
};

export type Paginated<T> = {
  data: T[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
};

export const sellerMedicineService = {
  async createMedicine(payload: CreateMedicinePayload) {
    const res = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/api/medicines`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const data: unknown = await res.json().catch(() => null);
    if (!res.ok) {
      const msg =
        (data as { message?: string })?.message ||
        (data as { error?: string })?.error ||
        "Failed to add medicine";
      throw new Error(msg);
    }
    return data;
  },

  async getMyMedicines(params: MyMedicinesQuery): Promise<Paginated<MedicineRow>> {
    const res = await fetch(
      `${env.NEXT_PUBLIC_BACKEND_URL}/api/medicines/my-medicine${qs(params)}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store", // private seller data
      }
    );

    const data: unknown = await res.json().catch(() => null);
    if (!res.ok) {
      const msg =
        (data as { message?: string })?.message ||
        (data as { error?: string })?.error ||
        "Failed to load your medicines";
      throw new Error(msg);
    }

    return data as Paginated<MedicineRow>;
  },

  async deleteMedicine(medId: string) {
    const res = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/api/medicines/${medId}`, {
      method: "DELETE",
      credentials: "include",
    });

    const data: unknown = await res.json().catch(() => null);
    if (!res.ok) {
      const msg =
        (data as { message?: string })?.message ||
        (data as { error?: string })?.error ||
        "Failed to delete medicine";
      throw new Error(msg);
    }

    return data;
  },
};