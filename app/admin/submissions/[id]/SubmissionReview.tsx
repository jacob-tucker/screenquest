'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/badge'
import { VideoPlayer } from '@/components/submissions/video-player'
import { ArrowLeft, User, Target, Star, Check, X, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { formatDateTime } from '@/lib/utils/format'

interface SubmissionDetails {
  id: string
  status: 'pending' | 'approved' | 'rejected'
  admin_notes: string | null
  points_awarded: number
  created_at: string
  reviewed_at: string | null
  user: { email: string; full_name: string | null }
  campaign: { title: string; points_reward: number; target_url: string }
  recording_path: string
  recording_duration: number | null
}

interface SubmissionReviewProps {
  submission: SubmissionDetails
  videoUrl: string | null
}

export function SubmissionReview({ submission, videoUrl }: SubmissionReviewProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [notes, setNotes] = useState(submission.admin_notes || '')

  const handleReview = async (approve: boolean) => {
    setSubmitting(true)
    try {
      // TODO: Implement actual review when auth is re-added
      alert('Review functionality is temporarily disabled. Auth will be re-added later.')
      router.push('/admin/submissions')
    } catch (error) {
      console.error('Review error:', error)
      alert('Failed to update submission')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this submission? This cannot be undone.')) {
      return
    }

    setSubmitting(true)
    try {
      // TODO: Implement actual deletion when auth is re-added
      alert('Delete functionality is temporarily disabled. Auth will be re-added later.')
      router.push('/admin/submissions')
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete submission')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/submissions"
        className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to submissions
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Review Submission</h1>
          <p className="text-sm text-zinc-400">
            Submitted {formatDateTime(submission.created_at)}
          </p>
        </div>
        <StatusBadge status={submission.status} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800">
              <User className="h-5 w-5 text-zinc-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-400">User</p>
              <p className="text-sm text-white">
                {submission.user.full_name || submission.user.email}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800">
              <Target className="h-5 w-5 text-zinc-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-400">Campaign</p>
              <p className="text-sm text-white">{submission.campaign.title}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <Star className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-400">Reward</p>
              <p className="text-sm text-white">{submission.campaign.points_reward} points</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recording</CardTitle>
        </CardHeader>
        <CardContent>
          {videoUrl ? (
            <VideoPlayer
              src={videoUrl}
              className="aspect-video"
              knownDuration={submission.recording_duration || undefined}
            />
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-lg bg-zinc-800">
              <p className="text-sm text-zinc-400">Video playback temporarily unavailable</p>
            </div>
          )}
        </CardContent>
      </Card>

      {submission.status === 'pending' && (
        <Card>
          <CardHeader>
            <CardTitle>Review Decision</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              label="Admin Notes (optional)"
              placeholder="Add notes about your decision..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                onClick={() => handleReview(true)}
                disabled={submitting}
                className="flex-1"
              >
                <Check className="h-4 w-4" />
                Approve
              </Button>
              <Button
                onClick={() => handleReview(false)}
                disabled={submitting}
                variant="danger"
                className="flex-1"
              >
                <X className="h-4 w-4" />
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {submission.status !== 'pending' && submission.admin_notes && (
        <Card>
          <CardHeader>
            <CardTitle>Admin Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-400">{submission.admin_notes}</p>
          </CardContent>
        </Card>
      )}

      <div className="border-t border-zinc-800 pt-6">
        <Button
          onClick={handleDelete}
          disabled={submitting}
          variant="secondary"
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <Trash2 className="h-4 w-4" />
          Delete Submission
        </Button>
      </div>
    </div>
  )
}
