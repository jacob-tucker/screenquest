'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/lib/supabase/types'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        const { data, error } = await (supabase
          .from('profiles') as any)
          .select('*')
          .eq('id', session.user.id)
          .single()

        console.log('Profile fetch:', { data, error, userId: session.user.id })

        // Use profile from DB, fallback to user metadata for avatar/name
        const userMeta = session.user.user_metadata
        const profileData = data ? (data as Profile) : {
          id: session.user.id,
          email: session.user.email || '',
          full_name: userMeta?.full_name || userMeta?.name || null,
          avatar_url: userMeta?.avatar_url || userMeta?.picture || null,
          role: 'user' as const,
          total_points: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        console.log('Setting profile:', profileData)
        setProfile(profileData)
      }

      setLoading(false)
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          const { data, error } = await (supabase
            .from('profiles') as any)
            .select('*')
            .eq('id', session.user.id)
            .single()

          console.log('Profile fetch (auth change):', { data, error })

          const userMeta = session.user.user_metadata
          const profileData = data ? (data as Profile) : {
            id: session.user.id,
            email: session.user.email || '',
            full_name: userMeta?.full_name || userMeta?.name || null,
            avatar_url: userMeta?.avatar_url || userMeta?.picture || null,
            role: 'user' as const,
            total_points: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
          console.log('Setting profile (auth change):', profileData)
          setProfile(profileData)
        } else {
          setProfile(null)
        }

        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
