import { StatsCard } from '@/components/dashboard/stats-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Target, FileCheck, Clock } from 'lucide-react'
import Link from 'next/link'

// Mock data - will be replaced with real data fetching later
const mockStats = {
  users: 42,
  campaigns: 8,
  submissions: 156,
  pending: 12,
}

const mockRecentSubmissions = [
  { id: '1', campaign: { title: 'Test Checkout Flow' }, user: { email: 'alice@example.com', full_name: 'Alice Johnson' } },
  { id: '2', campaign: { title: 'Search Functionality Test' }, user: { email: 'bob@example.com', full_name: 'Bob Smith' } },
  { id: '3', campaign: { title: 'User Registration Flow' }, user: { email: 'carol@example.com', full_name: 'Carol Williams' } },
]

export default async function AdminPage() {
  // TODO: Replace with real data fetching
  const stats = mockStats
  const recentSubmissions = mockRecentSubmissions

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Admin Overview</h1>
        <p className="text-sm text-zinc-400">Manage campaigns and review submissions</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Total Users" value={stats.users} icon={Users} />
        <StatsCard label="Campaigns" value={stats.campaigns} icon={Target} />
        <StatsCard label="Submissions" value={stats.submissions} icon={FileCheck} />
        <StatsCard label="Pending Review" value={stats.pending} icon={Clock} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pending Submissions</CardTitle>
            <Link
              href="/admin/submissions"
              className="text-xs text-emerald-400 hover:text-emerald-300"
            >
              View all
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {!recentSubmissions || recentSubmissions.length === 0 ? (
            <p className="py-4 text-center text-sm text-zinc-400">
              No pending submissions
            </p>
          ) : (
            <div className="space-y-2">
              {recentSubmissions.map((submission) => (
                <Link
                  key={submission.id}
                  href={`/admin/submissions/${submission.id}`}
                  className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 transition-colors hover:border-zinc-700"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {submission.campaign?.title}
                    </p>
                    <p className="text-xs text-zinc-400">
                      by {submission.user?.full_name || submission.user?.email}
                    </p>
                  </div>
                  <span className="text-xs text-amber-400">Review</span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
