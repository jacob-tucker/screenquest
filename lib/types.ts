// Types for the application - will be used with backend later

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "user" | "admin";
  total_points: number;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  target_url: string;
  points_reward: number;
  max_submissions_per_user: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: string;
  user_id: string;
  campaign_id: string;
  recording_path: string;
  recording_duration: number | null;
  status: "pending" | "approved" | "rejected";
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  points_awarded: number;
  created_at: string;
  updated_at: string;
}
