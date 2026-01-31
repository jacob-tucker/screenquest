import { redirect } from 'next/navigation'

export default async function Home() {
  // Auth temporarily removed - redirect to dashboard for now
  redirect('/dashboard')
}
