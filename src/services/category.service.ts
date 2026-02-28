import { env } from "@/env";
import type { CategoryListResponse } from "@/types/category";

export const categoryService = {
  async getCategories(): Promise<CategoryListResponse> {
    const res = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/api/categories`, {
      method: "GET",
      next: { revalidate: 60 }
    });

    if (!res.ok) {
      throw new Error("Failed to load categories");
    }

    return res.json();
  },
};