"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Pencil, Trash2, RefreshCw, Search } from "lucide-react";

import { adminMedicineService, type MedicineListItem } from "@/services/medicine-admin.service";
import { adminCategoryService, type Category } from "@/services/category-admin.service";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function money(n: number) {
  return `৳ ${Number(n ?? 0).toFixed(2)}`;
}

type EditState = {
  id: string;
  name: string;
  description: string;
  manufacturer: string;
  price: string; // keep as string in input
  stock: string;
  categoryId: string;
  imageUrl: string;
};

export default function AdminMedicinesView() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<MedicineListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [busyId, setBusyId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("all");

  const [edit, setEdit] = useState<EditState | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [cats, meds] = await Promise.all([
        adminCategoryService.getAll().catch(() => [] as Category[]),
        adminMedicineService.list({
          page: 1,
          limit: 20,
          search: search.trim() || undefined,
          categoryId: categoryId === "all" ? undefined : categoryId,
          sortBy: "createdAt",
          sortOrder: "desc",
        }),
      ]);

      setCategories(cats);
      setItems(meds.data ?? []);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to load medicines");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredCount = items.length;

  const openEdit = (m: MedicineListItem) => {
    setEdit({
      id: m.id,
      name: m.name ?? "",
      description: m.description ?? "",
      manufacturer: m.manufacturer ?? "",
      price: String(m.price ?? 0),
      stock: String(m.stock ?? 0),
      categoryId: m.categoryId,
      imageUrl: m.imageUrl ?? "",
    });
  };

  const handleSave = async () => {
    if (!edit) return;

    const price = Number(edit.price);
    const stock = Number(edit.stock);

    if (!edit.name.trim()) return toast.error("Name is required");
    if (!edit.description.trim()) return toast.error("Description is required");
    if (!edit.manufacturer.trim()) return toast.error("Manufacturer is required");
    if (!Number.isFinite(price) || price < 0) return toast.error("Price must be a valid number");
    if (!Number.isFinite(stock) || stock < 0) return toast.error("Stock must be a valid number");
    if (!edit.categoryId) return toast.error("Category is required");

    setBusyId(edit.id);
    try {
      await adminMedicineService.update(edit.id, {
        name: edit.name.trim(),
        description: edit.description.trim(),
        manufacturer: edit.manufacturer.trim(),
        price,
        stock,
        categoryId: edit.categoryId,
        imageUrl: edit.imageUrl.trim() ? edit.imageUrl.trim() : null,
      });

      toast.success("Medicine updated");
      setEdit(null);
      await load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (medId: string) => {
    const ok = window.confirm("Delete this medicine?");
    if (!ok) return;

    setBusyId(medId);
    try {
      await adminMedicineService.remove(medId);
      toast.success("Medicine deleted");
      await load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Manage Medicines</h1>
          <p className="text-sm text-muted-foreground">
            Admin can edit or delete any medicine.
          </p>
        </div>

        <Button variant="outline" className="rounded-xl" onClick={load} disabled={loading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Separator />

      {/* Filters */}
      <Card className="rounded-2xl">
        <CardContent className="p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full items-center gap-2 rounded-xl border border-input bg-background px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
              placeholder="Search by name, manufacturer, price, stock…"
            />
          </div>

          <div className="flex gap-2">
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="w-55 rounded-xl">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button className="rounded-xl" onClick={load}>
              Apply
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg">
            Medicines <span className="text-muted-foreground">({filteredCount})</span>
          </CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-20 rounded-2xl bg-muted/40 animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border bg-muted/10 p-6 text-center">
              <p className="font-semibold">No medicines found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try changing search/category filters.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((m) => (
                <div key={m.id} className="rounded-2xl border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="relative h-20 w-20 overflow-hidden rounded-xl border bg-muted/10">
                        {m.imageUrl ? (
                          <Image
                            src={m.imageUrl}
                            alt={m.name}
                            fill
                            className="object-contain"
                            sizes="80px"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{m.name}</p>
                          <Badge variant="outline" className="rounded-full">
                            {m.category?.name ?? "Uncategorized"}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {m.manufacturer} • Stock:{" "}
                          <span className="font-medium text-foreground">{m.stock}</span>
                        </p>

                        <p className="text-sm">
                          <span className="font-semibold">{money(m.price)}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Dialog open={edit?.id === m.id} onOpenChange={(open) => !open && setEdit(null)}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="rounded-xl" onClick={() => openEdit(m)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl rounded-2xl">
                          <DialogHeader>
                            <DialogTitle>Edit medicine</DialogTitle>
                          </DialogHeader>

                          <div className="grid gap-3 md:grid-cols-2">
                            <div className="md:col-span-2">
                              <label className="text-sm font-semibold">Name</label>
                              <Input
                                className="rounded-xl mt-1"
                                value={edit?.name ?? ""}
                                onChange={(e) => setEdit((p) => (p ? { ...p, name: e.target.value } : p))}
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="text-sm font-semibold">Description</label>
                              <Input
                                className="rounded-xl mt-1"
                                value={edit?.description ?? ""}
                                onChange={(e) =>
                                  setEdit((p) => (p ? { ...p, description: e.target.value } : p))
                                }
                              />
                            </div>

                            <div>
                              <label className="text-sm font-semibold">Manufacturer</label>
                              <Input
                                className="rounded-xl mt-1"
                                value={edit?.manufacturer ?? ""}
                                onChange={(e) =>
                                  setEdit((p) => (p ? { ...p, manufacturer: e.target.value } : p))
                                }
                              />
                            </div>

                            <div>
                              <label className="text-sm font-semibold">Category</label>
                              <Select
                                value={edit?.categoryId ?? ""}
                                onValueChange={(v) =>
                                  setEdit((p) => (p ? { ...p, categoryId: v } : p))
                                }
                              >
                                <SelectTrigger className="rounded-xl mt-1">
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  {categories.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>
                                      {c.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <label className="text-sm font-semibold">Price</label>
                              <Input
                                className="rounded-xl mt-1"
                                value={edit?.price ?? ""}
                                onChange={(e) => setEdit((p) => (p ? { ...p, price: e.target.value } : p))}
                              />
                            </div>

                            <div>
                              <label className="text-sm font-semibold">Stock</label>
                              <Input
                                className="rounded-xl mt-1"
                                value={edit?.stock ?? ""}
                                onChange={(e) => setEdit((p) => (p ? { ...p, stock: e.target.value } : p))}
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="text-sm font-semibold">Image URL (optional)</label>
                              <Input
                                className="rounded-xl mt-1"
                                value={edit?.imageUrl ?? ""}
                                onChange={(e) =>
                                  setEdit((p) => (p ? { ...p, imageUrl: e.target.value } : p))
                                }
                              />
                            </div>
                          </div>

                          <div className="mt-4 flex justify-end gap-2">
                            <Button variant="outline" className="rounded-xl" onClick={() => setEdit(null)}>
                              Cancel
                            </Button>
                            <Button className="rounded-xl" onClick={handleSave} disabled={busyId === m.id}>
                              {busyId === m.id ? "Saving…" : "Save"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="destructive"
                        className="rounded-xl"
                        onClick={() => handleDelete(m.id)}
                        disabled={busyId === m.id}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {busyId === m.id ? "Deleting…" : "Delete"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}