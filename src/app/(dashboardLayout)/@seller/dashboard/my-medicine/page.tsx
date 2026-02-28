import { MyMedicinesTable } from "@/components/modules/seller/my-medicines-table";

type SearchParams = Record<string, string | string[] | undefined>;
type SortBy = "createdAt" | "name" | "price" | "manufacturer" | "stock";
type SortOrder = "asc" | "desc";

function getStr(sp: SearchParams, key: string) {
  const v = sp[key];
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v[0];
  return undefined;
}

function getNum(sp: SearchParams, key: string, fallback: number) {
  const s = getStr(sp, key);
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

function isSortBy(v: string | undefined): v is SortBy {
  return (
    v === "createdAt" ||
    v === "name" ||
    v === "price" ||
    v === "manufacturer" ||
    v === "stock"
  );
}

function isSortOrder(v: string | undefined): v is SortOrder {
  return v === "asc" || v === "desc";
}

export default async function MyMedicinesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const sortByRaw = getStr(sp, "sortBy");
  const sortOrderRaw = getStr(sp, "sortOrder");

  const sortBy: SortBy = isSortBy(sortByRaw) ? sortByRaw : "createdAt";
  const sortOrder: SortOrder = isSortOrder(sortOrderRaw) ? sortOrderRaw : "desc";

  return (
    <MyMedicinesTable
      initial={{
        search: getStr(sp, "search") ?? "",
        page: getNum(sp, "page", 1),
        limit: getNum(sp, "limit", 10),
        sortBy,
        sortOrder,
      }}
    />
  );
}