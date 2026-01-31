"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createSubmission(
  campaignId: string,
  recordingPath: string,
  duration: number | null
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Check if user already has a submission for this campaign
  const { data: existingSubmission } = await supabase
    .from("submissions")
    .select("id")
    .eq("user_id", user.id)
    .eq("campaign_id", campaignId)
    .single();

  if (existingSubmission) {
    return { error: "You have already submitted for this campaign" };
  }

  const { data, error } = await supabase
    .from("submissions")
    .insert({
      user_id: user.id,
      campaign_id: campaignId,
      recording_path: recordingPath,
      recording_duration: duration,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/campaigns");
  revalidatePath(`/dashboard/campaigns/${campaignId}`);
  revalidatePath("/admin/submissions");

  return { data };
}

export async function reviewSubmission(
  id: string,
  approved: boolean,
  notes?: string
) {
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

  // Get the submission to find campaign points
  const { data: submission } = await supabase
    .from("submissions")
    .select("*, campaigns(*)")
    .eq("id", id)
    .single();

  if (!submission) {
    return { error: "Submission not found" };
  }

  const pointsToAward = approved ? submission.campaigns?.points_reward ?? 0 : 0;

  // Update submission
  const { error: updateError } = await supabase
    .from("submissions")
    .update({
      status: approved ? "approved" : "rejected",
      admin_notes: notes || null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      points_awarded: pointsToAward,
    })
    .eq("id", id);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath("/admin/submissions");
  revalidatePath(`/admin/submissions/${id}`);
  revalidatePath("/dashboard/leaderboard");

  return { success: true };
}

export async function deleteSubmission(id: string) {
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

  // Get submission to find recording path
  const { data: submission } = await supabase
    .from("submissions")
    .select("recording_path")
    .eq("id", id)
    .single();

  if (!submission) {
    return { error: "Submission not found" };
  }

  // Delete storage file
  if (submission.recording_path) {
    await supabase.storage
      .from("recordings")
      .remove([submission.recording_path]);
  }

  // Delete submission record
  const { error } = await supabase.from("submissions").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/submissions");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function deleteAllSubmissionsForCampaign(campaignId: string) {
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

  // Get all submissions for this campaign to find recording paths
  const { data: submissions } = await supabase
    .from("submissions")
    .select("id, recording_path")
    .eq("campaign_id", campaignId);

  if (!submissions || submissions.length === 0) {
    return { success: true, deleted: 0 };
  }

  // Delete all storage files
  const recordingPaths = submissions
    .map((s) => s.recording_path)
    .filter((path): path is string => !!path);

  if (recordingPaths.length > 0) {
    await supabase.storage.from("recordings").remove(recordingPaths);
  }

  // Delete all submission records
  const { error } = await supabase
    .from("submissions")
    .delete()
    .eq("campaign_id", campaignId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/submissions");
  revalidatePath("/admin/campaigns");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/campaigns");

  return { success: true, deleted: submissions.length };
}
