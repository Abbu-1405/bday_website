/**
 * Centralized list of authorized administrator emails for Starlit Letters.
 */
export const AUTHORIZED_ADMIN_EMAILS = [
  'mohammedabuzarshaik@gmail.com',
  'diviammu716@gmail.com',
] as const;

/**
 * Checks if a given email is in the authorized admin allowlist.
 */
export const isAuthorizedAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return AUTHORIZED_ADMIN_EMAILS.some(
    (adminEmail) => adminEmail.toLowerCase() === normalized
  );
};
