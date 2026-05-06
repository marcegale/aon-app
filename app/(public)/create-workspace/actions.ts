"use server";

import { prisma } from "@/app/lib/prisma";

export async function createWorkspaceAction(formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;

  if (!name || !slug) {
    return { error: "Missing fields" };
  }

  try {
    const existing = await prisma.tenant.findUnique({
      where: { slug },
    });

    if (existing) {
      return { error: "Slug already in use" };
    }

    const tenant = await prisma.tenant.create({
      data: {
        name,
        slug,
      },
    });

    return { success: true, tenantId: tenant.id };
  } catch (err) {
    console.error(err);
    return { error: "Failed to create workspace" };
  }
}