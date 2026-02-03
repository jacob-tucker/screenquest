"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createCampaign(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Verify admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Unauthorized - Admin only" };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const targetUrl = formData.get("target_url") as string;
  const pointsReward = parseInt(formData.get("points_reward") as string) || 100;
  const maxSubmissionsPerUser =
    parseInt(formData.get("max_submissions_per_user") as string) || 1;

  const { data, error } = await supabase
    .from("campaigns")
    .insert({
      title,
      description,
      target_url: targetUrl,
      points_reward: pointsReward,
      max_submissions_per_user: maxSubmissionsPerUser,
      created_by: user.id,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/campaigns");
  revalidatePath("/dashboard/campaigns");

  return { data };
}

export async function updateCampaign(id: string, formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Verify admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Unauthorized - Admin only" };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const targetUrl = formData.get("target_url") as string;
  const pointsReward = parseInt(formData.get("points_reward") as string) || 100;
  const maxSubmissionsPerUser =
    parseInt(formData.get("max_submissions_per_user") as string) || 1;
  const isActive = formData.get("is_active") === "true";

  const { data, error } = await supabase
    .from("campaigns")
    .update({
      title,
      description,
      target_url: targetUrl,
      points_reward: pointsReward,
      max_submissions_per_user: maxSubmissionsPerUser,
      is_active: isActive,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/campaigns");
  revalidatePath("/dashboard/campaigns");

  return { data };
}

export async function deleteCampaign(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Verify admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Unauthorized - Admin only" };
  }

  const { error } = await supabase.from("campaigns").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/campaigns");
  revalidatePath("/dashboard/campaigns");

  return { success: true };
}
