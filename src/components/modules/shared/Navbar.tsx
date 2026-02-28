"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, Heart, Menu, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const NavLinks = () => (
  <>
    <Link href="/" className="hover:text-primary-foreground/80 transition-colors">
      Home
    </Link>
    <Link href="/medicine" className="hover:text-primary-foreground/80 transition-colors">
      Browse Medicine
    </Link>
    <Link href="/about" className="hover:text-primary-foreground/80 transition-colors">
      About Us
    </Link>
    <Link href="/contact" className="hover:text-primary-foreground/80 transition-colors">
      Contact Us
    </Link>
  </>
);

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Hooks at the top (unchanged)
  const { data: session, isPending } = authClient.useSession();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Logged out successfully");
          router.push("/login");
          router.refresh();
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || "Logout failed");
        },
      },
    });
  };


  if (!isMounted) {
    return (
      <header className="w-full bg-primary py-4 px-6 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-primary-foreground text-xl tracking-tight"
            >
              <div className="bg-white p-1 rounded-sm text-primary">
                <Plus size={20} strokeWidth={3} />
              </div>
              Medistore
            </Link>
          </div>

          <div>
            <nav className="hidden lg:flex items-center gap-6 text-primary-foreground font-medium">
              <NavLinks />
            </nav>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-white/20 rounded-full hidden sm:flex"
              disabled
            >
              <Heart className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="relative text-primary-foreground hover:bg-white/20 rounded-full"
              disabled
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-destructive text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center border border-primary">
                2
              </span>
            </Button>

            <div className="hidden md:flex items-center gap-2">
              <div className="h-10 w-20 bg-primary-foreground/20 rounded-md animate-pulse" />
              <div className="h-10 w-24 bg-primary-foreground/20 rounded-md animate-pulse" />
            </div>

            <div className="lg:hidden">
              <Sheet open={false} onOpenChange={() => {}}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-primary-foreground" disabled>
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>

                <VisuallyHidden>
                  <SheetTitle>Dashboard navigation</SheetTitle>
                </VisuallyHidden>

                <SheetContent
                  side="right"
                  className="bg-primary border-2 border-red-600 px-4 pt-4 text-primary-foreground"
                >
                  <nav className="flex flex-col gap-4 text-lg font-semibold">
                    <NavLinks />
                    <hr className="border-primary-foreground/20" />
                    <div className="flex flex-col gap-4">
                      <div className="h-10 w-full bg-white/20 rounded-md animate-pulse" />
                      <div className="h-10 w-full bg-white/20 rounded-md animate-pulse" />
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="w-full bg-primary py-4 px-6 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-primary-foreground text-xl tracking-tight"
          >
            <div className="bg-white p-1 rounded-sm text-primary">
              <Plus size={20} strokeWidth={3} />
            </div>
            Medistore
          </Link>
        </div>

        <div>
          <nav className="hidden lg:flex items-center gap-6 text-primary-foreground font-medium">
            <NavLinks />
          </nav>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-white/20 rounded-full hidden sm:flex"
          >
            <Heart className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon" className="relative text-primary-foreground hover:bg-white/20 rounded-full">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-destructive text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center border border-primary">
              2
            </span>
          </Button>

          <div className="hidden md:flex items-center gap-2">
            {!isPending ? (
              session ? (
                <Button
                  onClick={handleLogout}
                  className="border-primary-foreground border text-primary-foreground hover:text-secondary-foreground font-medium"
                >
                  Logout
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    className="border-primary-foreground border text-primary-foreground hover:text-secondary-foreground font-medium"
                  >
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button className="bg-primary-foreground text-primary hover:bg-primary hover:border-primary-foreground hover:border hover:text-primary-foreground font-medium">
                    <Link href="/sign-up">Sign Up</Link>
                  </Button>
                </>
              )
            ) : (
              <div className="h-10 w-20 bg-primary-foreground/20 rounded-md animate-pulse" />
            )}
          </div>

          <div className="lg:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-primary-foreground">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>

              <VisuallyHidden>
                <SheetTitle>Dashboard navigation</SheetTitle>
              </VisuallyHidden>

              <SheetContent side="right" className="bg-primary border-2 border-red-600 px-4 pt-4 text-primary-foreground">
                <nav className="flex flex-col gap-4 text-lg font-semibold">
                  <NavLinks />
                  <hr className="border-primary-foreground/20" />
                  <div className="flex flex-col gap-4">
                    {!isPending && (
                      session ? (
                        <Button onClick={handleLogout} className="bg-white text-primary font-bold">
                          Logout
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            className="text-primary border-primary-foreground hover:bg-white/20"
                          >
                            <Link href="/login">Login</Link>
                          </Button>
                          <Button className="bg-white text-primary font-bold">
                            <Link href="/sign-up">Sign Up</Link>
                          </Button>
                        </>
                      )
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}