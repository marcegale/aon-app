import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server-auth";
import { prisma } from "@/app/lib/prisma";

export default async function PlatformAssessmentPage() {
  const supabaseClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  if (!user?.email) {
    redirect("/login");
  }

  let tenantSlug: string;

  try {
    const prismaUser = await prisma.user.findFirst({
      where: { email: user.email },
      include: {
        memberships: {
          include: { tenant: { select: { slug: true } } },
          orderBy: { createdAt: "asc" },
          take: 1,
        },
      },
    });

    const slug = prismaUser?.memberships[0]?.tenant?.slug;
    tenantSlug = slug
      ? slug
      : user.email.split("@")[0].toLowerCase().replace(/[^a-z0-9]+/g, "-");
  } catch {
    tenantSlug = user.email.split("@")[0].toLowerCase().replace(/[^a-z0-9]+/g, "-");
  }

  redirect(`/${tenantSlug}/assessment`);
}
