import { NextResponse } from "next/server";
import { validateTenantLogin } from "@/app/lib/tenant-auth";

export async function POST(req: Request) {
  try {
    const { tenantSlug, username, password } = await req.json();

    const isValid = validateTenantLogin(
      tenantSlug,
      username,
      password
    );

    if (!isValid) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true });

    // Cookie simple por tenant
    response.cookies.set({
        name: `tenant_auth_${tenantSlug}`,
        value: "ok",
        path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Error en login" },
      { status: 500 }
    );
  }
}