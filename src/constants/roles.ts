export const ROLE_VALUES = ["USER", "ADMIN-PR", "ADMIN-MASTER"] as const;

export const ADMIN_ROLE_VALUES = ["ADMIN-PR", "ADMIN-MASTER"] as const;

export const DEFAULT_ROLE = "USER" as const;

export type Role = (typeof ROLE_VALUES)[number];
export type AdminRole = (typeof ADMIN_ROLE_VALUES)[number];
