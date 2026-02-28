"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Eye, XCircle, Package, CalendarClock } from "lucide-react";

import { customerOrderService, type MyOrder, type OrderStatus } from "@/services/order-customer.service";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function money(n: number) {
  return `৳ ${Number(n ?? 0).toFixed(2)}`;
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function statusBadgeVariant(status: OrderStatus): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "PENDING":
      return "secondary";
    case "SHIPPED":
      return "default";
    case "DELIVERED":
      return "outline";
    case "CANCELLED":
      return "destructive";
    default:
      return "secondary";
  }
}

function canCancel(status: OrderStatus) {
  return status === "PENDING";
}

export default function MyOrdersView() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await customerOrderService.getMyOrders();
      setOrders(data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to load orders";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const totalOrders = orders.length;

  const summary = useMemo(() => {
    const pending = orders.filter((o) => o.status === "PENDING").length;
    const shipped = orders.filter((o) => o.status === "SHIPPED").length;
    const delivered = orders.filter((o) => o.status === "DELIVERED").length;
    const cancelled = orders.filter((o) => o.status === "CANCELLED").length;
    return { pending, shipped, delivered, cancelled };
  }, [orders]);

  const handleCancel = async (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    if (!canCancel(order.status)) {
      toast.error("This order cannot be cancelled.");
      return;
    }

    const ok = window.confirm("Are you sure you want to cancel this order?");
    if (!ok) return;

    setBusyId(orderId);
    try {
      await customerOrderService.cancelOrder(orderId);
      toast.success("Order cancelled");

      // refresh list
      await load();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Cancel failed";
      toast.error(msg);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Orders</h1>
          <p className="text-sm text-muted-foreground">
            View your orders and cancel if needed (customers can only cancel).
          </p>
        </div>

        <Button variant="outline" className="rounded-xl" onClick={load} disabled={loading}>
          Refresh
        </Button>
      </div>

      <Separator />

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-extrabold">{totalOrders}</CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-extrabold">{summary.pending}</CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Shipped</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-extrabold">{summary.shipped}</CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Delivered</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-extrabold">{summary.delivered}</CardContent>
        </Card>
      </div>

      {/* Orders list */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg">Order History</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 rounded-2xl bg-muted/40 animate-pulse" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-2xl border bg-muted/10 p-6 text-center">
              <p className="font-semibold">No orders yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Place an order from the cart to see it here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => {
                const itemsCount = o.items?.reduce((s, it) => s + (it.quantity ?? 0), 0) ?? 0;

                return (
                  <div key={o.id} className="rounded-2xl border p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={statusBadgeVariant(o.status)} className="rounded-full">
                            {o.status}
                          </Badge>

                          <span className="text-sm text-muted-foreground inline-flex items-center gap-2">
                            <CalendarClock className="h-4 w-4" />
                            {fmtDate(o.createdAt)}
                          </span>
                        </div>

                        <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Items: <span className="font-medium text-foreground">{itemsCount}</span>
                          </span>
                          <span className="text-muted-foreground/40">•</span>
                          <span>
                            Total: <span className="font-semibold text-foreground">{money(o.totalAmount)}</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Details modal */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="rounded-xl">
                              <Eye className="mr-2 h-4 w-4" />
                              Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-2xl rounded-2xl">
                            <DialogHeader>
                              <DialogTitle>Order Details</DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge variant={statusBadgeVariant(o.status)} className="rounded-full">
                                  {o.status}
                                </Badge>
                                <span className="text-sm text-muted-foreground">{fmtDate(o.createdAt)}</span>
                              </div>

                              <div className="rounded-2xl border p-4">
                                <p className="text-sm font-semibold">Shipping Address</p>
                                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                                  {o.shippingAddress}
                                </p>
                              </div>

                              <div className="rounded-2xl border p-4">
                                <p className="text-sm font-semibold">Items</p>
                                <div className="mt-3 space-y-2">
                                  {o.items.map((it) => (
                                    <div key={it.id} className="flex items-start justify-between gap-3 rounded-xl bg-muted/10 p-3">
                                      <div>
                                        <p className="text-sm font-medium">
                                          {it.medicine?.name ?? it.medicineId}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {it.medicine?.manufacturer ? `by ${it.medicine.manufacturer}` : ""}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                          Qty: <span className="font-medium text-foreground">{it.quantity}</span>
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-sm font-semibold">{money(it.price * it.quantity)}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {money(it.price)} each
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                <Separator className="my-4" />

                                <div className="flex items-center justify-between">
                                  <span className="font-semibold">Total</span>
                                  <span className="text-lg font-extrabold">{money(o.totalAmount)}</span>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {/* Cancel */}
                        <Button
                          variant="destructive"
                          className="rounded-xl"
                          disabled={!canCancel(o.status) || busyId === o.id}
                          onClick={() => handleCancel(o.id)}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          {busyId === o.id ? "Cancelling…" : "Cancel"}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}