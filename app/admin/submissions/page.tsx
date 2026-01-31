import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/badge'
import { formatRelativeTime } from '@/lib/utils/format'
import Link from 'next/link'

type SubmissionWithRelations = {
  id: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  user: { email: string; full_name: string | null } | null
  campaign: { title: string; points_reward: number } | null
}

// Mock data - will be replaced with real data fetching later
const mockSubmissions: SubmissionWithRelations[] = [
  {
    id: '1',
    status: 'pending',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    user: { email: 'alice@example.com', full_name: 'Alice Johnson' },
    campaign: { title: 'Test Checkout Flow', points_reward: 50 },
  },
  {
    id: '2',
    status: 'pending',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    user: { email: 'bob@example.com', full_name: 'Bob Smith' },
    campaign: { title: 'Search Functionality Test', points_reward: 30 },
  },
  {
    id: '3',
    status: 'pending',
    created_at: new Date(Date.now() - 10800000).toISOString(),
    user: { email: 'carol@example.com', full_name: 'Carol Williams' },
    campaign: { title: 'User Registration Flow', points_reward: 40 },
  },
  {
    id: '4',
    status: 'approved',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    user: { email: 'dave@example.com', full_name: 'Dave Miller' },
    campaign: { title: 'Test Checkout Flow', points_reward: 50 },
  },
  {
    id: '5',
    status: 'rejected',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    user: { email: 'eve@example.com', full_name: 'Eve Davis' },
    campaign: { title: 'Search Functionality Test', points_reward: 30 },
  },
]

export default async function AdminSubmissionsPage() {
  // TODO: Replace with real data fetching
  const submissions = mockSubmissions
  const pending = submissions.filter((s) => s.status === 'pending')
  const reviewed = submissions.filter((s) => s.status !== 'pending')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Submissions</h1>
        <p className="text-sm text-zinc-400">Review user submissions</p>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-white">
          Pending Review ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-zinc-400">No pending submissions</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {pending.map((submission) => (
              <Link key={submission.id} href={`/admin/submissions/${submission.id}`}>
                <Card className="hover:border-zinc-700 transition-colors">
                  <CardContent className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {submission.campaign?.title}
                      </p>
                      <p className="text-xs text-zinc-400">
                        by {submission.user?.full_name || submission.user?.email} •{' '}
                        {formatRelativeTime(submission.created_at)}
                      </p>
                    </div>
                    <StatusBadge status={submission.status} />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-white">
          Reviewed ({reviewed.length})
        </h2>
        {reviewed.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-zinc-400">No reviewed submissions yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {reviewed.map((submission) => (
              <Link key={submission.id} href={`/admin/submissions/${submission.id}`}>
                <Card className="hover:border-zinc-700 transition-colors">
                  <CardContent className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {submission.campaign?.title}
                      </p>
                      <p className="text-xs text-zinc-400">
                        by {submission.user?.full_name || submission.user?.email} •{' '}
                        {formatRelativeTime(submission.created_at)}
                      </p>
                    </div>
                    <StatusBadge status={submission.status} />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
