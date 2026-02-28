import { env } from "@/env";

export type ReviewStatus = "PUBLISHED" | "UNPUBLISHED";

export type AdminReview = {
  id: string;
  rating: number;
  comment?: string | null;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
  userId: string;
  medicineId: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  medicine?: {
    id: string;
    name: string;
  };
};

function pickMsg(json: unknown) {
  const j = json as { message?: string; error?: string; details?: string };
  return j?.message || j?.error || j?.details || "Request failed";
}

export const adminReviewService = {
  async getAll(): Promise<AdminReview[]> {
    const res = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/api/reviews`, {
      credentials: "include",
      cache: "no-store",
    });

    const json: unknown = await res.json().catch(() => null);
    if (!res.ok) throw new Error(pickMsg(json));

    const maybe = json as { data?: unknown };
    return (maybe?.data ?? json) as AdminReview[];
  },

  async updateStatus(reviewId: string, newStatus: ReviewStatus) {
    const res = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/api/reviews/${reviewId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ newStatus }),
    });

    const json: unknown = await res.json().catch(() => null);
    if (!res.ok) throw new Error(pickMsg(json));
    return json;
  },

  async remove(reviewId: string) {
    const res = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/api/reviews/${reviewId}`, {
      method: "DELETE",
      credentials: "include",
    });

    const json: unknown = await res.json().catch(() => null);
    if (!res.ok) throw new Error(pickMsg(json));
    return json;
  },
};