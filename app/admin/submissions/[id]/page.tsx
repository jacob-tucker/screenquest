import { notFound } from "next/navigation";
import { SubmissionReview } from "./SubmissionReview";
import { getSubmission } from "@/lib/data/submissions";
import { getSignedVideoUrl } from "@/lib/actions/storage";

export default async function SubmissionReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const submission = await getSubmission(id);

  if (!submission) {
    notFound();
  }

  // Get signed URL for the recording
  let videoUrl: string | null = null;
  if (submission.recording_path) {
    const result = await getSignedVideoUrl(submission.recording_path);
    if (result.url) {
      videoUrl = result.url;
    }
  }

  // Transform data to match expected interface
  const submissionData = {
    id: submission.id,
    status: submission.status as "pending" | "approved" | "rejected",
    admin_notes: submission.admin_notes,
    points_awarded: submission.points_awarded ?? 0,
    created_at: submission.created_at,
    reviewed_at: submission.reviewed_at,
    user: {
      email: submission.profiles?.email ?? "",
      full_name: submission.profiles?.full_name ?? null,
    },
    campaign: {
      title: submission.campaigns?.title ?? "",
      points_reward: submission.campaigns?.points_reward ?? 0,
      target_url: submission.campaigns?.target_url ?? "",
    },
    recording_path: submission.recording_path,
    recording_duration: submission.recording_duration,
  };

  return <SubmissionReview submission={submissionData} videoUrl={videoUrl} />;
}
