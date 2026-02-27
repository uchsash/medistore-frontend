import { env } from "@/env";
import { cookies } from "next/headers";
import { normalizeRole } from "@/lib/roles";

const AUTH_URL = env.AUTH_URL;

export const userService = {
  getSession: async function () {
    try {
      const cookieStore = await cookies();

      const res = await fetch(`${AUTH_URL}/get-session`, {
        cache: "no-store",
        headers: {
          Cookie: cookieStore.toString(),
        },
      });

      const session = await res.json();

      if (session === null) {
        return {
          data: null,
          error: { message: "Session is missing" },
        };
      }

      const roleRaw =
        session?.user?.role ?? session?.role ?? session?.data?.user?.role;

      const normalizedRole = normalizeRole(roleRaw);

      const normalizedSession = {
        ...session,
        user: {
          ...(session.user ?? {}),
          role: normalizedRole,
        },
      };

      return { data: normalizedSession, error: null };
    } catch (error) {
      console.log(error);
      return {
        data: null,
        error: { message: "Something Went Wrong" },
      };
    }
  },
};