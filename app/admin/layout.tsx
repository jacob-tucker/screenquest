import { AdminNav } from './AdminNav'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // TODO: Re-add auth checks when auth is re-added

  return (
    <div className="min-h-screen bg-zinc-950">
      <AdminNav />

      <main className="pl-56">
        <div className="mx-auto max-w-5xl p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
