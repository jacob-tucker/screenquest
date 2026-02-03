"use client";

import { useEffect, useState, useMemo, use, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import {
  RecordingProvider,
  useRecording,
} from "@/components/recording/recording-provider";
import { RecordingControls } from "@/components/recording/recording-controls";
import {
  ArrowLeft,
  Star,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertCircle,
  Upload,
  Video,
  StopCircle,
} from "lucide-react";
import { formatDuration } from "@/lib/utils/format";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUpload } from "@/lib/hooks/use-upload";
import { createSubmission } from "@/lib/actions/submissions";
import type { Tables } from "@/lib/supabase/types";

type Campaign = Tables<"campaigns">;
type Submission = Tables<"submissions">;

function SubmissionHistoryItem({
  submission,
  index,
}: {
  submission: Submission;
  index: number;
}) {
  const statusIcon = {
    approved: <CheckCircle className="h-4 w-4 text-emerald-400" />,
    rejected: <AlertCircle className="h-4 w-4 text-red-400" />,
    pending: <Clock className="h-4 w-4 text-amber-400" />,
  };

  return (
    <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800">
          <Video className="h-4 w-4 text-zinc-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">
            Submission #{index + 1}
          </p>
          <p className="text-xs text-zinc-500">
            {new Date(submission.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {submission.status === "approved" && submission.points_awarded && (
          <span className="text-xs text-emerald-400">
            +{submission.points_awarded} pts
          </span>
        )}
        <div className="flex items-center gap-1">
          {statusIcon[submission.status as keyof typeof statusIcon]}
          <StatusBadge status={submission.status} />
        </div>
      </div>
    </div>
  );
}

function CampaignContent({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const { recordedBlob, isRecording, resetRecording, duration, stopRecording } =
    useRecording();
  const { uploading, progress, error: uploadError, uploadVideo } = useUpload();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const videoUrl = useMemo(() => {
    if (recordedBlob) {
      return URL.createObjectURL(recordedBlob);
    }
    return null;
  }, [recordedBlob]);

  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  useEffect(() => {
    const loadData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);

      // Fetch campaign
      const { data: campaignData } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", campaignId)
        .single();

      setCampaign(campaignData);

      // Fetch all user submissions for this campaign
      if (campaignData) {
        const { data: submissionsData } = await supabase
          .from("submissions")
          .select("*")
          .eq("user_id", user.id)
          .eq("campaign_id", campaignId)
          .order("created_at", { ascending: true });

        setSubmissions(submissionsData ?? []);
      }

      setLoading(false);
    };

    loadData();
  }, [campaignId, supabase, router]);

  const handleSubmit = useCallback(async () => {
    if (!recordedBlob || !campaign || !userId) {
      return;
    }

    setSubmitError(null);

    try {
      // Upload video
      const path = await uploadVideo(recordedBlob, campaign.id);

      if (!path) {
        setSubmitError("Failed to upload recording");
        return;
      }

      // Create submission record
      const result = await createSubmission(campaign.id, path, duration);

      if (result.error) {
        setSubmitError(result.error);
        return;
      }

      // Refresh to show submission status
      router.refresh();
      setSubmissions((prev) => [...prev, result.data as Submission]);
      resetRecording();
    } catch (error) {
      console.error("Submit error:", error);
      setSubmitError("Failed to submit recording. Please try again.");
    }
  }, [
    recordedBlob,
    campaign,
    userId,
    uploadVideo,
    duration,
    router,
    resetRecording,
  ]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-red-400" />
          <p className="mt-2 text-sm text-zinc-400">Campaign not found</p>
        </CardContent>
      </Card>
    );
  }

  const maxSubmissions = campaign.max_submissions_per_user;
  const submissionCount = submissions.length;
  const canSubmitMore = submissionCount < maxSubmissions;
  const approvedCount = submissions.filter(
    (s) => s.status === "approved"
  ).length;
  const totalPointsEarned = submissions.reduce(
    (sum, s) => sum + (s.points_awarded ?? 0),
    0
  );

  // All submissions used and all approved - show success summary
  const allCompleted = !canSubmitMore && approvedCount === maxSubmissions;

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/campaigns"
        className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to campaigns
      </Link>

      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-white">{campaign.title}</h1>
          <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
            <Star className="h-3 w-3" />
            {campaign.points_reward} pts
          </div>
        </div>
        <p className="mt-1 text-sm text-zinc-400">{campaign.description}</p>
      </div>

      {/* Submission Progress */}
      {maxSubmissions > 1 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">
                  Submission Progress
                </p>
                <p className="text-xs text-zinc-400">
                  {submissionCount} of {maxSubmissions} submissions used
                </p>
              </div>
              <div className="flex items-center gap-2">
                {totalPointsEarned > 0 && (
                  <span className="text-sm text-emerald-400">
                    +{totalPointsEarned} pts earned
                  </span>
                )}
                <div className="flex gap-1">
                  {Array.from({ length: maxSubmissions }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 w-6 rounded-full ${
                        i < submissionCount
                          ? submissions[i]?.status === "approved"
                            ? "bg-emerald-500"
                            : submissions[i]?.status === "rejected"
                            ? "bg-red-500"
                            : "bg-amber-500"
                          : "bg-zinc-700"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All completed success message */}
      {allCompleted && (
        <Card>
          <CardContent className="py-8 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-emerald-400" />
            <p className="mt-3 text-lg font-medium text-white">
              All Submissions Approved!
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              You earned {totalPointsEarned} points total
            </p>
          </CardContent>
        </Card>
      )}

      {/* Submission History */}
      {submissions.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-white">Your Submissions</h2>
          <div className="space-y-2">
            {submissions.map((submission, index) => (
              <SubmissionHistoryItem
                key={submission.id}
                submission={submission}
                index={index}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recording flow - only show if can submit more */}
      {canSubmitMore && (
        <>
          {/* Instructions panel - hide when recording */}
          {!isRecording && !recordedBlob && (
            <Card>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-white">
                    Target Website
                  </h3>
                  <a
                    href={campaign.target_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {campaign.target_url}
                  </a>
                </div>

                <div className="border-t border-zinc-800 pt-4">
                  <h3 className="mb-3 text-sm font-medium text-white">
                    Instructions
                  </h3>
                  <ol className="list-inside list-decimal space-y-2 text-sm text-zinc-400">
                    <li>Click "Start Recording" to begin screen capture</li>
                    <li>Navigate to the target website in a new tab</li>
                    <li>Complete the required actions on the website</li>
                    <li>Return here and click "Stop Recording"</li>
                    <li>Preview and submit your recording</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Active recording panel - compact card on left */}
          {isRecording && !recordedBlob && (
            <div className="inline-block">
              <Card className="border-red-500/20 bg-red-500/5 w-auto">
                <CardContent className="py-3 px-4 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
                    <span className="text-sm font-medium text-white">REC</span>
                    <span className="font-mono text-sm text-zinc-400">
                      {formatDuration(duration)}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 max-w-xs">
                    {campaign.description}
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={campaign.target_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-xs font-medium text-zinc-900 transition-colors hover:bg-zinc-200"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Go to Website
                    </a>
                    <Button onClick={stopRecording} variant="danger" size="sm">
                      <StopCircle className="h-3 w-3" />
                      Stop
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {!recordedBlob && (
            <RecordingControls
              instruction={campaign.description}
              targetUrl={campaign.target_url}
            />
          )}

          {recordedBlob && !isRecording && (
            <Card>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-white">
                    Preview Recording
                  </h3>
                  <span className="text-xs text-zinc-400">
                    {(recordedBlob.size / (1024 * 1024)).toFixed(1)} MB
                  </span>
                </div>
                <video
                  src={videoUrl || undefined}
                  controls
                  className="w-full rounded-lg"
                />

                {uploading && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <Upload className="h-4 w-4 animate-pulse" />
                      Uploading... {progress}%
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full bg-emerald-500 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {(submitError || uploadError) && (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                    <p className="text-sm text-red-400">
                      {submitError || uploadError}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={resetRecording}
                    variant="secondary"
                    className="flex-1"
                    disabled={uploading}
                  >
                    Record Again
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={uploading}
                    className="flex-1"
                  >
                    {uploading ? "Uploading..." : "Submit Recording"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Max submissions reached but not all approved */}
      {!canSubmitMore && !allCompleted && (
        <Card>
          <CardContent className="py-6 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-amber-400" />
            <p className="mt-2 text-sm text-zinc-400">
              You have used all {maxSubmissions} submission
              {maxSubmissions > 1 ? "s" : ""} for this campaign
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function CampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <RecordingProvider>
      <CampaignContent campaignId={id} />
    </RecordingProvider>
  );
}
