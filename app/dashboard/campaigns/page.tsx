import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { Campaign, Submission } from '@/lib/supabase/types'

export default async function CampaignsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [campaignsResult, submissionsResult] = await Promise.all([
    supabase
      .from('campaigns')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false }),
    supabase
      .from('submissions')
      .select('campaign_id, status')
      .eq('user_id', user!.id),
  ])

  const campaigns = (campaignsResult.data || []) as Campaign[]
  const submissions = (submissionsResult.data || []) as Pick<Submission, 'campaign_id' | 'status'>[]

  const getSubmissionStatus = (campaignId: string) => {
    const submission = submissions.find((s) => s.campaign_id === campaignId)
    return submission?.status
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Campaigns</h1>
        <p className="text-sm text-zinc-400">Complete tasks and earn rewards</p>
      </div>

      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-zinc-400">No active campaigns at the moment</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {campaigns.map((campaign) => {
            const status = getSubmissionStatus(campaign.id)
            const hasSubmitted = !!status

            return (
              <Link key={campaign.id} href={`/dashboard/campaigns/${campaign.id}`}>
                <Card className="h-full transition-colors hover:border-zinc-700">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">{campaign.title}</CardTitle>
                      <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                        <Star className="h-3 w-3" />
                        {campaign.points_reward}
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {campaign.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-zinc-500">
                        <ExternalLink className="h-3 w-3" />
                        <span className="truncate max-w-[150px]">
                          {new URL(campaign.target_url).hostname}
                        </span>
                      </div>
                      {hasSubmitted ? (
                        <Badge
                          variant={
                            status === 'approved'
                              ? 'success'
                              : status === 'rejected'
                              ? 'error'
                              : 'warning'
                          }
                        >
                          {status === 'approved'
                            ? 'Completed'
                            : status === 'rejected'
                            ? 'Rejected'
                            : 'In Review'}
                        </Badge>
                      ) : (
                        <span className="text-emerald-400">Start task</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
