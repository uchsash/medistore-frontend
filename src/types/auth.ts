import type { UiRole } from "@/lib/roles";

export type AppSessionUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: UiRole;
  phone?: string;
  status?: string;
};

export type AppSession = {
  session?: {
    id: string;
    token: string;
    expiresAt: string;
    createdAt: string;
    updatedAt: string;
    ipAddress?: string;
    userAgent?: string;
    userId: string;
  };
  user?: AppSessionUser;
};