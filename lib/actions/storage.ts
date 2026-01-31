"use server";

import { createClient } from "@/lib/supabase/server";

export async function getSignedVideoUrl(path: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Verify user owns the file or is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  // Check if user owns the submission
  if (!isAdmin) {
    const { data: submission } = await supabase
      .from("submissions")
      .select("user_id")
      .eq("recording_path", path)
      .single();

    if (!submission || submission.user_id !== user.id) {
      return { error: "Unauthorized" };
    }
  }

  const { data, error } = await supabase.storage
    .from("recordings")
    .createSignedUrl(path, 3600); // 1 hour expiry

  if (error) {
    return { error: error.message };
  }

  return { url: data.signedUrl };
}
