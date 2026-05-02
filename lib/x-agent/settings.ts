import { createSupabaseAdminClient } from "@/lib/supabase/server";

export type XAgentSettings = {
  emails_enabled: boolean;
  image_prompt: string;
};

const DEFAULTS: XAgentSettings = {
  emails_enabled: true,
  image_prompt: "",
};

// Always returns a safe value — never throws.
export async function getXAgentSettings(userId: string): Promise<XAgentSettings> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from("x_agent_settings")
      .select("emails_enabled, image_prompt")
      .eq("user_id", userId)
      .single();

    if (!data) return { ...DEFAULTS };

    return {
      emails_enabled: data.emails_enabled ?? DEFAULTS.emails_enabled,
      image_prompt: data.image_prompt ?? DEFAULTS.image_prompt,
    };
  } catch {
    return { ...DEFAULTS };
  }
}
