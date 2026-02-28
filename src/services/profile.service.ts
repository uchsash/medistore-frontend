import { env } from "@/env";

export type MyProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  phone?: string | null;
  image?: string | null;
};

function pickMsg(json: unknown) {
  const j = json as { message?: string; error?: string; details?: string };
  return j?.message || j?.error || j?.details || "Request failed";
}

export const profileService = {
  async getMe(): Promise<MyProfile> {
    const res = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/api/users/me`, {
      credentials: "include",
      cache: "no-store",
    });

    const json: unknown = await res.json().catch(() => null);
    if (!res.ok) throw new Error(pickMsg(json));

    const maybe = json as { data?: unknown };
    return (maybe?.data ?? json) as MyProfile;
  },

  async updateMe(payload: { name?: string; phone?: string | null; image?: string | null }) {
    const res = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/api/users/me`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const json: unknown = await res.json().catch(() => null);
    if (!res.ok) throw new Error(pickMsg(json));
    return json;
  },
};