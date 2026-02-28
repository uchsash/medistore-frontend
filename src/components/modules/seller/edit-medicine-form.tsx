"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { sellerMedicineService } from "@/services/seller-medicine.service";
import { categoryService } from "@/services/category.service";
import type { Category } from "@/types/category";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const editMedicineSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  manufacturer: z.string().min(2, { message: "Manufacturer must be at least 2 characters." }),

  price: z.string().min(1, { message: "Price is required." }),
  stock: z.string().min(1, { message: "Stock is required." }),

  categoryId: z.string().min(1, { message: "Category is required." }),
  imageUrl: z.string().optional(),
});

type EditMedicineValues = z.infer<typeof editMedicineSchema>;

function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function EditMedicineForm({ medId }: { medId: string }) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const form = useForm<EditMedicineValues>({
    resolver: zodResolver(editMedicineSchema),
    defaultValues: {
      name: "",
      description: "",
      manufacturer: "",
      price: "",
      stock: "",
      categoryId: "",
      imageUrl: "",
    },
  });

  const catEmpty = useMemo(() => !loading && categories.length === 0, [loading, categories]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);

        const [med, cats] = await Promise.all([
          sellerMedicineService.getMedicineById(medId),
          categoryService.getCategories(),
        ]);

        if (!alive) return;

        setCategories(cats.data ?? []);

        form.reset({
          name: med.name ?? "",
          description: med.description ?? "",
          manufacturer: med.manufacturer ?? "",
          price: String(med.price ?? ""),
          stock: String(med.stock ?? ""),
          categoryId: med.categoryId ?? "",
          imageUrl: med.imageUrl ?? "",
        });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed to load medicine";
        toast.error(msg);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medId]);

  async function onSubmit(values: EditMedicineValues) {
    const priceNum = Number(values.price);
    const stockNum = Number(values.stock);

    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      toast.error("Price must be a valid number greater than 0.");
      return;
    }
    if (!Number.isFinite(stockNum) || stockNum < 0 || !Number.isInteger(stockNum)) {
      toast.error("Stock must be a valid non-negative integer.");
      return;
    }

    const image = (values.imageUrl ?? "").trim();
    if (image && !isValidUrl(image)) {
      toast.error("Image URL must be a valid URL.");
      return;
    }

    try {
      await sellerMedicineService.updateMedicine(medId, {
        name: values.name.trim(),
        description: values.description.trim(),
        manufacturer: values.manufacturer.trim(),
        price: priceNum,
        stock: stockNum,
        categoryId: values.categoryId,
        ...(image ? { imageUrl: image } : { imageUrl: "" }),
      });

      toast.success("Medicine updated successfully!");
      router.push("/dashboard/my-medicine");
      router.refresh();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Update failed";
      toast.error(msg);
    }
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Edit Medicine</CardTitle>
        <CardDescription>Update medicine info, price, and stock.</CardDescription>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <div className="h-10 w-full rounded-xl bg-muted/40 animate-pulse" />
            <div className="h-28 w-full rounded-xl bg-muted/40 animate-pulse" />
            <div className="grid gap-3 md:grid-cols-2">
              <div className="h-10 w-full rounded-xl bg-muted/40 animate-pulse" />
              <div className="h-10 w-full rounded-xl bg-muted/40 animate-pulse" />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="h-10 w-full rounded-xl bg-muted/40 animate-pulse" />
              <div className="h-10 w-full rounded-xl bg-muted/40 animate-pulse" />
            </div>
            <div className="h-10 w-full rounded-xl bg-muted/40 animate-pulse" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medicine Name</FormLabel>
                    <FormControl>
                      <Input className="rounded-xl" placeholder="e.g. Napa 500mg" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea className="rounded-xl min-h-27.5" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="manufacturer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Manufacturer</FormLabel>
                      <FormControl>
                        <Input className="rounded-xl" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange} disabled={catEmpty}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {catEmpty && (
                        <p className="text-xs text-muted-foreground mt-1">
                          No categories found. Ask admin to create categories first.
                        </p>
                      )}

                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (৳)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" className="rounded-xl" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock</FormLabel>
                      <FormControl>
                        <Input type="number" className="rounded-xl" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL (optional)</FormLabel>
                    <FormControl>
                      <Input className="rounded-xl" placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => router.push("/dashboard/my-medicine")}
                >
                  Cancel
                </Button>

                <Button type="submit" className="rounded-xl" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Saving…" : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}