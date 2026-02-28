import { MedicineCard } from "@/components/modules/shared/medicine-card";
import { MedicineFilters } from "@/components/modules/shared/medicine-filters";
import { Pagination } from "@/components/modules/shared/pagination";
import { categoryService } from "@/services/category.service";
import { medicineService } from "@/services/medicine.service";


type SearchParams = Record<string, string | string[] | undefined>;
type SortBy = "createdAt" | "name" | "price" | "manufacturer" | "stock";
type SortOrder = "asc" | "desc";

function getString(sp: SearchParams, key: string) {
  const v = sp[key];
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v[0];
  return undefined;
}

function parsePositiveInt(v: string | undefined, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

function safeSortBy(v: string | undefined): SortBy {
  const allowed: SortBy[] = ["createdAt", "name", "price", "manufacturer", "stock"];
  return allowed.includes(v as SortBy) ? (v as SortBy) : "createdAt";
}

function safeSortOrder(v: string | undefined): SortOrder {
  return v === "asc" || v === "desc" ? v : "desc";
}

export default async function MedicinePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const search = getString(sp, "search");
  const categoryId = getString(sp, "categoryId");
  const sortBy = safeSortBy(getString(sp, "sortBy"));
  const sortOrder = safeSortOrder(getString(sp, "sortOrder"));
  const page = parsePositiveInt(getString(sp, "page"), 1);
  const limit = parsePositiveInt(getString(sp, "limit"), 12);

  const [categoriesRes, medicinesRes] = await Promise.all([
    categoryService.getCategories(),
    medicineService.getMedicines({
      search,
      categoryId,
      sortBy,
      sortOrder,
      page,
      limit,
    }),
  ]);

  const categories = categoriesRes.data ?? [];
  const medicines = medicinesRes.data ?? [];
  const pagination = medicinesRes.pagination;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 md:px-6 space-y-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Browse Medicines</h1>
          <p className="text-sm text-muted-foreground">
            Search, filter, and sort medicines easily.
          </p>
        </div>
      </div>

      <MedicineFilters categories={categories} />

      {medicines.length === 0 ? (
        <div className="rounded-2xl border bg-card p-10 text-center">
          <h2 className="text-lg font-semibold">No medicines found</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a different search or remove filters.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {medicines.map((m) => (
              <MedicineCard key={m.id} medicine={m} />
            ))}
          </div>

          <Pagination page={pagination.page} totalPages={pagination.totalPages} />
        </>
      )}
    </div>
  );
}