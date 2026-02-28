"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { addMedicineSchema, type AddMedicineValues } from "@/validation/medicine.schema";
import { categoryService } from "@/services/category.service";
import { sellerMedicineService } from "@/services/seller-medicine.service";
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

function isValidUrl(url: string) {
    try {
        // will throw for invalid
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

export function AddMedicineForm() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCats, setLoadingCats] = useState(true);

    const form = useForm<AddMedicineValues>({
        resolver: zodResolver(addMedicineSchema),
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

    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                setLoadingCats(true);
                const res = await categoryService.getCategories();
                if (!alive) return;
                setCategories(res.data ?? []);
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : "Failed to load categories";
                toast.error(msg);
            } finally {
                if (alive) setLoadingCats(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, []);

    const catEmpty = useMemo(
        () => !loadingCats && categories.length === 0,
        [loadingCats, categories]
    );

    async function onSubmit(values: AddMedicineValues) {
        // Convert and validate numbers here (stable + no resolver mismatch)
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
            const payload = {
                name: values.name.trim(),
                description: values.description.trim(),
                manufacturer: values.manufacturer.trim(),
                categoryId: values.categoryId,
                price: priceNum,
                stock: stockNum,
                ...(image ? { imageUrl: image } : {}),
            };

            await sellerMedicineService.createMedicine(payload);

            toast.success("Medicine added successfully!");
            form.reset();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to add medicine";
            toast.error(msg);
        }
    }

    return (
        <Card className="rounded-2xl">
            <CardHeader>
                <CardTitle>Add Medicine</CardTitle>
                <CardDescription>
                    Add a new medicine to your shop. Category is required.
                </CardDescription>
            </CardHeader>

            <CardContent>
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
                                        <Textarea
                                            className="rounded-xl min-h-27.5"
                                            placeholder="Write a helpful description…"
                                            {...field}
                                        />
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
                                            <Input className="rounded-xl" placeholder="e.g. Beximco" {...field} />
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
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            disabled={loadingCats || catEmpty}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="rounded-xl">
                                                    <SelectValue
                                                        placeholder={loadingCats ? "Loading…" : "Select a category"}
                                                    />
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
                                onClick={() => form.reset()}
                                disabled={form.formState.isSubmitting}
                            >
                                Reset
                            </Button>

                            <Button type="submit" className="rounded-xl" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? "Adding…" : "Add Medicine"}
                            </Button>
                        </div>
                    </form>
                </Form>

                <p className="mt-4 text-xs text-muted-foreground">
                    Need categories? <Link className="underline" href="/dashboard/admin/categories">Ask admin</Link>.
                </p>
            </CardContent>
        </Card>
    );
}