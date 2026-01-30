import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Trophy, Medal, Award } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Profile } from '@/lib/supabase/types'

type LeaderboardProfile = Pick<Profile, 'id' | 'full_name' | 'email' | 'avatar_url' | 'total_points'>

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, email, avatar_url, total_points')
    .order('total_points', { ascending: false })
    .limit(50)

  const profiles = (data || []) as LeaderboardProfile[]
  const currentUserRank = profiles.findIndex((p) => p.id === user?.id)

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-5 w-5 text-amber-400" />
    if (index === 1) return <Medal className="h-5 w-5 text-zinc-400" />
    if (index === 2) return <Award className="h-5 w-5 text-amber-600" />
    return <span className="text-sm font-medium text-zinc-500">#{index + 1}</span>
  }

  const getRankBg = (index: number) => {
    if (index === 0) return 'border-amber-500/20 bg-amber-500/5'
    if (index === 1) return 'border-zinc-400/20 bg-zinc-400/5'
    if (index === 2) return 'border-amber-600/20 bg-amber-600/5'
    return ''
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Leaderboard</h1>
        <p className="text-sm text-zinc-400">Top earners on ScreenQuest</p>
      </div>

      {currentUserRank >= 0 && (
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-emerald-400">
                Your rank: #{currentUserRank + 1}
              </span>
            </div>
            <span className="text-sm text-zinc-400">
              {profiles?.[currentUserRank]?.total_points || 0} points
            </span>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {!profiles || profiles.length === 0 ? (
            <div className="py-12 text-center">
              <Trophy className="mx-auto h-8 w-8 text-zinc-600" />
              <p className="mt-2 text-sm text-zinc-400">No rankings yet</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {profiles.map((profile, index) => (
                <div
                  key={profile.id}
                  className={cn(
                    'flex items-center gap-4 px-4 py-3',
                    profile.id === user?.id && 'bg-emerald-500/5',
                    getRankBg(index)
                  )}
                >
                  <div className="flex h-8 w-8 items-center justify-center">
                    {getRankIcon(index)}
                  </div>
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt=""
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-700 text-xs font-medium text-white">
                      {profile.full_name?.[0] || profile.email?.[0] || '?'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {profile.full_name || profile.email?.split('@')[0]}
                    </p>
                    {profile.id === user?.id && (
                      <p className="text-xs text-emerald-400">You</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">
                      {profile.total_points.toLocaleString()}
                    </p>
                    <p className="text-xs text-zinc-500">points</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
