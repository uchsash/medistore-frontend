import { env } from "@/env";

export type CreateReviewPayload = {
  medicineId: string;
  rating: number;
  comment?: string;
};

function pickMsg(json: unknown) {
  const j = json as { message?: string; error?: string; details?: string };
  return j?.message || j?.error || j?.details || "Request failed";
}

export const reviewService = {
  async create(payload: CreateReviewPayload) {
    const res = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/api/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const json: unknown = await res.json().catch(() => null);
    if (!res.ok) throw new Error(pickMsg(json));
    return json;
  },
};