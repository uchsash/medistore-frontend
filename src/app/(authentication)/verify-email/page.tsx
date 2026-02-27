"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!token) {
      toast.error("Invalid verification link.");
      router.replace("/login");
      return;
    }

    let cancelled = false;

    const verify = async () => {
      try {
        const { error } = await authClient.verifyEmail({
          query: { token },
        });

        if (cancelled) return;

        if (error) {
          toast.error(error.message || "Verification failed.");
          setStatus("error");
          return;
        }

        toast.success("Email verified successfully!");
        setStatus("success");

        setTimeout(() => {
          router.replace("/");
        }, 1500);
      } catch (e) {
        if (cancelled) return;
        toast.error("Verification failed.");
        setStatus("error");
      }
    };

    verify();

    return () => {
      cancelled = true;
    };
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20">
      <div className="bg-background p-8 rounded-2xl shadow-xl border text-center max-w-md w-full">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h2 className="text-xl font-bold">Verifying your account...</h2>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle2 className="h-12 w-12 text-primary" />
            <h2 className="text-xl font-bold">Account Verified!</h2>
            <p className="text-muted-foreground">
              Redirecting you to the home page...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4">
            <XCircle className="h-12 w-12 text-destructive" />
            <h2 className="text-xl font-bold">Verification Failed</h2>
            <Button onClick={() => router.replace("/login")}>Back to Login</Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-muted/20">
          <div className="bg-background p-8 rounded-2xl shadow-xl border text-center max-w-md w-full">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <h2 className="text-xl font-bold">Loading...</h2>
            </div>
          </div>
        </div>
      }
    >
      <VerifyEmailInner />
    </Suspense>
  );
}