"use server";

import { supabase } from "@/utils/supabase";

export type VerifyAccessKeyResult =
  | { success: true }
  | { success: false; error: string };

export async function verifyAccessKey(
  accessKey: string,
  email: string,
): Promise<VerifyAccessKeyResult> {
  const trimmedKey = accessKey.trim();
  const trimmedEmail = email.trim();

  if (!trimmedKey) {
    return { success: false, error: "Admin access key is required." };
  }

  if (!trimmedEmail) {
    return { success: false, error: "Email is required to verify the access key." };
  }

  const { data: fetchedKey, error: fetchError } = await supabase
    .from("admin_access_keys")
    .select("key_code, is_used, target_email")
    .eq("key_code", trimmedKey)
    .maybeSingle();

  if (fetchError) {
    console.error("verifyAccessKey fetch:", fetchError);
    return { success: false, error: "Unable to verify access key. Please try again." };
  }

  if (!fetchedKey) {
    return { success: false, error: "Invalid admin access key." };
  }

  if (fetchedKey.is_used) {
    return { success: false, error: "This admin access key has already been used." };
  }

  if (
    fetchedKey.target_email !== null &&
    fetchedKey.target_email.toLowerCase() !== trimmedEmail.toLowerCase()
  ) {
    return {
      success: false,
      error: "This access key is not authorized for this email address.",
    };
  }

  const { data: updated, error: updateError } = await supabase
    .from("admin_access_keys")
    .update({ is_used: true, used_by_email: trimmedEmail })
    .eq("key_code", trimmedKey)
    .eq("is_used", false)
    .select("key_code")
    .maybeSingle();

  if (updateError) {
    console.error("verifyAccessKey update:", updateError);
    return { success: false, error: "Unable to register access key. Please try again." };
  }

  if (!updated) {
    return { success: false, error: "This admin access key has already been used." };
  }

  return { success: true };
}
