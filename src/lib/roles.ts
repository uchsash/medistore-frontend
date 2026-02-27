export type UiRole = "admin" | "seller" | "customer";

const ROLE_MAP = {
  ADMIN: "admin",
  SELLER: "seller",
  CUSTOMER: "customer",
} as const;

export type BackendRole = keyof typeof ROLE_MAP;

export function normalizeRole(role: unknown): UiRole {
  if (typeof role !== "string") return "customer";

  // handle "ADMIN" and also "admin" safely
  const upper = role.toUpperCase();

  if (upper in ROLE_MAP) {
    return ROLE_MAP[upper as BackendRole];
  }

  // fallback (safe default)
  return "customer";
}