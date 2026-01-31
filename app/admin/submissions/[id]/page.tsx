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

// Mock data - will be replaced with real data fetching later
const mockSubmissions: Record<string, SubmissionDetails> = {
  '1': {
    id: '1',
    status: 'pending',
    admin_notes: null,
    points_awarded: 0,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    reviewed_at: null,
    user: { email: 'alice@example.com', full_name: 'Alice Johnson' },
    campaign: { title: 'Test Checkout Flow', points_reward: 50, target_url: 'https://demo.example.com/shop' },
    recording_path: 'recordings/demo1.webm',
    recording_duration: 145,
  },
  '2': {
    id: '2',
    status: 'pending',
    admin_notes: null,
    points_awarded: 0,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    reviewed_at: null,
    user: { email: 'bob@example.com', full_name: 'Bob Smith' },
    campaign: { title: 'Search Functionality Test', points_reward: 30, target_url: 'https://demo.example.com/search' },
    recording_path: 'recordings/demo2.webm',
    recording_duration: 98,
  },
  '3': {
    id: '3',
    status: 'pending',
    admin_notes: null,
    points_awarded: 0,
    created_at: new Date(Date.now() - 10800000).toISOString(),
    reviewed_at: null,
    user: { email: 'carol@example.com', full_name: 'Carol Williams' },
    campaign: { title: 'User Registration Flow', points_reward: 40, target_url: 'https://demo.example.com/register' },
    recording_path: 'recordings/demo3.webm',
    recording_duration: 67,
  },
  '4': {
    id: '4',
    status: 'approved',
    admin_notes: 'Great job completing the checkout flow!',
    points_awarded: 50,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    reviewed_at: new Date(Date.now() - 43200000).toISOString(),
    user: { email: 'dave@example.com', full_name: 'Dave Miller' },
    campaign: { title: 'Test Checkout Flow', points_reward: 50, target_url: 'https://demo.example.com/shop' },
    recording_path: 'recordings/demo4.webm',
    recording_duration: 120,
  },
  '5': {
    id: '5',
    status: 'rejected',
    admin_notes: 'Recording was incomplete - did not finish the search task.',
    points_awarded: 0,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    reviewed_at: new Date(Date.now() - 86400000).toISOString(),
    user: { email: 'eve@example.com', full_name: 'Eve Davis' },
    campaign: { title: 'Search Functionality Test', points_reward: 30, target_url: 'https://demo.example.com/search' },
    recording_path: 'recordings/demo5.webm',
    recording_duration: 45,
  },
}

export default async function SubmissionReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // TODO: Replace with real data fetching
  const submission = mockSubmissions[id]

  if (!submission) {
    notFound()
  }

  // Mock video URL - in real implementation this would be a signed URL from storage
  const videoUrl = null // Video playback disabled until storage is re-added

  return (
    <SubmissionReview
      submission={submission}
      videoUrl={videoUrl}
    />
  )
}
