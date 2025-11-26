'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function DashboardClientWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // ตรวจสอบ user ใน client-side พร้อม retry logic
    const checkUser = async (retries = 5) => {
      for (let i = 0; i < retries; i++) {
        try {
          // ลอง refresh session ก่อน
          if (i > 0) {
            await supabase.auth.refreshSession()
          }
          
          const { data: { user }, error } = await supabase.auth.getUser()
          
          if (user && !error) {
            console.log('DashboardClientWrapper - User found:', user.id)
            setUser(user)
            setLoading(false)
            return
          }

          // ถ้ายังไม่มี user และยังมี retry อยู่ ให้รอแล้วลองใหม่
          if (i < retries - 1) {
            await new Promise(resolve => setTimeout(resolve, 200))
          }
        } catch (err) {
          console.warn('Error checking user:', err)
          if (i < retries - 1) {
            await new Promise(resolve => setTimeout(resolve, 200))
          }
        }
      }

      // ถ้าลองครบแล้วยังไม่มี user ให้ redirect
      console.log('DashboardClientWrapper - No user after retries, redirecting')
      setLoading(false)
      // ใช้ setTimeout เพื่อให้ UI แสดงก่อน redirect
      setTimeout(() => {
        router.push('/auth/signin?redirect=/dashboard')
      }, 1000)
    }

    checkUser()

    // ฟังการเปลี่ยนแปลง auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: string, session: any) => {
      console.log('DashboardClientWrapper - Auth state changed:', event)
      if (session?.user) {
        setUser(session.user)
        setLoading(false)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setLoading(false)
        router.push('/auth/signin?redirect=/dashboard')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  // ถ้ายัง loading ให้แสดง loading state แต่ไม่ block children
  // เพื่อให้ server-side component render ได้
  if (loading && !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">กำลังตรวจสอบการเข้าสู่ระบบ...</p>
        </div>
      </div>
    )
  }

  // ถ้าไม่มี user หลังจาก loading เสร็จ ให้ redirect
  if (!user && !loading) {
    console.log('DashboardClientWrapper - No user after loading, redirecting')
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-gray-600 mb-4">ไม่พบข้อมูลผู้ใช้</p>
          <p className="text-sm text-gray-500">กำลัง redirect ไปหน้า login...</p>
        </div>
      </div>
    )
  }

  // ถ้ามี user หรือยัง loading (แต่มี children จาก server) ให้แสดง children
  console.log('DashboardClientWrapper - Rendering children, user:', user?.id || 'checking...')
  return <>{children}</>
}

