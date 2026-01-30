import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { SubmissionReview } from './SubmissionReview'

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

export default async function SubmissionReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('submissions')
    .select('*, user:profiles!submissions_user_id_fkey(email, full_name), campaign:campaigns!submissions_campaign_id_fkey(title, points_reward, target_url)')
    .eq('id', id)
    .single()

  if (!data) {
    notFound()
  }

  const submission = data as unknown as SubmissionDetails

  // Generate signed URL server-side
  const { data: urlData } = await supabase.storage
    .from('recordings')
    .createSignedUrl(submission.recording_path, 3600)

  return (
    <SubmissionReview
      submission={submission}
      videoUrl={urlData?.signedUrl || null}
    />
  )
}
