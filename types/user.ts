export type UserRole = "admin";

export interface CurrentUser {
  email: string;
  role: UserRole;
}

export function parseUserRole(_role: unknown): UserRole {
  return "admin";
}
