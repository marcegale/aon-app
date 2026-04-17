import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantSlug = searchParams.get("tenantSlug");

    const cleanSlug =
      typeof tenantSlug === "string" && tenantSlug.trim().length > 0
        ? tenantSlug.trim().toLowerCase()
        : null;

    if (!cleanSlug) {
      return NextResponse.json(
        { error: "tenantSlug requerido" },
        { status: 400 }
      );
    }

    const tenant = await prisma.tenant.findFirst({
      where: { slug: cleanSlug },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: "Tenant no encontrado" },
        { status: 404 }
      );
    }

    const latest = await prisma.tenantAnalysis.findFirst({
      where: {
        tenantId: tenant.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      ok: true,
      data: latest,
    });
  } catch (error: any) {
    console.error("ERROR GET LATEST ASSESSMENT:", error);

    return NextResponse.json(
      {
        error: "Error obteniendo assessment",
        detail: error?.message || "unknown",
        code: error?.code || null,
        meta: error?.meta || null,
        stack: error?.stack || null,
      },
      { status: 500 }
    );
  }
}