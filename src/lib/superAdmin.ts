export const SUPER_ADMIN_EMAIL = "aakash.ahuja101@gmail.com";

export const isSuperAdmin = (email: string | null | undefined): boolean =>
  email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
