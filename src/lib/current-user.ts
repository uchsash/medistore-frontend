// import { userService } from "@/services/user.service";
// import type { UiRole } from "@/lib/roles";

// export type CurrentUser = {
//   role: UiRole;
//   email?: string;
//   name?: string;
// };

// export async function getCurrentUser(): Promise<CurrentUser | null> {
//   const { data, error } = await userService.getSession();
//   if (error || !data) return null;

//   const user = data.user ?? data?.data?.user ?? null;
//   if (!user) return null;

//   return {
//     role: user.role,
//     email: user.email,
//     name: user.name ?? user.displayName,
//   };
// }


// Faulty edition
// import { userService } from "@/services/user.service";
// import type { UiRole } from "@/lib/roles";
// import type { AppUser, BetterAuthSession } from "@/types/auth";

// export type CurrentUser = {
//   role: UiRole;
//   email?: string;
//   name?: string;
// };

// export async function getCurrentUser(): Promise<CurrentUser | null> {
//   const { data, error } = await userService.getSession();
//   if (error || !data) return null;

//   const session = data as BetterAuthSession;
//   const user = session.user;

//   if (!user) return null;

//   return {
//     role: user.role,
//     email: user.email,
//     name: user.name,
//   };
// }

// New edition

import { userService } from "@/services/user.service";
import type { UiRole } from "@/lib/roles";
import type { AppSession } from "@/types/auth";
import { normalizeRole } from "@/lib/roles";

export type CurrentUser = {
  role: UiRole;
  email?: string;
  name?: string;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const { data, error } = await userService.getSession();
  if (error || !data) return null;

  const session = data as AppSession;
  const user = session.user;

  if (!user) return null;

  return {
    role: normalizeRole(user.role), // safe even if backend returns "SELLER"
    email: user.email,
    name: user.name,
  };
}