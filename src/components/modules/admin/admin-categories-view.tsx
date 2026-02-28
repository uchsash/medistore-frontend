"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, RefreshCw } from "lucide-react";

import { adminCategoryService, type Category } from "@/services/category-admin.service";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AdminCategoriesView() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Category[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [createName, setCreateName] = useState("");
  const [edit, setEdit] = useState<{ id: string; name: string } | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await adminCategoryService.getAll();
      setItems(data);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const total = items.length;
  const withMedicines = useMemo(
    () => items.filter((c) => (c._count?.medicines ?? 0) > 0).length,
    [items]
  );

  const handleCreate = async () => {
    const name = createName.trim();
    if (!name) return toast.error("Category name is required");

    setBusyId("create");
    try {
      await adminCategoryService.create(name);
      toast.success("Category created");
      setCreateName("");
      await load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Create failed");
    } finally {
      setBusyId(null);
    }
  };

  const handleUpdate = async () => {
    if (!edit) return;
    const name = edit.name.trim();
    if (!name) return toast.error("Category name is required");

    setBusyId(edit.id);
    try {
      await adminCategoryService.update(edit.id, name);
      toast.success("Category updated");
      setEdit(null);
      await load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (catId: string) => {
    const ok = window.confirm("Delete this category?");
    if (!ok) return;

    setBusyId(catId);
    try {
      await adminCategoryService.remove(catId);
      toast.success("Category deleted");
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
          <h1 className="text-2xl font-semibold tracking-tight">Manage Categories</h1>
          <p className="text-sm text-muted-foreground">
            Create, edit, and delete categories (admin).
          </p>
        </div>

        <Button variant="outline" className="rounded-xl" onClick={load} disabled={loading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Separator />

      {/* Summary + Create */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total categories</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-extrabold">{total}</CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">With medicines</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-extrabold">{withMedicines}</CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm">Create category</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Input
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder="e.g. Antibiotics"
              className="rounded-xl"
            />
            <Button className="rounded-xl" onClick={handleCreate} disabled={busyId === "create"}>
              <Plus className="mr-2 h-4 w-4" />
              {busyId === "create" ? "Creating…" : "Create"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* List */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg">All categories</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-14 rounded-2xl bg-muted/40 animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border bg-muted/10 p-6 text-center">
              <p className="font-semibold">No categories found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create your first category above.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((c) => (
                <div key={c.id} className="rounded-2xl border p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Medicines: <span className="font-medium text-foreground">{c._count?.medicines ?? 0}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Dialog open={edit?.id === c.id} onOpenChange={(open) => !open && setEdit(null)}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="rounded-xl"
                          onClick={() => setEdit({ id: c.id, name: c.name })}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="rounded-2xl">
                        <DialogHeader>
                          <DialogTitle>Edit category</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-3">
                          <Input
                            value={edit?.name ?? ""}
                            onChange={(e) =>
                              setEdit((p) => (p ? { ...p, name: e.target.value } : p))
                            }
                            className="rounded-xl"
                          />
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" className="rounded-xl" onClick={() => setEdit(null)}>
                              Cancel
                            </Button>
                            <Button className="rounded-xl" onClick={handleUpdate} disabled={busyId === c.id}>
                              {busyId === c.id ? "Saving…" : "Save"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="destructive"
                      className="rounded-xl"
                      onClick={() => handleDelete(c.id)}
                      disabled={busyId === c.id}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {busyId === c.id ? "Deleting…" : "Delete"}
                    </Button>
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