"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

function withUpdatedParams(current: URLSearchParams, updates: Record<string, string>) {
  const next = new URLSearchParams(current.toString());
  Object.entries(updates).forEach(([k, v]) => next.set(k, v));
  return next;
}

export function Pagination({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const go = (nextPage: number) => {
    const next = withUpdatedParams(sp, { page: String(nextPage) });
    router.replace(`${pathname}?${next.toString()}`);
  };

  if (totalPages <= 1) return null;

  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      <Button
        variant="outline"
        className="rounded-xl"
        onClick={() => go(Math.max(1, page - 1))}
        disabled={page <= 1}
      >
        Previous
      </Button>

      <div className="px-3 text-sm text-muted-foreground">
        Page <span className="font-medium text-foreground">{page}</span> of{" "}
        <span className="font-medium text-foreground">{totalPages}</span>
      </div>

      <Button
        variant="outline"
        className="rounded-xl"
        onClick={() => go(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
      >
        Next
      </Button>
    </div>
  );
}