import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if user is admin or owns the submission
  const { data: profileData } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const profile = profileData as { role: string } | null

  const { data: submissionData } = await supabase
    .from('submissions')
    .select('recording_path, user_id')
    .eq('id', id)
    .single()

  const submission = submissionData as { recording_path: string; user_id: string } | null

  if (!submission) {
    return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
  }

  // Only allow access if admin or owner
  if (profile?.role !== 'admin' && submission.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Generate signed URL
  const { data, error } = await supabase.storage
    .from('recordings')
    .createSignedUrl(submission.recording_path, 3600) // 1 hour expiry

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to generate URL' }, { status: 500 })
  }

  return NextResponse.json({ url: data.signedUrl })
}
