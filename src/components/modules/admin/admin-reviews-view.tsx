"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { RefreshCw, Save, Trash2, Search, MessageSquareText, Star } from "lucide-react";

import {
  adminReviewService,
  type AdminReview,
  type ReviewStatus,
} from "@/services/review-admin.service";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function statusVariant(s: ReviewStatus): "default" | "secondary" | "outline" | "destructive" {
  return s === "PUBLISHED" ? "default" : "secondary";
}

const ALL_STATUSES: ReviewStatus[] = ["PUBLISHED", "UNPUBLISHED"];

export default function AdminReviewsView() {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [q, setQ] = useState("");

  // local draft status per review (change dropdown without immediately saving)
  const [draftStatus, setDraftStatus] = useState<Record<string, ReviewStatus>>({});

  // delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminReview | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await adminReviewService.getAll();
      setReviews(data);

      const next: Record<string, ReviewStatus> = {};
      for (const r of data) next[r.id] = r.status;
      setDraftStatus(next);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return reviews;

    return reviews.filter((r) => {
      const userName = r.user?.name?.toLowerCase() ?? "";
      const userEmail = r.user?.email?.toLowerCase() ?? "";
      const medName = r.medicine?.name?.toLowerCase() ?? "";
      const comment = (r.comment ?? "").toLowerCase();
      const status = r.status.toLowerCase();
      const rating = String(r.rating);

      return (
        userName.includes(s) ||
        userEmail.includes(s) ||
        medName.includes(s) ||
        comment.includes(s) ||
        status.includes(s) ||
        rating.includes(s)
      );
    });
  }, [reviews, q]);

  const stats = useMemo(() => {
    const total = reviews.length;
    const published = reviews.filter((r) => r.status === "PUBLISHED").length;
    const unpublished = reviews.filter((r) => r.status === "UNPUBLISHED").length;
    const avgRating =
      total === 0 ? 0 : reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / total;

    return {
      total,
      published,
      unpublished,
      avgRating: Number(avgRating.toFixed(2)),
    };
  }, [reviews]);

  const handleSave = async (reviewId: string) => {
    const r = reviews.find((x) => x.id === reviewId);
    if (!r) return;

    const next = draftStatus[reviewId] ?? r.status;

    if (next === r.status) {
      toast.message("No changes to save.");
      return;
    }

    setBusyId(reviewId);
    try {
      await adminReviewService.updateStatus(reviewId, next);
      toast.success("Review status updated");
      await load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Update failed");
      setDraftStatus((p) => ({ ...p, [reviewId]: r.status }));
    } finally {
      setBusyId(null);
    }
  };

  const openDelete = (r: AdminReview) => {
    setDeleteTarget(r);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setBusyId(deleteTarget.id);
    try {
      await adminReviewService.remove(deleteTarget.id);
      toast.success("Review deleted");
      setDeleteOpen(false);
      setDeleteTarget(null);
      await load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Review Moderation</h1>
          <p className="text-sm text-muted-foreground">
            Publish/unpublish customer reviews and remove inappropriate content.
          </p>
        </div>

        <Button variant="outline" className="rounded-xl" onClick={load} disabled={loading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Separator />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-extrabold">{stats.total}</CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Published</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-extrabold">{stats.published}</CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Unpublished</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-extrabold">{stats.unpublished}</CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Avg Rating</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-extrabold inline-flex items-center gap-2">
            <Star className="h-5 w-5" />
            {stats.avgRating}
          </CardContent>
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
              placeholder="Search by user, email, medicine, rating, comment, status…"
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg">All reviews</CardTitle>
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
              <p className="font-semibold">No reviews found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try a different search query.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((r) => {
                const draft = draftStatus[r.id] ?? r.status;
                const userLabel = r.user?.name ?? "User";
                const email = r.user?.email ?? "";
                const medLabel = r.medicine?.name ?? r.medicineId;

                return (
                  <div key={r.id} className="rounded-2xl border p-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={statusVariant(r.status)} className="rounded-full">
                            {r.status}
                          </Badge>

                          <Badge variant="outline" className="rounded-full inline-flex items-center gap-2">
                            <Star className="h-4 w-4" /> {r.rating}
                          </Badge>

                          <span className="text-sm text-muted-foreground">{fmtDate(r.createdAt)}</span>
                        </div>

                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">{userLabel}</span>
                          {email ? <span className="text-muted-foreground"> • {email}</span> : null}
                        </div>

                        <div className="text-sm text-muted-foreground">
                          Medicine: <span className="font-medium text-foreground">{medLabel}</span>
                        </div>

                        {r.comment ? (
                          <div className="mt-2 rounded-2xl border bg-muted/10 p-3">
                            <p className="text-xs text-muted-foreground inline-flex items-center gap-2">
                              <MessageSquareText className="h-4 w-4" />
                              Comment
                            </p>
                            <p className="text-sm mt-1 whitespace-pre-wrap">{r.comment}</p>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground mt-2">No comment</p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-2">
                          <Select
                            value={draft}
                            onValueChange={(v) =>
                              setDraftStatus((p) => ({ ...p, [r.id]: v as ReviewStatus }))
                            }
                            disabled={busyId === r.id}
                          >
                            <SelectTrigger className="w-[170px] rounded-xl">
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
                            onClick={() => handleSave(r.id)}
                            disabled={busyId === r.id}
                          >
                            <Save className="mr-2 h-4 w-4" />
                            {busyId === r.id ? "Saving…" : "Update"}
                          </Button>
                        </div>

                        <Button
                          variant="outline"
                          className="rounded-xl"
                          onClick={() => openDelete(r)}
                          disabled={busyId === r.id}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
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

      {/* Delete dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete review?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The review will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="rounded-2xl border p-4">
            <p className="text-sm font-semibold">
              {deleteTarget?.user?.name ?? "User"}
              {deleteTarget?.user?.email ? ` • ${deleteTarget.user.email}` : ""}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Medicine: {deleteTarget?.medicine?.name ?? deleteTarget?.medicineId ?? "—"}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-full">
                Rating: {deleteTarget?.rating ?? "—"}
              </Badge>
              {deleteTarget?.status ? (
                <Badge
                  variant={statusVariant(deleteTarget.status)}
                  className="rounded-full"
                >
                  {deleteTarget.status}
                </Badge>
              ) : null}
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl"
              onClick={confirmDelete}
              disabled={!deleteTarget || busyId === deleteTarget?.id}
            >
              {busyId === deleteTarget?.id ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}