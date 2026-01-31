import { createClient } from "@/lib/supabase/server";

export async function getUserSubmissions(userId: string) {
  const supabase = await createClient();

  const { data: submissions } = await supabase
    .from("submissions")
    .select("*, campaigns(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return submissions ?? [];
}

export async function getAllSubmissions() {
  const supabase = await createClient();

  const { data: submissions } = await supabase
    .from("submissions")
    .select("*, campaigns(*), profiles!submissions_user_id_fkey(*)")
    .order("created_at", { ascending: false });

  return submissions ?? [];
}

export async function getPendingSubmissions() {
  const supabase = await createClient();

  const { data: submissions } = await supabase
    .from("submissions")
    .select("*, campaigns(*), profiles!submissions_user_id_fkey(*)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return submissions ?? [];
}

export async function getSubmission(id: string) {
  const supabase = await createClient();

  const { data: submission } = await supabase
    .from("submissions")
    .select("*, campaigns(*), profiles!submissions_user_id_fkey(*)")
    .eq("id", id)
    .single();

  return submission;
}

export async function getSubmissionStats() {
  const supabase = await createClient();

  const { count: totalSubmissions } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true });

  const { count: pendingSubmissions } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  const { count: approvedSubmissions } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved");

  return {
    total: totalSubmissions ?? 0,
    pending: pendingSubmissions ?? 0,
    approved: approvedSubmissions ?? 0,
  };
}
