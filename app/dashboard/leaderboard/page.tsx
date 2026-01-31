import { Card, CardContent } from '@/components/ui/card'
import { Trophy, Medal, Award } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Profile } from '@/lib/types'

type LeaderboardProfile = Pick<Profile, 'id' | 'full_name' | 'email' | 'avatar_url' | 'total_points'>

// Mock data - will be replaced with real data fetching later
const mockProfiles: LeaderboardProfile[] = [
  { id: '1', full_name: 'Alice Johnson', email: 'alice@example.com', avatar_url: null, total_points: 1250 },
  { id: '2', full_name: 'Bob Smith', email: 'bob@example.com', avatar_url: null, total_points: 980 },
  { id: '3', full_name: 'Carol Williams', email: 'carol@example.com', avatar_url: null, total_points: 875 },
  { id: '4', full_name: 'Demo User', email: 'demo@example.com', avatar_url: null, total_points: 150 },
  { id: '5', full_name: 'Eve Davis', email: 'eve@example.com', avatar_url: null, total_points: 120 },
  { id: '6', full_name: 'Frank Brown', email: 'frank@example.com', avatar_url: null, total_points: 95 },
  { id: '7', full_name: 'Grace Miller', email: 'grace@example.com', avatar_url: null, total_points: 60 },
  { id: '8', full_name: 'Henry Wilson', email: 'henry@example.com', avatar_url: null, total_points: 45 },
]

const mockCurrentUserId = '4' // Demo User

export default async function LeaderboardPage() {
  // TODO: Replace with real data fetching
  const profiles = mockProfiles
  const currentUserRank = profiles.findIndex((p) => p.id === mockCurrentUserId)

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
                    profile.id === mockCurrentUserId && 'bg-emerald-500/5',
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
                    {profile.id === mockCurrentUserId && (
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
