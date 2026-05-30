"use server";

import { supabase } from "@/utils/supabase";

export type GenerateAccessKeyResult =
  | { success: true; keyCode: string }
  | { success: false; error: string };

function createKeyCode(): string {
  const segment = crypto.randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase();
  return `SIKKA-${segment}`;
}

export async function generateAccessKey(): Promise<GenerateAccessKeyResult> {
  const keyCode = createKeyCode();

  const { error } = await supabase.from("admin_access_keys").insert({
    key_code: keyCode,
    is_used: false,
    used_by_email: null,
  });

  if (error) {
    console.error("generateAccessKey:", error);
    return { success: false, error: "Unable to generate access key. Please try again." };
  }

  return { success: true, keyCode };
}
