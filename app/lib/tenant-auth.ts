export type TenantAuth = {
  username: string;
  password: string;
};

export const TENANT_CREDENTIALS: Record<string, TenantAuth> = {
  sandwichero: {
    username: "admin_sandwichero",
    password: "$$elsandwichero.123$$",
  },
  nova: {
    username: "admin_nova",
    password: "1234",
  },
};

export function validateTenantLogin(
  tenantSlug: string,
  username: string,
  password: string
): boolean {
  const tenant = TENANT_CREDENTIALS[tenantSlug];

  if (!tenant) return false;

  return (
    tenant.username === username &&
    tenant.password === password
  );
}