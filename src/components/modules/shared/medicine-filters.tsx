"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category } from "@/types/category";

type SortBy = "createdAt" | "name" | "price" | "manufacturer" | "stock";
type SortOrder = "asc" | "desc";

function withUpdatedParams(
  current: URLSearchParams,
  updates: Record<string, string | null>
) {
  const next = new URLSearchParams(current.toString());
  Object.entries(updates).forEach(([k, v]) => {
    if (v === null || v === "") next.delete(k);
    else next.set(k, v);
  });
  return next;
}

export function MedicineFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const initialSearch = sp.get("search") ?? "";
  const initialCategoryId = sp.get("categoryId") ?? "all";
  const initialSortBy = (sp.get("sortBy") as SortBy) ?? "createdAt";
  const initialSortOrder = (sp.get("sortOrder") as SortOrder) ?? "desc";
  const initialLimit = sp.get("limit") ?? "12";

  const [search, setSearch] = useState(initialSearch);

  // Keep input in sync when user navigates back/forward
  useEffect(() => {
    setSearch(initialSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  // Debounce search -> URL
  useEffect(() => {
    const t = setTimeout(() => {
      const next = withUpdatedParams(sp, {
        search: search.trim() ? search.trim() : null,
        page: "1",
      });
      router.replace(`${pathname}?${next.toString()}`);
    }, 8000);

    return () => clearTimeout(t);
  }, [search, router, pathname, sp]);

  const categoryOptions = useMemo(() => categories ?? [], [categories]);

  const setParam = (key: string, value: string | null) => {
    const next = withUpdatedParams(sp, { [key]: value, page: "1" });
    router.replace(`${pathname}?${next.toString()}`);
  };

  return (
    <div className="grid gap-3 rounded-2xl border bg-card p-4 md:grid-cols-12">
      <div className="md:col-span-5">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, manufacturer, price, or stock…"
          className="rounded-xl"
        />
      </div>

      <div className="md:col-span-3">
        <Select
          value={initialCategoryId}
          onValueChange={(val) => setParam("categoryId", val === "all" ? null : val)}
        >
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categoryOptions.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="md:col-span-2">
        <Select
          value={initialSortBy}
          onValueChange={(val) => setParam("sortBy", val)}
        >
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Newest</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="price">Price</SelectItem>
            <SelectItem value="manufacturer">Manufacturer</SelectItem>
            <SelectItem value="stock">Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="md:col-span-1">
        <Select
          value={initialSortOrder}
          onValueChange={(val) => setParam("sortOrder", val)}
        >
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Desc</SelectItem>
            <SelectItem value="asc">Asc</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="md:col-span-1">
        <Select
          value={initialLimit}
          onValueChange={(val) => setParam("limit", val)}
        >
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="Limit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="6">6</SelectItem>
            <SelectItem value="12">12</SelectItem>
            <SelectItem value="18">18</SelectItem>
            <SelectItem value="24">24</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}