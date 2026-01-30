import { createClient } from '@/lib/supabase/server'
import { StatsCard } from '@/components/dashboard/stats-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Target, FileCheck, Clock } from 'lucide-react'
import Link from 'next/link'

export default async function AdminPage() {
  const supabase = await createClient()

  const [usersResult, campaignsResult, submissionsResult, pendingResult] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact' }),
    supabase.from('campaigns').select('id', { count: 'exact' }),
    supabase.from('submissions').select('id', { count: 'exact' }),
    supabase.from('submissions').select('id', { count: 'exact' }).eq('status', 'pending'),
  ])

  const stats = {
    users: usersResult.count || 0,
    campaigns: campaignsResult.count || 0,
    submissions: submissionsResult.count || 0,
    pending: pendingResult.count || 0,
  }

  const { data } = await supabase
    .from('submissions')
    .select('*, user:profiles!submissions_user_id_fkey(email, full_name), campaign:campaigns!submissions_campaign_id_fkey(title)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(5)

  const recentSubmissions = (data || []) as Array<{
    id: string
    campaign: { title: string } | null
    user: { email: string; full_name: string | null } | null
  }>

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
                      {(submission.campaign as any)?.title}
                    </p>
                    <p className="text-xs text-zinc-400">
                      by {(submission.user as any)?.full_name || (submission.user as any)?.email}
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
