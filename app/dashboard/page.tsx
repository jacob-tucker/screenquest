import { StatsCard } from "@/components/dashboard/stats-card";
import { SubmissionCard } from "@/components/submissions/submission-card";
import { Star, Target, Video, TrendingUp } from "lucide-react";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/data/profiles";
import { getUserSubmissions } from "@/lib/data/submissions";
import { getCampaigns } from "@/lib/data/campaigns";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  const [submissions, campaigns] = await Promise.all([
    getUserSubmissions(profile.id),
    getCampaigns(),
  ]);

  const approvedCount = submissions.filter((s) => s.status === "approved").length;
  const pendingCount = submissions.filter((s) => s.status === "pending").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Dashboard</h1>
        <p className="text-sm text-zinc-400">
          Track your progress and submissions
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total Points"
          value={profile.total_points ?? 0}
          icon={Star}
        />
        <StatsCard label="Submissions" value={submissions.length} icon={Video} />
        <StatsCard label="Approved" value={approvedCount} icon={TrendingUp} />
        <StatsCard
          label="Active Campaigns"
          value={campaigns.length}
          icon={Target}
        />
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium text-white">Recent Submissions</h2>
          <Link
            href="/dashboard/campaigns"
            className="text-xs text-emerald-400 hover:text-emerald-300"
          >
            View all campaigns
          </Link>
        </div>

        {submissions.length === 0 ? (
          <div className="py-8 text-center">
            <Video className="mx-auto h-8 w-8 text-zinc-600" />
            <p className="mt-2 text-sm text-zinc-400">No submissions yet</p>
            <Link
              href="/dashboard/campaigns"
              className="mt-2 inline-block text-xs text-emerald-400 hover:text-emerald-300"
            >
              Browse campaigns to get started
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {submissions.slice(0, 5).map((submission) => (
              <SubmissionCard key={submission.id} submission={submission} />
            ))}
          </div>
        )}
      </div>

      {pendingCount > 0 && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="text-sm text-amber-400">
            You have {pendingCount} submission{pendingCount > 1 ? "s" : ""}{" "}
            pending review
          </p>
        </div>
      )}
    </div>
  );
}
