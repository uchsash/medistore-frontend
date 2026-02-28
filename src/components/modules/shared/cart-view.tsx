"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Minus, Plus, Trash2, ArrowLeft, ShoppingCart } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { normalizeRole } from "@/lib/roles";
import { getCartItems, setItemQuantity, removeFromCart, clearCart, type CartItem } from "@/lib/cart";
import { orderService } from "@/services/order.service";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { AppSession } from "@/types/auth";

function money(n: number) {
  return `৳ ${Number(n ?? 0).toFixed(2)}`;
}

export default function CartView() {
    const { data: sessionRaw, isPending: sessionPending } = authClient.useSession();
  const [items, setItems] = useState<CartItem[]>([]);
  const [shippingAddress, setShippingAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);

    const session = sessionRaw as AppSession | null;
    const isLoggedIn = !!session?.user;
    const uiRole = normalizeRole(session?.user?.role);
    const isCustomer = isLoggedIn && uiRole === "customer";

  // load cart on mount + whenever it changes (via custom event)
  useEffect(() => {
    const load = () => setItems(getCartItems());
    load();

    const onCart = () => load();
    window.addEventListener("medistore:cart", onCart);

    return () => window.removeEventListener("medistore:cart", onCart);
  }, []);

  const totals = useMemo(() => {
    const totalQty = items.reduce((s, it) => s + it.quantity, 0);
    const totalAmount = items.reduce((s, it) => s + it.quantity * it.price, 0);
    return { totalQty, totalAmount };
  }, [items]);

  const updateQty = (medId: string, nextQty: number) => {
    if (nextQty < 1) return;
    setItemQuantity(medId, nextQty);
    setItems(getCartItems());
  };

  const onRemove = (medId: string) => {
    removeFromCart(medId);
    setItems(getCartItems());
    toast.success("Removed from cart");
  };

  const onClear = () => {
    clearCart();
    setItems([]);
    toast.success("Cart cleared");
  };

  const handleCheckout = async () => {
    if (!items.length) return toast.error("Your cart is empty");
    if (!shippingAddress.trim()) return toast.error("Shipping address is required");

    if (!isLoggedIn) return toast.error("Please login to place order");
    if (!isCustomer) return toast.error("Please login as a customer to place order");

    setSubmitting(true);
    try {
      const payload = {
        shippingAddress: shippingAddress.trim(),
        items: items.map((i) => ({ medicineId: i.medId, quantity: i.quantity })),
      };

      await orderService.createOrder(payload);
      toast.success("Order placed successfully!");

      clearCart();
      setItems([]);
      setShippingAddress("");
    //   router.push("/dashboard/my-orders");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Order failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="flex items-center justify-between gap-3">
        <Button asChild variant="ghost" className="rounded-xl">
          <Link href="/medicine" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Continue shopping
          </Link>
        </Button>

        {items.length > 0 && (
          <Button variant="outline" className="rounded-xl" onClick={onClear}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear cart
          </Button>
        )}
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-3">
        {/* Items */}
        <Card className="rounded-2xl lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Cart
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {items.length === 0 ? (
              <div className="rounded-2xl border bg-muted/10 p-6 text-center">
                <p className="font-semibold">Your cart is empty</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add some medicines to place an order.
                </p>
                <Button asChild className="mt-4 rounded-xl">
                  <Link href="/medicine">Browse medicines</Link>
                </Button>
              </div>
            ) : (
              items.map((it) => (
                <div key={it.medId} className="rounded-2xl border p-4">
                  <div className="flex gap-4">
                    <div className="relative h-20 w-20 overflow-hidden rounded-xl border bg-muted/10">
                      {it.imageUrl ? (
                        <Image
                          src={it.imageUrl}
                          alt={it.name}
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

                    <div className="flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold">{it.name}</p>
                          <p className="text-sm text-muted-foreground">{money(it.price)}</p>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-xl text-destructive hover:text-destructive"
                          onClick={() => onRemove(it.medId)}
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                        {/* qty controls */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-xl"
                            onClick={() => updateQty(it.medId, it.quantity - 1)}
                            disabled={it.quantity <= 1}
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>

                          <div className="min-w-10 text-center font-semibold">{it.quantity}</div>

                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-xl"
                            onClick={() => updateQty(it.medId, it.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <p className="font-semibold">
                          {money(it.price * it.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Summary + address */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Items</span>
                <span className="font-medium">{totals.totalQty}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">{money(totals.totalAmount)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-lg font-extrabold">{money(totals.totalAmount)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold">Shipping Address</p>
              <Textarea
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="House, Road, Area, City, District…"
                className="min-h-[110px] rounded-2xl"
              />
            </div>

            {/* auth hint */}
            {!sessionPending && !isLoggedIn && (
              <p className="text-xs text-muted-foreground">
                Please login to place an order.
              </p>
            )}
            {!sessionPending && isLoggedIn && !isCustomer && (
              <p className="text-xs text-muted-foreground">
                You are logged in as <span className="font-semibold">{uiRole}</span>. Only customers can place orders.
              </p>
            )}

            <Button
              className="w-full rounded-xl"
              disabled={
                submitting ||
                items.length === 0 ||
                sessionPending ||
                !isLoggedIn ||
                !isCustomer
              }
              onClick={handleCheckout}
            >
              {submitting ? "Placing order…" : "Checkout"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}