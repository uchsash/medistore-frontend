"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Added router for redirect
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Mail, Lock, User, Phone, ArrowRight, Loader2, ShieldCheck, Truck, Clock, Briefcase } from "lucide-react";

import { authClient } from "@/lib/auth-client"; // Ensure this is imported
import { toast } from "sonner"; // Ensure sonner is installed
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// FEATURE: Zod Registration Schema
const signupSchema = z.object({
  fullName: z.string().min(3, { message: "Full name must be at least 3 characters." }),
  email: z.string().email({ message: "Enter a valid medical email address." }),
  phone: z.string().min(11, { message: "Enter a valid 11-digit phone number." }),
  role: z.enum(["CUSTOMER", "SELLER"], {
    message: "Please select an account type.",
  }),
  password: z.string().min(8, { message: "Password must be at least 8 characters for security." }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function SignupComponent() {
  const router = useRouter(); // Initialize router

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      role: "CUSTOMER",
      password: "",
      confirmPassword: "",
    },
  });

  // FEATURE: Proper Registration Submission
async function onSubmit(values: z.infer<typeof signupSchema>) {
  await authClient.signUp.email(
    {
      email: values.email,
      password: values.password,
      name: values.fullName,
      role: values.role,
      phone: values.phone,
      status: "ACTIVE",

      fetchOptions: {
        onSuccess: () => {
          toast.success("Account created successfully!");
          router.push("/login");
        },
        onError: (ctx: { error: { message?: string } }) => {
          toast.error(ctx.error.message || "Something went wrong.");
        },
      },
    } as Parameters<typeof authClient.signUp.email>[0] & {
      role: "CUSTOMER" | "SELLER";
      phone?: string;
      status: "ACTIVE" | "BANNED";
    }
  );
}

  return (
    <div className="min-h-screen flex items-center justify-center p-0 sm:p-4 bg-muted/20 py-12">
      <div className="flex w-full max-w-6xl bg-background rounded-none sm:rounded-3xl shadow-2xl overflow-hidden min-h-[700px]">

        {/* Desktop Side Panel */}
        <div className="hidden lg:flex flex-1 bg-primary p-12 flex-col justify-between text-primary-foreground relative overflow-hidden">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="relative z-10">
            <div className="bg-white text-primary w-fit p-2 rounded-lg mb-6 shadow-xl animate-bounce [animation-duration:3s]">
              <Plus size={32} strokeWidth={3} />
            </div>
            <h2 className="text-4xl font-bold mb-4 italic tracking-tight">Medistore</h2>
            <p className="text-primary-foreground/90 text-lg max-w-md leading-relaxed">
              Join our community to access genuine medicines, track your health journey, and enjoy express doorstep delivery.
            </p>
          </div>

          <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-4 group">
              <div className="bg-white/20 p-3 rounded-full group-hover:bg-white/30 transition-colors"><Truck size={24} /></div>
              <p className="font-semibold text-base">Express Delivery in 30 Mins</p>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="bg-white/20 p-3 rounded-full group-hover:bg-white/30 transition-colors"><ShieldCheck size={24} /></div>
              <p className="font-semibold text-base">100% Genuine Pharmaceuticals</p>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="bg-white/20 p-3 rounded-full group-hover:bg-white/30 transition-colors"><Clock size={24} /></div>
              <p className="font-semibold text-base">24/7 Pharmacist Support</p>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <div className="flex-1 flex flex-col justify-center p-8 sm:p-12 overflow-y-auto">
          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="space-y-1 p-0 mb-8 flex flex-col items-center lg:items-start">
              <div className="lg:hidden bg-primary text-primary-foreground p-3 rounded-2xl mb-4 shadow-lg">
                <Plus size={28} strokeWidth={3} />
              </div>
              <CardTitle className="text-3xl font-extrabold tracking-tight text-foreground">
                Create Account
              </CardTitle>
              <CardDescription className="text-muted-foreground text-center lg:text-left">
                Sign up to start your health journey with Medistore.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Full Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="John Doe" {...field} className="pl-10 h-12 focus-visible:ring-primary" />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Account Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 pl-10">
                              <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <SelectValue placeholder="Select your account type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="CUSTOMER">Customer</SelectItem>
                            <SelectItem value="SELLER">Seller</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="name@email.com" {...field} className="pl-10 h-12 focus-visible:ring-primary" />
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Phone</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="017XXXXXXXX" {...field} className="pl-10 h-12 focus-visible:ring-primary" />
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input type="password" placeholder="••••••••" {...field} className="pl-10 h-12 focus-visible:ring-primary" />
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Confirm</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input type="password" placeholder="••••••••" {...field} className="pl-10 h-12 focus-visible:ring-primary" />
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className="w-full bg-primary hover:bg-accent text-primary-foreground font-bold h-12 text-base shadow-md group transition-all mt-4"
                  >
                    {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : (
                      <>Create Medical Account <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>

            <CardFooter className="p-0 mt-8 flex flex-col items-center lg:items-start border-t border-border/50 pt-6">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary font-bold hover:underline decoration-2">
                  Log in instead
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}