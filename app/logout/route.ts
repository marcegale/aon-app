import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server-auth";

export async function GET() {
  const supabase = await createServerSupabaseClient();

  await supabase.auth.signOut();

  redirect("/login");
}