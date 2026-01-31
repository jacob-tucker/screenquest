import { createClient } from "@/lib/supabase/server";

export async function getCampaigns() {
  const supabase = await createClient();

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return campaigns ?? [];
}

export async function getCampaign(id: string) {
  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", id)
    .single();

  return campaign;
}

export async function getUserSubmissionForCampaign(
  userId: string,
  campaignId: string
) {
  const supabase = await createClient();

  const { data: submission } = await supabase
    .from("submissions")
    .select("*")
    .eq("user_id", userId)
    .eq("campaign_id", campaignId)
    .single();

  return submission;
}

export async function getAllCampaigns() {
  const supabase = await createClient();

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("*, profiles!campaigns_created_by_fkey(full_name)")
    .order("created_at", { ascending: false });

  return campaigns ?? [];
}
