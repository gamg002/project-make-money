'use client'

import { createContext, useContext, useEffect, useState, useMemo, useCallback, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

interface Profile {
  id: string
  email: string | null
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  facebook?: string | null
  line?: string | null
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<Profile | null>
  updateProfile: (updates: Partial<Profile>) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => null,
  updateProfile: async () => false,
})

// Helper functions สำหรับ localStorage
const PROFILE_STORAGE_KEY = 'realestate_profile'
const PROFILE_TIMESTAMP_KEY = 'realestate_profile_timestamp'
const PROFILE_CACHE_DURATION = 30 * 60 * 1000 // 30 minutes - เก็บ cache นานขึ้น

const getCachedProfile = (userId: string): Profile | null => {
  if (typeof window === 'undefined') return null
  
  try {
    const cached = localStorage.getItem(PROFILE_STORAGE_KEY)
    const timestamp = localStorage.getItem(PROFILE_TIMESTAMP_KEY)
    
    if (!cached || !timestamp) return null
    
    const cachedProfile = JSON.parse(cached)
    const cacheTime = parseInt(timestamp, 10)
    const now = Date.now()
    
    // ตรวจสอบว่าเป็น profile ของ user เดียวกันและยังไม่หมดอายุ
    if (cachedProfile.id === userId && (now - cacheTime) < PROFILE_CACHE_DURATION) {
      return cachedProfile as Profile
    }
    
    // ถ้าหมดอายุหรือไม่ใช่ user เดียวกัน ให้ลบ cache
    localStorage.removeItem(PROFILE_STORAGE_KEY)
    localStorage.removeItem(PROFILE_TIMESTAMP_KEY)
    return null
  } catch (err) {
    console.warn('Error reading cached profile:', err)
    return null
  }
}

const setCachedProfile = (profile: Profile | null) => {
  if (typeof window === 'undefined') return
  
  try {
    if (profile) {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile))
      localStorage.setItem(PROFILE_TIMESTAMP_KEY, Date.now().toString())
    } else {
      localStorage.removeItem(PROFILE_STORAGE_KEY)
      localStorage.removeItem(PROFILE_TIMESTAMP_KEY)
    }
  } catch (err) {
    console.warn('Error caching profile:', err)
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  
  // ใช้ useMemo เพื่อไม่ให้สร้าง client ใหม่ทุกครั้ง
  const supabase = useMemo(() => createClient(), [])

  const fetchProfile = useCallback(async (userId: string, userEmail?: string, forceSync = false) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        // ถ้ายังไม่มี profile ให้สร้างใหม่
        if (error.code === 'PGRST116') {
          try {
            // ลองดึง user metadata เพื่อหา full_name
            const { data: { user } } = await supabase.auth.getUser()
            const metadataName = user?.user_metadata?.full_name
            
            // ใช้ full_name จาก metadata หรือจาก email
            const fullName = metadataName || (userEmail ? userEmail.split('@')[0] : null)
            
            const { data: newProfile, error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: userId,
                email: userEmail || null,
                full_name: fullName,
              })
              .select()
              .single()

            if (insertError) {
              console.error('Error creating profile:', insertError)
              // ถ้าสร้าง profile ไม่ได้ ให้ throw error เพื่อให้ component จัดการ
              throw new Error('ไม่สามารถสร้างข้อมูลผู้ใช้ได้')
            }

            console.log('Profile created successfully:', newProfile)
            return newProfile as Profile | null
          } catch (insertErr) {
            console.error('Error creating profile:', insertErr)
            // Throw error เพื่อให้ component จัดการ
            throw new Error('ไม่สามารถโหลดข้อมูลผู้ใช้ได้')
          }
        }
        // ถ้า error อื่นๆ ให้ throw error
        throw new Error('ไม่สามารถโหลดข้อมูลผู้ใช้ได้')
      }

      // อัปเดต email และ full_name เฉพาะเมื่อจำเป็น (forceSync = true หรือยังไม่มีข้อมูล)
      if (data && userEmail && forceSync) {
        const updates: { email?: string; full_name?: string } = {}
        
        // Sync email เฉพาะเมื่อไม่ตรงกันและจำเป็นต้อง sync
        if (data.email !== userEmail) {
          updates.email = userEmail
        }
        
        // ถ้ายังไม่มี full_name ให้ใช้จาก user metadata หรือจาก email
        if (!data.full_name || data.full_name.trim() === '') {
          // ลองดึงจาก user metadata ก่อน
          const { data: { user } } = await supabase.auth.getUser()
          const metadataName = user?.user_metadata?.full_name
          
          if (metadataName) {
            updates.full_name = metadataName
          } else {
            // ถ้าไม่มี metadata ให้ใช้ส่วนก่อน @ ของ email
            updates.full_name = userEmail.split('@')[0]
          }
        }
        
        if (Object.keys(updates).length > 0) {
          const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single()

          if (updateError) {
            console.warn('Error updating profile:', updateError)
            return data as Profile | null
          }

          return updatedProfile as Profile | null
        }
      }

      return data as Profile | null
    } catch (err) {
      console.error('Error fetching profile:', err)
      // Throw error เพื่อให้ component จัดการ
      throw err
    }
  }, [supabase])

  useEffect(() => {
    // ตั้ง timeout เพื่อป้องกันการค้าง
    const timeoutId = setTimeout(() => {
      console.warn('AuthContext - Init timeout, setting loading to false')
      setLoading(false)
    }, 5000) // 5 seconds timeout

    // ตรวจสอบ session ปัจจุบัน
    const initAuth = async () => {
      try {
        console.log('AuthContext - Initializing auth...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          setLoading(false)
          clearTimeout(timeoutId)
          return
        }

        if (session) {
          console.log('AuthContext - Session found:', session.user.id)
          setSession(session)
          setUser(session.user)
          
          // ลองโหลด profile จาก cache ก่อน
          const cachedProfile = getCachedProfile(session.user.id)
          if (cachedProfile) {
            console.log('AuthContext - Using cached profile (init)')
            setProfile(cachedProfile)
            setLoading(false)
            clearTimeout(timeoutId)
            
            // ไม่ต้อง fetch ใหม่ใน background เพราะ cache ยังไม่หมดอายุ
            // จะ fetch ใหม่เฉพาะเมื่อ cache หมดอายุหรือเมื่อมีการอัปเดต
            return
          }
          
          // ถ้าไม่มี cache หรือ cache หมดอายุ ให้ fetch ใหม่
          console.log('AuthContext - Fetching profile from database (no cache)')
          try {
            const profileData = await fetchProfile(session.user.id, session.user.email, true)
            if (!profileData) {
              throw new Error('ไม่พบข้อมูลผู้ใช้')
            }
            setProfile(profileData)
            setCachedProfile(profileData)
            console.log('AuthContext - Profile loaded and cached:', profileData.full_name)
          } catch (err) {
            console.error('AuthContext - Failed to load profile:', err)
            // ลบข้อมูลเก่าและ sign out
            await supabase.auth.signOut()
            setUser(null)
            setSession(null)
            setProfile(null)
            setCachedProfile(null)
            // Redirect ไปหน้า login
            if (typeof window !== 'undefined') {
              window.location.href = '/auth/signin'
            }
          }
        } else {
          console.log('AuthContext - No session found')
          // ลบ cache เมื่อไม่มี session
          setCachedProfile(null)
        }
      } catch (err) {
        console.error('Error initializing auth:', err)
      } finally {
        clearTimeout(timeoutId)
        setLoading(false)
        console.log('AuthContext - Initialization complete')
      }
    }

    initAuth()

    // ฟังการเปลี่ยนแปลง auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      console.log('Auth state changed:', event, session?.user?.id)
      
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        // ใช้ cache ก่อนเสมอ (ถ้ามีและยังไม่หมดอายุ)
        const cachedProfile = getCachedProfile(session.user.id)
        if (cachedProfile) {
          console.log('AuthContext - Using cached profile for event:', event)
          setProfile(cachedProfile)
          // ไม่ต้อง fetch ใหม่ถ้ามี cache ที่ยังไม่หมดอายุ
          // ยกเว้น USER_UPDATED ที่ต้อง fetch ใหม่
          if (event === 'USER_UPDATED') {
            // Fetch ใหม่ใน background เพื่ออัปเดต cache
            fetchProfile(session.user.id, session.user.email, true)
              .then((freshProfile) => {
                if (freshProfile) {
                  setProfile(freshProfile)
                  setCachedProfile(freshProfile)
                  console.log('AuthContext - Profile updated:', freshProfile.full_name)
                } else {
                  throw new Error('ไม่พบข้อมูลผู้ใช้')
                }
              })
              .catch(async (err) => {
                console.error('AuthContext - Failed to update profile:', err)
                // ลบข้อมูลเก่าและ sign out
                await supabase.auth.signOut()
                setUser(null)
                setSession(null)
                setProfile(null)
                setCachedProfile(null)
                // Redirect ไปหน้า login
                if (typeof window !== 'undefined') {
                  window.location.href = '/auth/signin'
                }
              })
          }
          setLoading(false)
          return
        }
        
        // ถ้าไม่มี cache ให้ fetch ใหม่
        // Fetch profile สำหรับทุก event ที่มี user
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION') {
          // forceSync = true เฉพาะเมื่อ SIGNED_IN หรือ USER_UPDATED
          const forceSync = event === 'SIGNED_IN' || event === 'USER_UPDATED'
          console.log('AuthContext - Fetching profile for event:', event, '(no cache)')
          try {
            const profileData = await fetchProfile(session.user.id, session.user.email, forceSync)
            if (!profileData) {
              throw new Error('ไม่พบข้อมูลผู้ใช้')
            }
            setProfile(profileData)
            setCachedProfile(profileData)
            console.log('AuthContext - Profile loaded and cached:', profileData.full_name)
          } catch (err) {
            console.error('AuthContext - Failed to load profile:', err)
            // ลบข้อมูลเก่าและ sign out
            await supabase.auth.signOut()
            setUser(null)
            setSession(null)
            setProfile(null)
            setCachedProfile(null)
            // Redirect ไปหน้า login
            if (typeof window !== 'undefined') {
              window.location.href = '/auth/signin'
            }
          }
        }
        // ถ้าเป็น TOKEN_REFRESHED หรือ events อื่นๆ และไม่มี cache ให้ fetch
        else if (event === 'TOKEN_REFRESHED' || !profile) {
          console.log('AuthContext - Fetching profile for event:', event, '(no cache)')
          try {
            const profileData = await fetchProfile(session.user.id, session.user.email, false)
            if (!profileData) {
              throw new Error('ไม่พบข้อมูลผู้ใช้')
            }
            setProfile(profileData)
            setCachedProfile(profileData)
          } catch (err) {
            console.error('AuthContext - Failed to load profile:', err)
            // ลบข้อมูลเก่าและ sign out
            await supabase.auth.signOut()
            setUser(null)
            setSession(null)
            setProfile(null)
            setCachedProfile(null)
            // Redirect ไปหน้า login
            if (typeof window !== 'undefined') {
              window.location.href = '/auth/signin'
            }
          }
        }
      } else {
        setProfile(null)
        setCachedProfile(null)
      }

      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile])

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      setProfile(null)
      // ลบ profile cache จาก localStorage เมื่อ logout
      if (typeof window !== 'undefined') {
        localStorage.removeItem(PROFILE_STORAGE_KEY)
        localStorage.removeItem(PROFILE_TIMESTAMP_KEY)
      }
      // ใช้ window.location เพื่อให้แน่ใจว่า cookies ถูกลบ
      window.location.href = '/'
    } catch (error) {
      console.error('Error signing out:', error)
      // แม้ว่าจะมี error ก็ยังต้องลบ cache
      if (typeof window !== 'undefined') {
        localStorage.removeItem(PROFILE_STORAGE_KEY)
        localStorage.removeItem(PROFILE_TIMESTAMP_KEY)
      }
      window.location.href = '/'
    }
  }, [supabase])

  const refreshProfile = useCallback(async (force = false) => {
    // ตรวจสอบ user จาก session ถ้ายังไม่มี user
    let currentUser = user
    if (!currentUser) {
      const { data: { user: sessionUser } } = await supabase.auth.getUser()
      currentUser = sessionUser
    }
    
    if (currentUser) {
      // ตรวจสอบ cache ก่อน (ถ้าไม่ force)
      if (!force) {
        const cachedProfile = getCachedProfile(currentUser.id)
        if (cachedProfile) {
          console.log('AuthContext - Using cached profile (refreshProfile)')
          setProfile(cachedProfile)
          return cachedProfile
        }
      }
      
      console.log('AuthContext - Refreshing profile for user:', currentUser.id, force ? '(forced)' : '')
      // forceSync = true เมื่อ refresh เพื่อให้แน่ใจว่าข้อมูลล่าสุด
      try {
        const profileData = await fetchProfile(currentUser.id, currentUser.email, true)
        if (!profileData) {
          throw new Error('ไม่พบข้อมูลผู้ใช้')
        }
        setProfile(profileData)
        setCachedProfile(profileData)
        console.log('AuthContext - Profile refreshed and cached:', profileData.full_name || profileData.email)
        return profileData
      } catch (err) {
        console.error('AuthContext - Failed to refresh profile:', err)
        // ลบข้อมูลเก่าและ sign out
        await supabase.auth.signOut()
        setUser(null)
        setSession(null)
        setProfile(null)
        setCachedProfile(null)
        // Redirect ไปหน้า login
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/signin'
        }
        return null
      }
    }
    console.warn('AuthContext - No user found for refreshProfile')
    return null
  }, [user, fetchProfile, supabase])

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!user) {
      return false
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating profile:', error)
        return false
      }

      // อัปเดต state และ cache ทันที
      const updatedProfile = data as Profile
      setProfile(updatedProfile)
      setCachedProfile(updatedProfile)
      return true
    } catch (err) {
      console.error('Error updating profile:', err)
      return false
    }
  }, [user, supabase])

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signOut,
        refreshProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

