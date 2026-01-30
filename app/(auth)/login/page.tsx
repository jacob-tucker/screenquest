import { GoogleSignIn } from '@/components/auth/google-sign-in'
import { Monitor } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
            <Monitor className="h-6 w-6 text-emerald-500" />
          </div>
          <h1 className="text-xl font-semibold text-white">ScreenQuest</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Record screens, earn rewards
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <GoogleSignIn />
          <p className="mt-4 text-center text-xs text-zinc-500">
            By signing in, you agree to our terms and privacy policy
          </p>
        </div>
      </div>
    </div>
  )
}
