"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Star, Send } from "lucide-react";

import { reviewService } from "@/services/review.service";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

export function ReviewForm({
  medicineId,
  disabled,
  onPosted,
}: {
  medicineId: string;
  disabled?: boolean;
  onPosted?: () => void;
}) {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  const canSubmit = useMemo(() => {
    if (disabled) return false;
    if (busy) return false;
    if (!medicineId) return false;
    if (rating < 1 || rating > 5) return false;
    return true;
  }, [disabled, busy, medicineId, rating]);

  const submit = async () => {
    if (!canSubmit) return;

    setBusy(true);
    try {
      await reviewService.create({
        medicineId,
        rating,
        comment: comment.trim() ? comment.trim() : "",
      });

      toast.success("Review posted successfully!");
      setComment("");
      setRating(5);
      onPosted?.();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Review posting failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold">Write a review</p>

        <div className="flex items-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => {
            const v = i + 1;
            const active = v <= rating;
            return (
              <button
                key={v}
                type="button"
                onClick={() => setRating(v)}
                disabled={disabled || busy}
                className="inline-flex"
                aria-label={`Rate ${v} star`}
              >
                <Star
                  className={`h-4 w-4 ${
                    active ? "fill-primary text-primary" : "text-muted-foreground"
                  }`}
                />
              </button>
            );
          })}
          <span className="text-xs text-muted-foreground">{rating}/5</span>
        </div>
      </div>

      <Separator className="my-3" />

      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience (optional)…"
        className="rounded-xl"
        disabled={disabled || busy}
      />

      <div className="mt-3 flex justify-end">
        <Button className="rounded-xl" onClick={submit} disabled={!canSubmit}>
          <Send className="mr-2 h-4 w-4" />
          {busy ? "Posting…" : "Post review"}
        </Button>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        Only customers who purchased this medicine can post a review.
      </p>
    </div>
  );
}