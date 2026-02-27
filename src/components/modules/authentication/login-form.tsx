"use client";

import React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Mail, Lock, ArrowRight, Loader2, ShieldCheck, Truck, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SocialLogin } from "./socialLogin";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { env } from "@/env";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export default function LoginComponent() {

  const router = useRouter();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {

    await authClient.signIn.email({
      email: values.email,
      password: values.password,
      callbackURL: env.NEXT_PUBLIC_FRONTEND_URL,
    },
      {
        onSuccess: () => {
          toast.success("Welcome back to Medistore!");
          router.push("/");
          router.refresh();
        },
        onError: (ctx) => {
          if (ctx.error.status === 403) {
            toast.error("Please verify your email before logging in.");
          } else {
            // Better Auth provides clean error messages like "Invalid email or password"
            toast.error(ctx.error.message || "Something went wrong");
          }
        },
      });
  }



  return (
    // FEATURE: Main wrapper changed to flex-row for desktop side-by-side view
    <div className="min-h-screen flex items-center justify-center p-0 sm:p-4 bg-muted/20">
      <div className="flex w-full max-w-5xl bg-background rounded-none sm:rounded-3xl shadow-2xl overflow-hidden min-h-[600px]">

        {/* FEATURE: Desktop Side Panel (Hidden on Mobile) */}
        <div className="hidden lg:flex flex-1 bg-primary p-12 flex-col justify-between text-primary-foreground relative overflow-hidden">
          {/* Decorative background circle */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="bg-white text-primary w-fit p-2 rounded-lg mb-6">
              <Plus size={32} strokeWidth={3} />
            </div>
            <h2 className="text-4xl font-bold mb-4 italic">Medistore</h2>
            <p className="text-primary-foreground/80 text-lg max-w-md">
              Your health, our priority. Log in to manage your orders and get medicines delivered in hours.
            </p>
          </div>

          {/* FEATURE: Fun/Visual Info Section */}

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2 rounded-full"><Truck size={20} /></div>
              <p className="font-medium text-sm">Express Delivery in 3 Hours</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2 rounded-full"><ShieldCheck size={20} /></div>
              <p className="font-medium text-sm">100% Genuine Pharmaceuticals</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2 rounded-full"><Clock size={20} /></div>
              <p className="font-medium text-sm">24/7 Open</p>
            </div>
          </div>
        </div>

        {/* FEATURE: Login Form Section */}
        <div className="flex-1 flex flex-col justify-center p-8 sm:p-12">
          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="space-y-1 p-0 mb-8 flex flex-col items-center lg:items-start">
              {/* Logo shows only on mobile in this section */}
              <div className="lg:hidden bg-primary text-primary-foreground p-3 rounded-2xl mb-4 shadow-lg">
                <Plus size={28} strokeWidth={3} />
              </div>
              <CardTitle className="text-3xl font-extrabold tracking-tight text-foreground">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Access your Medistore dashboard
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="name@email.com" {...field} className="pl-10 h-12 focus-visible:ring-primary border-border" />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between items-center">
                          <FormLabel className="font-semibold">Password</FormLabel>
                          <Link href="#" className="text-xs text-accent hover:underline font-medium">Forgot?</Link>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input type="password" {...field} className="pl-10 h-12 focus-visible:ring-primary border-border" />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className="w-full bg-primary hover:bg-accent text-primary-foreground font-bold h-12 text-base shadow-md group transition-all"
                  >
                    {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : (
                      <>Sign In <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></>
                    )}
                  </Button>
                </form>
                <SocialLogin />

              </Form>
            </CardContent>

            <CardFooter className="p-0 mt-8 flex flex-col items-center lg:items-start border-t border-border/50 pt-6">
              <p className="text-sm text-muted-foreground">
                New to Medistore?{" "}
                <Link href="/sign-up" className="text-primary font-bold hover:underline decoration-2">
                  Create Account
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}