import { Nav } from '@/components/dashboard/nav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Nav />
      <main className="pl-56">
        <div className="mx-auto max-w-5xl p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
