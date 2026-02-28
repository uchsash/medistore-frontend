import { env } from "@/env";

export type MedicineReview = {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  user: { name: string };
};

export type MedicineDetails = {
  id: string;
  name: string;
  description: string;
  price: number;
  manufacturer: string;
  stock: number;
  imageUrl?: string | null;

  categoryId: string;
  category?: { id: string; name: string };

  reviews: MedicineReview[];
  _count?: { reviews: number };
};

export const medicinePublicService = {
  async getById(medId: string): Promise<MedicineDetails> {
    const res = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/api/medicines/${medId}`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    const payload: unknown = await res.json().catch(() => null);

    if (!res.ok) {
      const msg =
        (payload as { message?: string })?.message ||
        (payload as { error?: string })?.error ||
        "Failed to load medicine";
      throw new Error(msg);
    }

    const wrapped = payload as { data?: MedicineDetails };
    if (!wrapped?.data) throw new Error("Invalid response from server");
    return wrapped.data;
  },
};