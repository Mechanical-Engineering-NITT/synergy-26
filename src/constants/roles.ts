export const ROLE_VALUES = ["USER", "PR", "MASTER", "ADMIN", "QA"] as const;

export const ADMIN_ROLE_VALUES = ["PR", "MASTER", "ADMIN", "QA"] as const;

export const DEFAULT_ROLE = "USER" as const;

export type Role = (typeof ROLE_VALUES)[number];
export type AdminRole = (typeof ADMIN_ROLE_VALUES)[number];
