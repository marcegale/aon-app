import { NextResponse } from "next/server";
import { upsertTenantDocumentByCategory } from "@/app/lib/tenant-documents-store";
type UpsertTenantDocumentInput = Parameters<
  typeof upsertTenantDocumentByCategory
>[0];
import { supabaseServer } from "@/app/lib/supabase-server";
import { prisma } from "@/app/lib/prisma";

function buildStoragePath(params: {
  tenantId: string;
  category: string;
  fileName: string;
}) {
  const timestamp = Date.now();

  return `${params.tenantId}/${params.category}/${timestamp}-${params.fileName}`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantSlugParam = searchParams.get("tenantSlug");

if (!tenantSlugParam || tenantSlugParam.trim().length === 0) {
  return Response.json(
    { ok: false, error: "tenantSlug es obligatorio" },
    { status: 400 },
  );
}

const tenantSlug = tenantSlugParam.trim();

    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
      select: { id: true },
    });

    if (!tenant) {
      return Response.json(
        { ok: false, error: "Tenant no encontrado" },
        { status: 404 },
      );
    }

    const documents = await prisma.tenantDocument.findMany({
      where: { tenantId: tenant.id },
      orderBy: { updatedAt: "desc" },
    });

    return Response.json({
      ok: true,
      documents,
    });
  } catch (error) {
    console.error("GET /api/assessment/documents error:", error);
    return Response.json(
      { ok: false, error: "No se pudieron obtener los documentos" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const tenantSlugValue = formData.get("tenantSlug");
    const tenantSlug =
      typeof tenantSlugValue === "string" && tenantSlugValue.trim().length > 0
        ? tenantSlugValue.trim()
        : null;

    if (!tenantSlug) {
      return Response.json(
        { ok: false, error: "tenantSlug es obligatorio" },
        { status: 400 },
      );
    }

    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
      select: { id: true, slug: true },
    });

    if (!tenant) {
      return NextResponse.json(
        { ok: false, error: "Tenant no encontrado" },
        { status: 404 },
      );
    }

    const category = String(
      formData.get("category") || "",
    ) as UpsertTenantDocumentInput["category"];
    const title = String(formData.get("title") || "");
    const description = String(formData.get("description") || "");
    const status = String(
      formData.get("status") || "uploaded",
    ) as UpsertTenantDocumentInput["status"];
    const source = String(
      formData.get("source") || "upload",
    ) as UpsertTenantDocumentInput["source"];
    const file = formData.get("file") as File | null;

    if (!category || !title) {
      return NextResponse.json(
        { ok: false, error: "category y title son obligatorios" },
        { status: 400 },
      );
    }

    let fileUrl: string | undefined = undefined;
    let fileName: string | undefined = undefined;

    if (file) {
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "image/png",
        "image/jpeg",
      ];

      const maxSizeBytes = 10 * 1024 * 1024;

      if (!file.type || !allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { ok: false, error: "Formato de archivo no permitido" },
          { status: 400 },
        );
      }

      if (file.size > maxSizeBytes) {
        return NextResponse.json(
          { ok: false, error: "Archivo demasiado grande" },
          { status: 400 },
        );
      }

      fileName = file.name;

      const storagePath = buildStoragePath({
        tenantId: tenant.id,
        category,
        fileName,
      });

      const arrayBuffer = await file.arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuffer);

      const { error: uploadError } = await supabaseServer.storage
        .from("tenant-documents")
        .upload(storagePath, fileBuffer, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });

      if (uploadError) {
        console.error("Supabase storage upload error:", uploadError);

        return NextResponse.json(
          {
            ok: false,
            error: "No se pudo subir el archivo a Supabase Storage.",
          },
          { status: 500 },
        );
      }

      const { data: publicUrlData } = supabaseServer.storage
        .from("tenant-documents")
        .getPublicUrl(storagePath);

      fileUrl = publicUrlData.publicUrl;
    }

    const document = await upsertTenantDocumentByCategory({
      tenantId: tenant.id,
      category,
      title,
      description,
      status,
      source,
      fileName,
      fileUrl,
    });

    return NextResponse.json({
      ok: true,
      document,
    });
  } catch (error) {
    console.error("POST /api/assessment/documents error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "No se pudo crear el documento.",
      },
      { status: 500 },
    );
  }
}