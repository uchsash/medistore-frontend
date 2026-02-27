import { Separator } from "@/components/ui/separator";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground">
          Fully responsive dashboard shell (sidebar + topbar).
        </p>
      </div>

      <Separator />

      {/* Example content grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border bg-card p-4 shadow-sm"
          >
            <p className="text-sm font-medium">Card {i + 1}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Replace with your metrics, tables, charts.
            </p>
          </div>
        ))}
      </div>

      {/* Mobile-only search hint */}
      <div className="md:hidden rounded-2xl border bg-muted/20 p-4">
        <p className="text-sm font-medium">Mobile tip</p>
        <p className="text-sm text-muted-foreground">
          The sidebar opens from the menu button in the top bar.
        </p>
      </div>
    </div>
  );
}