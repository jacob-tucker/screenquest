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
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUpload } from "@/lib/hooks/use-upload";
import { createSubmission } from "@/lib/actions/submissions";
import type { Tables } from "@/lib/supabase/types";

type Campaign = Tables<"campaigns">;
type Submission = Tables<"submissions">;

function CampaignContent({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const { recordedBlob, isRecording, resetRecording, duration } =
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

      // Check for existing submission
      if (campaignData) {
        const { data: submissionData } = await supabase
          .from("submissions")
          .select("*")
          .eq("user_id", user.id)
          .eq("campaign_id", campaignId)
          .single();

        setSubmission(submissionData);
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
      setSubmission(result.data as Submission);
      resetRecording();
    } catch (error) {
      console.error("Submit error:", error);
      setSubmitError("Failed to submit recording. Please try again.");
    }
  }, [recordedBlob, campaign, userId, uploadVideo, duration, router, resetRecording]);

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

  // Already submitted
  if (submission) {
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
            <h1 className="text-xl font-semibold text-white">
              {campaign.title}
            </h1>
            <StatusBadge status={submission.status} />
          </div>
        </div>

        <Card>
          <CardContent className="py-8 text-center">
            {submission.status === "approved" ? (
              <>
                <CheckCircle className="mx-auto h-12 w-12 text-emerald-400" />
                <p className="mt-3 text-lg font-medium text-white">
                  Submission Approved!
                </p>
                <p className="mt-1 text-sm text-zinc-400">
                  You earned {submission.points_awarded} points
                </p>
              </>
            ) : submission.status === "rejected" ? (
              <>
                <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
                <p className="mt-3 text-lg font-medium text-white">
                  Submission Rejected
                </p>
                {submission.admin_notes && (
                  <p className="mt-1 text-sm text-zinc-400">
                    {submission.admin_notes}
                  </p>
                )}
              </>
            ) : (
              <>
                <Clock className="mx-auto h-12 w-12 text-amber-400" />
                <p className="mt-3 text-lg font-medium text-white">
                  Submission In Review
                </p>
                <p className="mt-1 text-sm text-zinc-400">
                  We'll notify you once it's reviewed
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Recording flow
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

      <Card>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-white">Target Website</h3>
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

      <RecordingControls instruction={campaign.description} />

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
