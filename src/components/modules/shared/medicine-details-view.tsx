"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Star, ArrowLeft, Package, Factory, Tag } from "lucide-react";

import { medicinePublicService, type MedicineDetails } from "@/services/medicine-public.service";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { addToCart } from "@/lib/cart";
import { authClient } from "@/lib/auth-client";
import { normalizeRole, type UiRole } from "@/lib/roles";
import type { AppSession } from "@/types/auth";

function money(n: number) {
    return `৳ ${Number(n ?? 0).toFixed(2)}`;
}

function stars(avg: number) {
    const full = Math.round(avg);
    return Array.from({ length: 5 }).map((_, i) => (
        <Star
            key={i}
            className={`h-4 w-4 ${i < full ? "fill-primary text-primary" : "text-muted-foreground"}`}
        />
    ));
}

export function MedicineDetailsView({ medId }: { medId: string }) {
    const { data: sessionRaw, isPending: sessionPending } = authClient.useSession();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<MedicineDetails | null>(null);

    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                setLoading(true);
                const d = await medicinePublicService.getById(medId);
                if (!alive) return;
                setData(d);
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
    }, [medId]);

    const avgRating = useMemo(() => {
        if (!data?.reviews?.length) return 0;
        const sum = data.reviews.reduce((a, r) => a + (r.rating ?? 0), 0);
        return sum / data.reviews.length;
    }, [data]);

    if (loading) {
        return (
            <div className="mx-auto w-full max-w-6xl px-4 py-6">
                <div className="h-10 w-44 bg-muted/40 rounded-xl animate-pulse" />
                <div className="mt-6 grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 h-85 bg-muted/40 rounded-2xl animate-pulse" />
                    <div className="h-85 bg-muted/40 rounded-2xl animate-pulse" />
                </div>
                <div className="mt-6 h-56 bg-muted/40 rounded-2xl animate-pulse" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="mx-auto w-full max-w-3xl px-4 py-10 text-center">
                <p className="text-lg font-semibold">Medicine not found</p>
                <p className="text-sm text-muted-foreground mt-1">
                    The medicine may have been removed or the link is invalid.
                </p>
                <Button asChild className="mt-6 rounded-xl">
                    <Link href="/medicine">Back to medicines</Link>
                </Button>
            </div>
        );
    }

    // role verification
    const session = sessionRaw as AppSession | null;
    const isLoggedIn = !!session?.user;
    const uiRole = normalizeRole(session?.user?.role);
    const isCustomer = isLoggedIn && uiRole === "customer";

    return (
        <div className="mx-auto w-full max-w-6xl px-4 py-6">
            <Button asChild variant="ghost" className="rounded-xl">
                <Link href="/medicine" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Link>
            </Button>

            <div className="mt-4 grid gap-6 lg:grid-cols-3">
                {/* Left: main details */}
                <Card className="rounded-2xl lg:col-span-2 overflow-hidden">
                    <CardHeader>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <CardTitle className="text-2xl">{data.name}</CardTitle>

                            <div className="flex items-center gap-3">
                                <Badge className="rounded-full">{money(data.price)}</Badge>
                                {data.stock > 0 ? (
                                    <Badge variant="outline" className="rounded-full">
                                        In stock: {data.stock}
                                    </Badge>
                                ) : (
                                    <Badge variant="destructive" className="rounded-full">
                                        Out of stock
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <span className="inline-flex items-center gap-2">
                                <Factory className="h-4 w-4" /> {data.manufacturer}
                            </span>
                            <span className="text-muted-foreground/40">•</span>
                            <span className="inline-flex items-center gap-2">
                                <Tag className="h-4 w-4" /> {data.category?.name ?? "Uncategorized"}
                            </span>
                            <span className="text-muted-foreground/40">•</span>
                            <span className="inline-flex items-center gap-2">
                                <Package className="h-4 w-4" /> {data._count?.reviews ?? data.reviews.length} reviews
                            </span>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-5">
                        {/* Image */}
                        <div className="relative w-full overflow-hidden rounded-2xl border bg-muted/10 aspect-[16/9]">
                            {data.imageUrl ? (
                                <Image
                                    src={data.imageUrl}
                                    alt={data.name}
                                    fill
                                    className="object-contain"
                                    sizes="(max-width: 1024px) 100vw, 66vw"
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">
                                    No image
                                </div>
                            )}
                        </div>

                        <div>
                            <h3 className="font-semibold">Description</h3>
                            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                                {data.description}
                            </p>
                        </div>

                        <Separator />

                        {/* Actions placeholder */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2">
                                {stars(avgRating)}
                                <span className="text-sm text-muted-foreground">
                                    {avgRating ? avgRating.toFixed(1) : "No ratings yet"}
                                </span>
                            </div>

                            {/* Cart/order */}
                            {sessionPending ? (
                                <Button className="rounded-xl" disabled>
                                    Loading…
                                </Button>
                            ) : !isLoggedIn ? (
                                <Button asChild className="rounded-xl">
                                    <Link href="/login">Login to order</Link>
                                </Button>
                            ) : !isCustomer ? (
                                <div className="flex flex-col items-end gap-1">
                                    <Button className="rounded-xl" disabled>
                                        Add to Cart
                                    </Button>
                                    <p className="text-xs text-muted-foreground">
                                        Please login as a customer to order.
                                    </p>
                                </div>
                            ) : (
                                <Button
                                    className="rounded-xl"
                                    disabled={data.stock <= 0}
                                    onClick={() => {
                                        addToCart(
                                            {
                                                medId: data.id,
                                                name: data.name,
                                                price: data.price,
                                                imageUrl: data.imageUrl ?? null,
                                            },
                                            1
                                        );
                                        toast.success("Added to cart");
                                    }}
                                >
                                    Add to Cart
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Right: reviews */}
                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-lg">Recent Reviews</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {data.reviews.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No reviews yet.</p>
                        ) : (
                            data.reviews.slice(0, 6).map((r) => (
                                <div key={r.id} className="rounded-2xl border p-3">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm font-medium">{r.user?.name ?? "User"}</p>
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`h-3.5 w-3.5 ${i < r.rating ? "fill-primary text-primary" : "text-muted-foreground"
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    {r.comment ? (
                                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                                            {r.comment}
                                        </p>
                                    ) : (
                                        <p className="text-xs text-muted-foreground mt-2">No comment</p>
                                    )}
                                    <p className="text-xs text-muted-foreground mt-2">
                                        {new Date(r.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}