'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Monitor, LayoutDashboard, Target, Trophy, LogOut, Shield } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const userLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/campaigns', label: 'Campaigns', icon: Target },
  { href: '/dashboard/leaderboard', label: 'Leaderboard', icon: Trophy },
]

// Mock profile - will be replaced with real auth later
const mockProfile = {
  full_name: 'Demo User',
  email: 'demo@example.com',
  avatar_url: null,
  total_points: 0,
  role: 'admin' as const, // Show admin link for now
}

export function Nav() {
  const pathname = usePathname()

  return (
    <nav className="fixed left-0 top-0 z-40 flex h-screen w-56 flex-col border-r border-zinc-800 bg-zinc-950">
      <div className="flex items-center gap-2 border-b border-zinc-800 p-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
          <Monitor className="h-4 w-4 text-emerald-500" />
        </div>
        <span className="font-semibold text-white">ScreenQuest</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-1">
          {userLinks.map((link) => {
            const isActive = link.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            )
          })}
        </div>

        {mockProfile.role === 'admin' && (
          <div className="mt-6">
            <p className="mb-2 px-3 text-xs font-medium uppercase text-zinc-500">Admin</p>
            <Link
              href="/admin"
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                pathname.startsWith('/admin')
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
              )}
            >
              <Shield className="h-4 w-4" />
              Admin Panel
            </Link>
          </div>
        )}
      </div>

      <div className="border-t border-zinc-800 p-3">
        <div className="mb-2 flex items-center gap-2 px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-700 text-xs font-medium text-white">
            {mockProfile.full_name?.[0] || '?'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-white">
              {mockProfile.full_name || 'User'}
            </p>
            <p className="truncate text-xs text-zinc-400">
              {mockProfile.total_points || 0} pts
            </p>
          </div>
        </div>
        <button
          disabled
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-500 cursor-not-allowed"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </nav>
  )
}
