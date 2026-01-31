import { StatusBadge } from '@/components/ui/badge'
import { formatRelativeTime } from '@/lib/utils/format'
import { Submission, Campaign } from '@/lib/types'
import { Video, Clock, Star } from 'lucide-react'

interface SubmissionCardProps {
  submission: Submission & { campaign?: Campaign }
}

export function SubmissionCard({ submission }: SubmissionCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800">
        <Video className="h-5 w-5 text-zinc-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-white">
          {submission.campaign?.title || 'Campaign'}
        </p>
        <div className="mt-0.5 flex items-center gap-3 text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatRelativeTime(submission.created_at)}
          </span>
          {submission.points_awarded > 0 && (
            <span className="flex items-center gap-1 text-emerald-400">
              <Star className="h-3 w-3" />
              +{submission.points_awarded} pts
            </span>
          )}
        </div>
      </div>
      <StatusBadge status={submission.status} />
    </div>
  )
}
