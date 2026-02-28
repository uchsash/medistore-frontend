import { env } from "@/env";

export type UserStatus = "ACTIVE" | "BANNED";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string; // backend returns "CUSTOMER" | "SELLER" | "ADMIN" (string in DB)
  status: UserStatus;
  createdAt: string;
};

function pickMsg(json: unknown) {
  const j = json as { message?: string; error?: string; details?: string };
  return j?.message || j?.error || j?.details || "Request failed";
}

export const adminUserService = {
  async getAll(): Promise<AdminUser[]> {
    const res = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/api/users/admin/users`, {
      credentials: "include",
      cache: "no-store",
    });

    const json: unknown = await res.json().catch(() => null);
    if (!res.ok) throw new Error(pickMsg(json));

    const maybe = json as { data?: unknown };
    return (maybe?.data ?? json) as AdminUser[];
  },

  async updateStatus(userId: string, status: UserStatus) {
    const res = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/api/users/admin/users/${userId}`, {
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