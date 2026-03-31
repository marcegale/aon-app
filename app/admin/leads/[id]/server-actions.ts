"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateLeadStatus(formData: FormData) {
  const id = formData.get("id") as string;
  const estadoComercial = formData.get("estadoComercial") as string;

  if (!id || !estadoComercial) return;

  await prisma.lead.update({
    where: { id },
    data: { estadoComercial },
  });

  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${id}`);
}

export async function updateLeadNotes(formData: FormData) {
  const id = formData.get("id") as string;
  const notasInternas = formData.get("notasInternas") as string;

  if (!id) return;

  await prisma.lead.update({
    where: { id },
    data: { notasInternas },
  });

  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${id}`);
}