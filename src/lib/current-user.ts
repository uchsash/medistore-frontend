import { userService } from "@/services/user.service";
import type { UiRole } from "@/lib/roles";

export type CurrentUser = {
  role: UiRole;
  email?: string;
  name?: string;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const { data, error } = await userService.getSession();
  if (error || !data) return null;

  const user = data.user ?? data?.data?.user ?? null;
  if (!user) return null;

  return {
    role: user.role,
    email: user.email,
    name: user.name ?? user.displayName,
  };
}