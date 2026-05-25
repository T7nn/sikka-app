export type UserRole = "customer" | "owner" | "admin";

export interface CurrentUser {
  email: string;
  role: UserRole;
}

export function parseUserRole(role: unknown): UserRole {
  if (role === "customer" || role === "owner" || role === "admin") {
    return role;
  }

  return "customer";
}

export const USER_ROLES: { value: UserRole; label: string }[] = [
  { value: "customer", label: "Customer" },
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Admin" },
];
