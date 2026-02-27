"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { getNavItemsByRole, type UserRole } from "./nav-items";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export function DashboardSidebar({
  onNavigate,
  role = "customer",
}: {
  onNavigate?: () => void;
  role?: UserRole;
}) {
  const pathname = usePathname();


  const items = getNavItemsByRole(role);

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Brand */}
      <div className="px-4 py-4">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-2 font-bold text-xl tracking-tight text-sidebar-foreground"
        >
          <div className="bg-background p-1 rounded-sm text-primary">
            <Plus size={20} strokeWidth={3} />
          </div>
          Medistore
        </Link>
        <p className="mt-1 text-xs text-sidebar-foreground/70">Dashboard</p>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Nav */}
      <ScrollArea className="flex-1 px-2 py-3">
        <nav className="grid gap-1">
          {items.map((item) => {
            const isDashboardRoot = item.href === "/dashboard";
            const active = isDashboardRoot
              ? pathname === "/dashboard"
              : pathname?.startsWith(item.href);

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition outline-none",
                  "focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4">
          <Separator className="my-4 bg-sidebar-border" />
          <p className="text-xs text-sidebar-foreground/70">
            &copy; 2026 - Medistore
          </p>
        </div>
      </ScrollArea>
    </div>
  );
}