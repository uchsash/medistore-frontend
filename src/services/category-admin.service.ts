import { env } from "@/env";

export type Category = {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    medicines: number;
  };
};

function pickMsg(json: unknown) {
  const j = json as { message?: string; error?: string; details?: string };
  return j?.message || j?.error || j?.details || "Request failed";
}

export const adminCategoryService = {
  async getAll(): Promise<Category[]> {
    const res = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/api/categories`, {
      credentials: "include",
      cache: "no-store",
    });
    const json: unknown = await res.json().catch(() => null);
    if (!res.ok) throw new Error(pickMsg(json));

    const maybe = json as { data?: unknown };
    return (maybe?.data ?? json) as Category[];
  },

  // Optional if backend exists:
  async create(name: string) {
    const res = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/api/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name }),
    });
    const json: unknown = await res.json().catch(() => null);
    if (!res.ok) throw new Error(pickMsg(json));
    return json;
  },

  async update(catId: string, name: string) {
    const res = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/api/categories/${catId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name }),
    });
    const json: unknown = await res.json().catch(() => null);
    if (!res.ok) throw new Error(pickMsg(json));
    return json;
  },

  async remove(catId: string) {
    const res = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/api/categories/${catId}`, {
      method: "DELETE",
      credentials: "include",
    });
    const json: unknown = await res.json().catch(() => null);
    if (!res.ok) throw new Error(pickMsg(json));
    return json;
  },
};