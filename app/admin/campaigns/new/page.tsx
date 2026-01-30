'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input, Textarea } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewCampaignPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = e.currentTarget
    const formData = new FormData(form)

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const target_url = formData.get('target_url') as string
    const points_reward = parseInt(formData.get('points_reward') as string, 10)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error: insertError } = await (supabase.from('campaigns') as any).insert({
        title,
        description,
        target_url,
        points_reward,
        created_by: user.id,
      })

      if (insertError) throw insertError

      router.push('/admin/campaigns')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create campaign')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/campaigns"
        className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to campaigns
      </Link>

      <div>
        <h1 className="text-xl font-semibold text-white">New Campaign</h1>
        <p className="text-sm text-zinc-400">Create a new bounty campaign</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="title"
              label="Campaign Title"
              placeholder="e.g., Test checkout flow on Example.com"
              required
            />

            <Textarea
              name="description"
              label="Description"
              placeholder="Describe what users need to do to complete this task..."
              required
            />

            <Input
              name="target_url"
              label="Target URL"
              type="url"
              placeholder="https://example.com"
              required
            />

            <Input
              name="points_reward"
              label="Points Reward"
              type="number"
              min={1}
              defaultValue={10}
              required
            />

            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Campaign'}
              </Button>
              <Link href="/admin/campaigns">
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
