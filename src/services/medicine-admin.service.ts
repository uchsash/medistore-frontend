import { env } from "@/env";

export type MedicineListItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  manufacturer: string;
  stock: number;
  imageUrl?: string | null;
  categoryId: string;
  category?: { name?: string };
  sellerId: string;
  createdAt?: string;
  updatedAt?: string;
};

export type MedicineListResponse = {
  data: MedicineListItem[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

function pickMsg(json: unknown) {
  const j = json as { message?: string; error?: string; details?: string };
  return j?.message || j?.error || j?.details || "Request failed";
}

export const adminMedicineService = {
  async list(params: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    categoryId?: string;
    sellerId?: string;
  }): Promise<MedicineListResponse> {
    const sp = new URLSearchParams();
    if (params.page) sp.set("page", String(params.page));
    if (params.limit) sp.set("limit", String(params.limit));
    if (params.search) sp.set("search", params.search);
    if (params.sortBy) sp.set("sortBy", params.sortBy);
    if (params.sortOrder) sp.set("sortOrder", params.sortOrder);
    if (params.categoryId) sp.set("categoryId", params.categoryId);
    if (params.sellerId) sp.set("sellerId", params.sellerId);

    const res = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/api/medicines?${sp.toString()}`, {
      credentials: "include",
      cache: "no-store",
    });

    const json: unknown = await res.json().catch(() => null);
    if (!res.ok) throw new Error(pickMsg(json));
    return json as MedicineListResponse;
  },

  async update(medId: string, updateData: Partial<Omit<MedicineListItem, "id" | "sellerId" | "createdAt" | "updatedAt" | "category">>) {
    const res = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/api/medicines/${medId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(updateData),
    });

    const json: unknown = await res.json().catch(() => null);
    if (!res.ok) throw new Error(pickMsg(json));
    return json;
  },

  async remove(medId: string) {
    const res = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/api/medicines/${medId}`, {
      method: "DELETE",
      credentials: "include",
    });

    const json: unknown = await res.json().catch(() => null);
    if (!res.ok) throw new Error(pickMsg(json));
    return json;
  },
};