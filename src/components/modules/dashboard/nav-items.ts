import type { LucideIcon } from "lucide-react";
import {
  Home,
  LayoutDashboard,
  User,
  Pill,
  ShoppingBag,
  PackagePlus,
  Package,
  ClipboardList,
  Users,
  Layers,
  MessageSquareWarning,
} from "lucide-react";

export type UserRole = "customer" | "seller" | "admin";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  roles: UserRole[]; // who can see it
};

export const NAV_ITEMS: NavItem[] = [
  // Common
  {
    title: "Home",
    href: "/",
    icon: Home,
    roles: ["customer", "seller", "admin"],
  },
  {
    title: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["customer", "seller", "admin"],
  },
  {
    title: "My Profile",
    href: "/dashboard/profile",
    icon: User,
    roles: ["customer", "seller", "admin"],
  },

  // Customer
  {
    title: "Browse Medicines",
    href: "/medicines",
    icon: Pill,
    roles: ["customer"],
  },
  {
    title: "My Orders",
    href: "/dashboard/my-orders",
    icon: ShoppingBag,
    roles: ["customer"],
  },

  // Seller
  {
    title: "Add Medicine",
    href: "/dashboard/seller/add-medicine",
    icon: PackagePlus,
    roles: ["seller"],
  },
  {
    title: "My Medicines",
    href: "/dashboard/seller/my-medicines",
    icon: Package,
    roles: ["seller"],
  },
  {
    title: "Manage Orders",
    href: "/dashboard/seller/orders",
    icon: ClipboardList,
    roles: ["seller"],
  },

  // Admin
  {
    title: "Manage Categories",
    href: "/dashboard/admin/categories",
    icon: Layers,
    roles: ["admin"],
  },
  {
    title: "Manage Users",
    href: "/dashboard/admin/users",
    icon: Users,
    roles: ["admin"],
  },
  {
    title: "All Orders",
    href: "/dashboard/admin/orders",
    icon: ClipboardList,
    roles: ["admin"],
  },
  {
    title: "Review Moderation",
    href: "/dashboard/admin/reviews",
    icon: MessageSquareWarning,
    roles: ["admin"],
  },
];

export function getNavItemsByRole(role: UserRole) {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}