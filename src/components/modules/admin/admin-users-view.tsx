"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { RefreshCw, ShieldAlert, UserRound, Search, Ban, CheckCircle2 } from "lucide-react";

import { adminUserService, type AdminUser, type UserStatus } from "@/services/user-admin.service";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function statusVariant(status: UserStatus): "default" | "destructive" | "secondary" | "outline" {
  return status === "BANNED" ? "destructive" : "default";
}

function normalizeBackendRole(role: string) {
  const upper = role?.toUpperCase?.() ?? "";
  if (upper === "ADMIN") return "ADMIN";
  if (upper === "SELLER") return "SELLER";
  return "CUSTOMER";
}

export default function AdminUsersView() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [q, setQ] = useState("");

  // modal
  const [openUser, setOpenUser] = useState<AdminUser | null>(null);
  const [draftStatus, setDraftStatus] = useState<UserStatus>("ACTIVE");

  async function load() {
    setLoading(true);
    try {
      const data = await adminUserService.getAll();
      setUsers(data);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return users;
    return users.filter((u) => {
      return (
        u.name?.toLowerCase().includes(s) ||
        u.email?.toLowerCase().includes(s) ||
        u.role?.toLowerCase().includes(s) ||
        u.status?.toLowerCase().includes(s)
      );
    });
  }, [users, q]);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === "ACTIVE").length;
    const banned = users.filter((u) => u.status === "BANNED").length;
    const admins = users.filter((u) => normalizeBackendRole(u.role) === "ADMIN").length;
    const sellers = users.filter((u) => normalizeBackendRole(u.role) === "SELLER").length;
    const customers = users.filter((u) => normalizeBackendRole(u.role) === "CUSTOMER").length;
    return { total, active, banned, admins, sellers, customers };
  }, [users]);

  const openModal = (u: AdminUser) => {
    setOpenUser(u);
    setDraftStatus(u.status);
  };

  const saveStatus = async () => {
    if (!openUser) return;

    if (draftStatus === openUser.status) {
      toast.message("No changes to save.");
      return;
    }

    // Optional: protect admin from banning admins (UX guard; backend still allows)
    if (normalizeBackendRole(openUser.role) === "ADMIN" && draftStatus === "BANNED") {
      const ok = window.confirm("This user is ADMIN. Are you sure you want to BAN?");
      if (!ok) return;
    }

    setBusyId(openUser.id);
    try {
      await adminUserService.updateStatus(openUser.id, draftStatus);
      toast.success(`User status updated to ${draftStatus}`);
      setOpenUser(null);
      await load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Manage Users</h1>
          <p className="text-sm text-muted-foreground">
            View all users and update status (ACTIVE / BANNED).
          </p>
        </div>

        <Button variant="outline" className="rounded-xl" onClick={load} disabled={loading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Separator />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total</CardTitle></CardHeader>
          <CardContent className="text-2xl font-extrabold">{stats.total}</CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active</CardTitle></CardHeader>
          <CardContent className="text-2xl font-extrabold">{stats.active}</CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Banned</CardTitle></CardHeader>
          <CardContent className="text-2xl font-extrabold">{stats.banned}</CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Admins</CardTitle></CardHeader>
          <CardContent className="text-2xl font-extrabold">{stats.admins}</CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Sellers</CardTitle></CardHeader>
          <CardContent className="text-2xl font-extrabold">{stats.sellers}</CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Customers</CardTitle></CardHeader>
          <CardContent className="text-2xl font-extrabold">{stats.customers}</CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="rounded-2xl">
        <CardContent className="p-4">
          <div className="flex w-full items-center gap-2 rounded-xl border border-input bg-background px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, email, role, status…"
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg">All users</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="h-16 rounded-2xl bg-muted/40 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border bg-muted/10 p-6 text-center">
              <p className="font-semibold">No users found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try a different search query.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((u) => (
                <div key={u.id} className="rounded-2xl border p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{u.name}</p>
                      <Badge variant="outline" className="rounded-full">
                        {normalizeBackendRole(u.role)}
                      </Badge>
                      <Badge variant={statusVariant(u.status)} className="rounded-full">
                        {u.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{u.email}</p>
                    <p className="text-xs text-muted-foreground">Joined: {fmtDate(u.createdAt)}</p>
                  </div>

                  <Dialog open={openUser?.id === u.id} onOpenChange={(open) => !open && setOpenUser(null)}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="rounded-xl" onClick={() => openModal(u)}>
                        <UserRound className="mr-2 h-4 w-4" />
                        Manage
                      </Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-xl rounded-2xl">
                      <DialogHeader>
                        <DialogTitle>Manage User</DialogTitle>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div className="rounded-2xl border p-4">
                          <p className="font-semibold">{openUser?.name}</p>
                          <p className="text-sm text-muted-foreground">{openUser?.email}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Badge variant="outline" className="rounded-full">
                              {normalizeBackendRole(openUser?.role ?? "CUSTOMER")}
                            </Badge>
                            <Badge
                              variant={statusVariant(openUser?.status ?? "ACTIVE")}
                              className="rounded-full"
                            >
                              {openUser?.status ?? "ACTIVE"}
                            </Badge>
                          </div>
                        </div>

                        <div className="rounded-2xl border p-4 space-y-2">
                          <p className="text-sm font-semibold flex items-center gap-2">
                            <ShieldAlert className="h-4 w-4" />
                            Status
                          </p>

                          <Select value={draftStatus} onValueChange={(v) => setDraftStatus(v as UserStatus)}>
                            <SelectTrigger className="rounded-xl">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ACTIVE">
                                <span className="inline-flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4" /> ACTIVE
                                </span>
                              </SelectItem>
                              <SelectItem value="BANNED">
                                <span className="inline-flex items-center gap-2">
                                  <Ban className="h-4 w-4" /> BANNED
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>

                          <p className="text-xs text-muted-foreground">
                            BANNED users should not be able to access protected routes.
                          </p>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button variant="outline" className="rounded-xl" onClick={() => setOpenUser(null)}>
                            Close
                          </Button>
                          <Button
                            className="rounded-xl"
                            onClick={saveStatus}
                            disabled={!openUser || busyId === openUser.id}
                          >
                            {busyId === openUser?.id ? "Saving…" : "Save changes"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}