"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { sellerMedicineService, type MedicineRow } from "@/services/seller-medicine.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type SortBy = "createdAt" | "name" | "price" | "manufacturer" | "stock";
type SortOrder = "asc" | "desc";

function avgRating(reviews?: { rating: number }[]) {
  if (!reviews || reviews.length === 0) return null;
  const sum = reviews.reduce((a, r) => a + (r.rating || 0), 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

export function MyMedicinesTable({
  initial,
}: {
  initial: {
    search: string;
    page: number;
    limit: number;
    sortBy: SortBy;
    sortOrder: SortOrder;
  };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [isPendingNav, startTransition] = useTransition();

  const [rows, setRows] = useState<MedicineRow[]>([]);
  const [pagination, setPagination] = useState<{ page: number; totalPages: number; total: number; limit: number }>({
    page: initial.page,
    totalPages: 1,
    total: 0,
    limit: initial.limit,
  });

  const [search, setSearch] = useState(initial.search);
  const [sortBy, setSortBy] = useState<SortBy>(initial.sortBy ?? "createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>(initial.sortOrder ?? "desc");
  const [loading, setLoading] = useState(true);

  const [confirmId, setConfirmId] = useState<string | null>(null);
  const confirmItem = useMemo(() => rows.find((r) => r.id === confirmId) ?? null, [rows, confirmId]);

  function setParam(key: string, value?: string) {
    const next = new URLSearchParams(sp?.toString());
    if (!value) next.delete(key);
    else next.set(key, value);
    // always reset to page 1 when changing filters/sort/search
    if (key !== "page") next.set("page", "1");
    startTransition(() => router.replace(`${pathname}?${next.toString()}`));
  }

  function setPage(n: number) {
    const next = new URLSearchParams(sp?.toString());
    next.set("page", String(n));
    startTransition(() => router.replace(`${pathname}?${next.toString()}`));
  }

  
  useEffect(() => {
    const t = setTimeout(() => {
      setParam("search", search.trim() ? search.trim() : undefined);
    }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Load data whenever URL params change
  useEffect(() => {
    let alive = true;

    const page = Number(sp.get("page") ?? initial.page);
    const limit = Number(sp.get("limit") ?? initial.limit);
    const s = sp.get("search") ?? initial.search;
    const sb = (sp.get("sortBy") as SortBy) ?? initial.sortBy;
    const so = (sp.get("sortOrder") as SortOrder) ?? initial.sortOrder;

    (async () => {
      try {
        setLoading(true);
        const res = await sellerMedicineService.getMyMedicines({
          page,
          limit,
          search: s || undefined,
          sortBy: sb,
          sortOrder: so,
        });

        if (!alive) return;
        setRows(res.data ?? []);
        setPagination({
          page: res.pagination.page,
          totalPages: res.pagination.totalPages,
          total: res.pagination.total,
          limit: res.pagination.limit,
        });
        setSortBy(sb);
        setSortOrder(so);
      } catch (e: unknown) {
        if (!alive) return;
        const msg = e instanceof Error ? e.message : "Failed to load";
        toast.error(msg);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp?.toString()]);

const handleDelete = async () => {
  if (!confirmId) return;

  const deletingId = confirmId;

  
  const currentPage = pagination.page;
  const itemsOnThisPage = rows.length;

  try {
    await sellerMedicineService.deleteMedicine(deletingId);

    toast.success("Medicine deleted");
    setConfirmId(null);

    setRows((prev) => prev.filter((r) => r.id !== deletingId));
    setPagination((p) => ({ ...p, total: Math.max(0, p.total - 1) }));


    if (currentPage > 1 && itemsOnThisPage === 1) {
      setPage(currentPage - 1); 
      return;
    }
    startTransition(() => router.replace(`${pathname}?${sp.toString()}`));
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Delete failed";
    toast.error(msg);
  }
};

  return (
    <Card className="rounded-2xl">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>My Medicines</CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage your listed medicines (edit, delete, stock).
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or manufacturer…"
            className="md:w-72 rounded-xl"
          />

          <Button asChild className="rounded-xl">
            <Link href="/dashboard/add-medicine">Add Medicine</Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
          <div className="text-sm text-muted-foreground">
            Total: <span className="font-medium text-foreground">{pagination.total}</span>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setParam("sortBy", "createdAt")}
            >
              Sort: Date
            </Button>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setParam("sortBy", "price")}
            >
              Sort: Price
            </Button>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setParam("sortOrder", sortOrder === "asc" ? "desc" : "asc")}
            >
              {sortOrder === "asc" ? "Asc" : "Desc"}
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="hidden md:table-cell">Stock</TableHead>
                <TableHead className="hidden lg:table-cell">Rating</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <div className="h-10 w-full bg-muted/40 rounded-xl animate-pulse" />
                    </TableCell>
                  </TableRow>
                ))
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <div className="py-10 text-center">
                      <p className="font-medium">No medicines found</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Try another search or add your first medicine.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((m) => {
                  const rating = avgRating(m.reviews);
                  return (
                    <TableRow key={m.id}>
                      <TableCell>
                        <div className="font-medium">{m.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {m.manufacturer}
                        </div>
                      </TableCell>

                      <TableCell className="hidden md:table-cell">
                        {m.category?.name ? (
                          <div className="font-medium">{m.category.name}</div>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>

                      <TableCell>৳ {m.price}</TableCell>

                      <TableCell className="hidden md:table-cell">
                        {m.stock > 0 ? (
                          <Badge className="rounded-full">In stock: {m.stock}</Badge>
                        ) : (
                          <Badge variant="destructive" className="rounded-full">
                            Out of stock
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="hidden lg:table-cell">
                        {rating ? (
                          <span className="text-sm font-medium">{rating} ⭐</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-xl">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/my-medicine/${m.id}/edit`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setConfirmId(m.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page <span className="font-medium text-foreground">{pagination.page}</span> of{" "}
            <span className="font-medium text-foreground">{pagination.totalPages}</span>
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setPage(Math.max(1, pagination.page - 1))}
              disabled={pagination.page <= 1 || isPendingNav}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setPage(Math.min(pagination.totalPages, pagination.page + 1))}
              disabled={pagination.page >= pagination.totalPages || isPendingNav}
            >
              Next
            </Button>
          </div>
        </div>

        {/* Delete confirmation */}
        <AlertDialog open={!!confirmId} onOpenChange={(o) => !o && setConfirmId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete medicine?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete{" "}
                <span className="font-medium">{confirmItem?.name ?? "this medicine"}</span>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
              <AlertDialogAction className="rounded-xl" onClick={handleDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}