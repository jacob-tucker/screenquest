import { StatsCard } from '@/components/dashboard/stats-card'
import { SubmissionCard } from '@/components/submissions/submission-card'
import { Star, Target, Video, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { Profile, Submission, Campaign } from '@/lib/types'

type SubmissionWithCampaign = Submission & { campaign: Campaign }

// Mock data - will be replaced with real data fetching later
const mockProfile: Profile = {
  id: '1',
  email: 'demo@example.com',
  full_name: 'Demo User',
  avatar_url: null,
  role: 'user',
  total_points: 150,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const mockSubmissions: SubmissionWithCampaign[] = [
  {
    id: '1',
    user_id: '1',
    campaign_id: '1',
    recording_path: 'recordings/demo.webm',
    recording_duration: 120,
    status: 'approved',
    admin_notes: null,
    reviewed_by: null,
    reviewed_at: null,
    points_awarded: 50,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    campaign: {
      id: '1',
      title: 'Test Checkout Flow',
      description: 'Complete a checkout on example.com',
      target_url: 'https://example.com',
      points_reward: 50,
      is_active: true,
      created_by: '1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  },
  {
    id: '2',
    user_id: '1',
    campaign_id: '2',
    recording_path: 'recordings/demo2.webm',
    recording_duration: 90,
    status: 'pending',
    admin_notes: null,
    reviewed_by: null,
    reviewed_at: null,
    points_awarded: 0,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    campaign: {
      id: '2',
      title: 'Search Functionality Test',
      description: 'Test the search feature',
      target_url: 'https://example.com/search',
      points_reward: 30,
      is_active: true,
      created_by: '1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }
]

export default async function DashboardPage() {
  // TODO: Replace with real data fetching
  const profile = mockProfile
  const submissions = mockSubmissions
  const activeCampaigns = 3

  const approvedCount = submissions.filter((s) => s.status === 'approved').length
  const pendingCount = submissions.filter((s) => s.status === 'pending').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Dashboard</h1>
        <p className="text-sm text-zinc-400">Track your progress and submissions</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total Points"
          value={profile?.total_points || 0}
          icon={Star}
        />
        <StatsCard
          label="Submissions"
          value={submissions.length}
          icon={Video}
        />
        <StatsCard
          label="Approved"
          value={approvedCount}
          icon={TrendingUp}
        />
        <StatsCard
          label="Active Campaigns"
          value={activeCampaigns}
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
            {submissions.map((submission) => (
              <SubmissionCard
                key={submission.id}
                submission={submission as any}
              />
            ))}
          </div>
        )}
      </div>

      {pendingCount > 0 && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="text-sm text-amber-400">
            You have {pendingCount} submission{pendingCount > 1 ? 's' : ''} pending review
          </p>
        </div>
      )}
    </div>
  )
}
