"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { MoreHorizontal, Eye, Truck, CheckCircle2, Ban } from "lucide-react";

import {
  sellerOrdersService,
  type OrderStatus,
  type SellerOrder,
} from "@/services/seller-orders.service";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function statusBadge(status: OrderStatus) {
  switch (status) {
    case "PENDING":
      return <Badge>PENDING</Badge>;
    case "SHIPPED":
      return <Badge className="rounded-full">SHIPPED</Badge>;
    case "DELIVERED":
      return <Badge className="rounded-full">DELIVERED</Badge>;
    case "CANCELLED":
      return (
        <Badge variant="destructive" className="rounded-full">
          CANCELLED
        </Badge>
      );
  }
}

function money(n: number) {
  return `৳ ${Number(n ?? 0).toFixed(2)}`;
}

type FilterStatus = "ALL" | OrderStatus;

export function SellerManageOrders() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<SellerOrder[]>([]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<FilterStatus>("ALL");

  const [viewId, setViewId] = useState<string | null>(null);
  const viewOrder = useMemo(
    () => orders.find((o) => o.id === viewId) ?? null,
    [orders, viewId]
  );

  const [confirm, setConfirm] = useState<{ id: string; next: OrderStatus } | null>(null);

  async function load() {
    try {
      setLoading(true);
      const list = await sellerOrdersService.getManageOrders();
      setOrders(list);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to load orders";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return orders.filter((o) => {
      const matchStatus = status === "ALL" ? true : o.status === status;

      const matchSearch =
        !s ||
        o.id.toLowerCase().includes(s) ||
        o.customer?.name?.toLowerCase().includes(s) ||
        o.customer?.email?.toLowerCase().includes(s) ||
        o.items?.some((it) => it.medicine.name.toLowerCase().includes(s));

      return matchStatus && matchSearch;
    });
  }, [orders, search, status]);

  async function confirmUpdate() {
    if (!confirm) return;

    try {
      await sellerOrdersService.updateOrderStatus(confirm.id, confirm.next);

      // update locally
      setOrders((prev) =>
        prev.map((o) => (o.id === confirm.id ? { ...o, status: confirm.next } : o))
      );

      toast.success("Order status updated");
      setConfirm(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Update failed";
      toast.error(msg);
    }
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Manage Orders</CardTitle>
          <p className="text-sm text-muted-foreground">
            Orders that include your medicines (items are already filtered to your products).
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order, customer, medicine…"
            className="md:w-80 rounded-xl"
          />

          <Select value={status} onValueChange={(v) => setStatus(v as FilterStatus)}>
            <SelectTrigger className="rounded-xl md:w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="PENDING">PENDING</SelectItem>
              <SelectItem value="SHIPPED">SHIPPED</SelectItem>
              <SelectItem value="DELIVERED">DELIVERED</SelectItem>
              <SelectItem value="CANCELLED">CANCELLED</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="rounded-xl" onClick={load} disabled={loading}>
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-2xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead className="hidden md:table-cell">Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Created</TableHead>
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
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <div className="py-10 text-center">
                      <p className="font-medium">No orders found</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Try another status or search keyword.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>
                      <div className="font-medium">#{o.id.slice(0, 8)}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {o.shippingAddress}
                      </div>
                    </TableCell>

                    <TableCell className="hidden md:table-cell">
                      <div className="text-sm font-medium">{o.customer?.name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{o.customer?.email ?? ""}</div>
                    </TableCell>

                    <TableCell>{money(o.totalAmount)}</TableCell>
                    <TableCell>{statusBadge(o.status)}</TableCell>

                    <TableCell className="hidden lg:table-cell">
                      {new Date(o.createdAt).toLocaleString()}
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-xl">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuItem onClick={() => setViewId(o.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View details
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            disabled={o.status !== "PENDING"}
                            onClick={() => setConfirm({ id: o.id, next: "SHIPPED" })}
                          >
                            <Truck className="mr-2 h-4 w-4" />
                            Mark as SHIPPED
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            disabled={o.status !== "SHIPPED"}
                            onClick={() => setConfirm({ id: o.id, next: "DELIVERED" })}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Mark as DELIVERED
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            disabled={o.status === "DELIVERED" || o.status === "CANCELLED"}
                            onClick={() => setConfirm({ id: o.id, next: "CANCELLED" })}
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            Cancel order
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Details dialog */}
        <Dialog open={!!viewId} onOpenChange={(o) => !o && setViewId(null)}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Order Details {viewOrder ? `#${viewOrder.id.slice(0, 8)}` : ""}
              </DialogTitle>
            </DialogHeader>

            {!viewOrder ? (
              <div className="h-24 bg-muted/40 rounded-xl animate-pulse" />
            ) : (
              <div className="space-y-4">
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-xl border p-3">
                    <p className="text-xs text-muted-foreground">Customer</p>
                    <p className="font-medium">{viewOrder.customer?.name ?? "—"}</p>
                    <p className="text-sm text-muted-foreground">{viewOrder.customer?.email ?? ""}</p>
                  </div>

                  <div className="rounded-xl border p-3">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <div className="mt-1">{statusBadge(viewOrder.status)}</div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Total:{" "}
                      <span className="font-medium text-foreground">
                        {money(viewOrder.totalAmount)}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border p-3">
                  <p className="text-xs text-muted-foreground">Shipping Address</p>
                  <p className="text-sm mt-1">{viewOrder.shippingAddress}</p>
                </div>

                <div className="rounded-xl border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Medicine</TableHead>
                        <TableHead>Manufacturer</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewOrder.items.map((it) => (
                        <TableRow key={it.id}>
                          <TableCell className="font-medium">{it.medicine.name}</TableCell>
                          <TableCell>{it.medicine.manufacturer}</TableCell>
                          <TableCell>{it.quantity}</TableCell>
                          <TableCell className="text-right">{money(it.price)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <p className="text-xs text-muted-foreground">
                  * Items shown are only the items that belong to you (seller-scoped by backend).
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Confirm status change */}
        <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Update order status?</AlertDialogTitle>
              <AlertDialogDescription>
                Change status to{" "}
                <span className="font-medium">{confirm?.next}</span>. This action may be restricted if
                the order is already DELIVERED or CANCELLED.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
              <AlertDialogAction className="rounded-xl" onClick={confirmUpdate}>
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}