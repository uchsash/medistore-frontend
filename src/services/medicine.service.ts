import { env } from "@/env";
import type { MedicinesResponse } from "@/types/medicine";

export type MedicineQueryParams = {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "name" | "price" | "manufacturer" | "stock";
  sortOrder?: "asc" | "desc";
  categoryId?: string;
  sellerId?: string;
};

function toQueryString(params: MedicineQueryParams) {
  const sp = new URLSearchParams();

  if (params.search) sp.set("search", params.search);
  if (params.page) sp.set("page", String(params.page));
  if (params.limit) sp.set("limit", String(params.limit));
  if (params.sortBy) sp.set("sortBy", params.sortBy);
  if (params.sortOrder) sp.set("sortOrder", params.sortOrder);
  if (params.categoryId) sp.set("categoryId", params.categoryId);
  if (params.sellerId) sp.set("sellerId", params.sellerId);

  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

export const medicineService = {
  async getMedicines(params: MedicineQueryParams): Promise<MedicinesResponse> {
    const url = `${env.NEXT_PUBLIC_BACKEND_URL}/api/medicines${toQueryString(params)}`;

    const res = await fetch(url, {
      method: "GET",
      next: { revalidate: 30 }
    });

    if (!res.ok) {
      throw new Error("Failed to load medicines");
    }

    return res.json();
  },
};


