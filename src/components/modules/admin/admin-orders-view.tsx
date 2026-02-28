"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Eye, RefreshCw, Save } from "lucide-react";

import { adminOrderService, type AdminOrder, type OrderStatus } from "@/services/order-admin.service";

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

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function badgeVariant(status: OrderStatus): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "PENDING":
      return "default";
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

const ALL_STATUSES: OrderStatus[] = ["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"];

function isFinal(status: OrderStatus) {
  return status === "DELIVERED" || status === "CANCELLED";
}

export default function AdminOrdersView() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  // local selected status per order (so admin can change dropdown without immediately saving)
  const [draftStatus, setDraftStatus] = useState<Record<string, OrderStatus>>({});

  async function load() {
    setLoading(true);
    try {
      const data = await adminOrderService.getAllOrders();
      setOrders(data);

      // initialize drafts from server status
      const next: Record<string, OrderStatus> = {};
      for (const o of data) next[o.id] = o.status;
      setDraftStatus(next);
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

  const summary = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === "PENDING").length;
    const shipped = orders.filter((o) => o.status === "SHIPPED").length;
    const delivered = orders.filter((o) => o.status === "DELIVERED").length;
    const cancelled = orders.filter((o) => o.status === "CANCELLED").length;
    return { total, pending, shipped, delivered, cancelled };
  }, [orders]);

  const handleSave = async (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const next = draftStatus[orderId] ?? order.status;

    if (next === order.status) {
      toast.message("No changes to save.");
      return;
    }

    if (isFinal(order.status)) {
      toast.error(`Cannot change status of an order that is already ${order.status}.`);
      setDraftStatus((p) => ({ ...p, [orderId]: order.status }));
      return;
    }

    setBusyId(orderId);
    try {
      await adminOrderService.updateStatus(orderId, next);
      toast.success("Order status updated");
      await load();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Update failed";
      toast.error(msg);
      // revert draft to server status
      setDraftStatus((p) => ({ ...p, [orderId]: order.status }));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">All Orders</h1>
          <p className="text-sm text-muted-foreground">
            Admin can view any order and update its status.
          </p>
        </div>

        <Button variant="outline" className="rounded-xl" onClick={load} disabled={loading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Separator />

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total</CardTitle></CardHeader>
          <CardContent className="text-2xl font-extrabold">{summary.total}</CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pending</CardTitle></CardHeader>
          <CardContent className="text-2xl font-extrabold">{summary.pending}</CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Shipped</CardTitle></CardHeader>
          <CardContent className="text-2xl font-extrabold">{summary.shipped}</CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Delivered</CardTitle></CardHeader>
          <CardContent className="text-2xl font-extrabold">{summary.delivered}</CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Cancelled</CardTitle></CardHeader>
          <CardContent className="text-2xl font-extrabold">{summary.cancelled}</CardContent>
        </Card>
      </div>

      {/* List */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg">Orders</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-16 rounded-2xl bg-muted/40 animate-pulse" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-2xl border bg-muted/10 p-6 text-center">
              <p className="font-semibold">No orders found</p>
              <p className="text-sm text-muted-foreground mt-1">Orders will appear here once customers place them.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => {
                const itemsCount = o.items?.reduce((s, it) => s + (it.quantity ?? 0), 0) ?? 0;
                const draft = draftStatus[o.id] ?? o.status;

                return (
                  <div key={o.id} className="rounded-2xl border p-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={badgeVariant(o.status)} className="rounded-full">
                            {o.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{fmtDate(o.createdAt)}</span>
                        </div>

                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">{o.customer?.name ?? "Customer"}</span>
                          {o.customer?.email ? (
                            <span className="text-muted-foreground"> • {o.customer.email}</span>
                          ) : null}
                        </div>

                        <div className="text-sm text-muted-foreground">
                          Items: <span className="font-medium text-foreground">{itemsCount}</span>
                          <span className="text-muted-foreground/40"> • </span>
                          Total: <span className="font-semibold text-foreground">{money(o.totalAmount)}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Details */}
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
                                <Badge variant={badgeVariant(o.status)} className="rounded-full">
                                  {o.status}
                                </Badge>
                                <span className="text-sm text-muted-foreground">{fmtDate(o.createdAt)}</span>
                              </div>

                              <div className="rounded-2xl border p-4">
                                <p className="text-sm font-semibold">Customer</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {o.customer?.name ?? "Customer"} {o.customer?.email ? `(${o.customer.email})` : ""}
                                </p>
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
                                        <p className="text-sm font-medium">{it.medicine?.name ?? it.medicineId}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {it.medicine?.manufacturer ? `by ${it.medicine.manufacturer}` : ""}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                          Qty: <span className="font-medium text-foreground">{it.quantity}</span>
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-sm font-semibold">{money(it.price * it.quantity)}</p>
                                        <p className="text-xs text-muted-foreground">{money(it.price)} each</p>
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

                        {/* Status select + save */}
                        <div className="flex items-center gap-2">
                          <Select
                            value={draft}
                            onValueChange={(v) =>
                              setDraftStatus((p) => ({ ...p, [o.id]: v as OrderStatus }))
                            }
                            disabled={isFinal(o.status) || busyId === o.id}
                          >
                            <SelectTrigger className="w-[160px] rounded-xl">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              {ALL_STATUSES.map((s) => (
                                <SelectItem key={s} value={s}>
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Button
                            className="rounded-xl"
                            onClick={() => handleSave(o.id)}
                            disabled={busyId === o.id || isFinal(o.status)}
                          >
                            <Save className="mr-2 h-4 w-4" />
                            {busyId === o.id ? "Saving…" : "Update"}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {isFinal(o.status) && (
                      <p className="mt-3 text-xs text-muted-foreground">
                        This order is <span className="font-semibold">{o.status}</span>; status can’t be changed.
                      </p>
                    )}
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