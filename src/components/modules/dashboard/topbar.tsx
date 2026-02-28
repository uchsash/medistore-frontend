"use client";

import Link from "next/link";
import { Menu, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";

export function DashboardTopbar({
  onOpenSidebar,
}: {
  onOpenSidebar: () => void;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Logged out successfully");
          router.push("/login");
          router.refresh();
        },
        onError: (ctx: { error: { message?: string } }) => {
          toast.error(ctx.error.message || "Logout failed");
        },
      },
    });
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-background/80 backdrop-blur">
      <div className="flex h-15 items-center gap-3 px-4">
        {/* Mobile menu */}
        <Button
          variant="outline"
          size="icon"
          className="md:hidden"
          onClick={onOpenSidebar}
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="ml-auto">
              <Avatar className="h-8 w-8">
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <span className="ml-2 hidden text-sm md:inline">User</span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">Profile</Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/dashboard">Dashboard</Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}