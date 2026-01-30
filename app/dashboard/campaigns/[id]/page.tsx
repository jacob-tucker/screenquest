'use client'

import { useEffect, useState, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Campaign, Submission, Database } from '@/lib/supabase/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/badge'
import { RecordingProvider, useRecording } from '@/components/recording/recording-provider'
import { RecordingControls } from '@/components/recording/recording-controls'
import { ArrowLeft, Star, ExternalLink, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

function CampaignContent({ campaignId }: { campaignId: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { recordedBlob, isRecording, resetRecording, duration } = useRecording()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [campaignRes, submissionRes] = await Promise.all([
        supabase.from('campaigns').select('*').eq('id', campaignId).single(),
        supabase
          .from('submissions')
          .select('*')
          .eq('campaign_id', campaignId)
          .eq('user_id', user.id)
          .maybeSingle(),
      ])

      setCampaign(campaignRes.data)
      setSubmission(submissionRes.data)
      setLoading(false)
    }

    fetchData()
  }, [campaignId])

  const handleSubmit = async () => {
    if (!recordedBlob || !campaign) return

    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const fileName = `${user.id}/${campaign.id}-${Date.now()}.webm`
      const { error: uploadError } = await supabase.storage
        .from('recordings')
        .upload(fileName, recordedBlob, {
          contentType: 'video/webm',
        })

      if (uploadError) throw uploadError

      const { error: insertError } = await (supabase.from('submissions') as any).insert({
        user_id: user.id,
        campaign_id: campaign.id,
        recording_path: fileName,
        recording_duration: duration,
      })

      if (insertError) throw insertError

      router.push('/dashboard')
    } catch (error) {
      console.error('Submit error:', error)
      alert('Failed to submit recording')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    )
  }

  if (!campaign) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-red-400" />
          <p className="mt-2 text-sm text-zinc-400">Campaign not found</p>
        </CardContent>
      </Card>
    )
  }

  // Already submitted
  if (submission) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard/campaigns"
          className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to campaigns
        </Link>

        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-white">{campaign.title}</h1>
            <StatusBadge status={submission.status} />
          </div>
        </div>

        <Card>
          <CardContent className="py-8 text-center">
            {submission.status === 'approved' ? (
              <>
                <CheckCircle className="mx-auto h-12 w-12 text-emerald-400" />
                <p className="mt-3 text-lg font-medium text-white">Submission Approved!</p>
                <p className="mt-1 text-sm text-zinc-400">
                  You earned {submission.points_awarded} points
                </p>
              </>
            ) : submission.status === 'rejected' ? (
              <>
                <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
                <p className="mt-3 text-lg font-medium text-white">Submission Rejected</p>
                {submission.admin_notes && (
                  <p className="mt-1 text-sm text-zinc-400">{submission.admin_notes}</p>
                )}
              </>
            ) : (
              <>
                <Clock className="mx-auto h-12 w-12 text-amber-400" />
                <p className="mt-3 text-lg font-medium text-white">Submission In Review</p>
                <p className="mt-1 text-sm text-zinc-400">
                  We'll notify you once it's reviewed
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Recording flow
  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/campaigns"
        className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to campaigns
      </Link>

      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-white">{campaign.title}</h1>
          <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
            <Star className="h-3 w-3" />
            {campaign.points_reward} pts
          </div>
        </div>
        <p className="mt-1 text-sm text-zinc-400">{campaign.description}</p>
      </div>

      <Card>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-white">Target Website</h3>
            <a
              href={campaign.target_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300"
            >
              <ExternalLink className="h-3 w-3" />
              {campaign.target_url}
            </a>
          </div>

          <div className="border-t border-zinc-800 pt-4">
            <h3 className="mb-3 text-sm font-medium text-white">Instructions</h3>
            <ol className="list-inside list-decimal space-y-2 text-sm text-zinc-400">
              <li>Click "Start Recording" to begin screen capture</li>
              <li>Navigate to the target website in a new tab</li>
              <li>Complete the required actions on the website</li>
              <li>Return here and click "Stop Recording"</li>
              <li>Preview and submit your recording</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <RecordingControls instruction={campaign.description} />

      {recordedBlob && !isRecording && (
        <Card>
          <CardContent className="space-y-4">
            <h3 className="text-sm font-medium text-white">Preview Recording</h3>
            <video
              src={URL.createObjectURL(recordedBlob)}
              controls
              className="w-full rounded-lg"
            />
            <div className="flex gap-2">
              <Button
                onClick={resetRecording}
                variant="secondary"
                className="flex-1"
              >
                Record Again
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? 'Submitting...' : 'Submit Recording'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function CampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <RecordingProvider>
      <CampaignContent campaignId={id} />
    </RecordingProvider>
  )
}
