'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { LogIn, Mail, Lock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const { user, profile, loading: authLoading, refreshProfile } = useAuth()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  // ถ้า login แล้วและ profile โหลดเสร็จแล้วให้ redirect
  useEffect(() => {
    if (!authLoading && user && profile && isVerifying) {
      // ตรวจสอบว่า profile มีข้อมูลจริงๆ (ไม่ใช่ null หรือ empty)
      if (profile.id && (profile.full_name || profile.email)) {
        console.log('SignIn - Profile ready, redirecting:', profile.full_name || profile.email)
        const redirect = searchParams.get('redirect') || '/dashboard'
        // ใช้ setTimeout เล็กน้อยเพื่อให้ UI update ก่อน redirect
        setTimeout(() => {
          window.location.href = redirect
        }, 100)
      } else {
        console.warn('SignIn - Profile not ready yet:', profile)
      }
    }
  }, [user, profile, authLoading, isVerifying, searchParams])

  // ตั้ง timeout สำหรับกรณีที่ profile โหลดช้าเกินไป
  useEffect(() => {
    if (isVerifying) {
      const timeoutId = setTimeout(() => {
        if (!profile) {
          setError('ไม่สามารถโหลดข้อมูลโปรไฟล์ได้ กรุณาลองอีกครั้ง')
          setLoading(false)
          setIsVerifying(false)
        }
      }, 5000) // 5 seconds

      return () => clearTimeout(timeoutId)
    }
  }, [isVerifying, profile])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setIsVerifying(false)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        setIsVerifying(false)
        return
      }

      if (data.user && data.session) {
        // เริ่มขั้นตอนการตรวจสอบ
        setIsVerifying(true)
        setLoading(true)
        
        try {
          // Refresh session เพื่อให้แน่ใจว่า cookies ถูกตั้งค่า
          await supabase.auth.refreshSession()
        } catch (refreshError) {
          console.warn('Session refresh warning:', refreshError)
        }
        
        // รอให้ AuthContext โหลด profile
        // ใช้ refreshProfile เพื่อให้แน่ใจว่า profile โหลดเสร็จ
        try {
          const refreshedProfile = await refreshProfile()
          console.log('SignIn - Profile refreshed:', refreshedProfile?.full_name)
          
          if (refreshedProfile && refreshedProfile.id) {
            // Profile โหลดเสร็จแล้ว รอให้ AuthContext update state
            await new Promise(resolve => setTimeout(resolve, 500))
            // useEffect จะตรวจสอบ profile และ redirect ให้เอง
          } else {
            // ถ้ายังไม่มี profile ให้รอ (polling)
            // ใช้ refreshProfile อีกครั้งเพื่อให้แน่ใจ
            console.log('SignIn - Profile not found, retrying...')
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            const retryProfile = await refreshProfile()
            if (retryProfile && retryProfile.id) {
              console.log('SignIn - Profile found after retry:', retryProfile.full_name)
              await new Promise(resolve => setTimeout(resolve, 500))
            } else {
              setError(t('auth.profileError'))
              setLoading(false)
              setIsVerifying(false)
              return
            }
          }
        } catch (refreshError) {
          console.warn('SignIn - Error refreshing profile:', refreshError)
          setError(t('auth.profileError'))
          setLoading(false)
          setIsVerifying(false)
          return
        }
        
        // useEffect จะตรวจสอบ profile และ redirect ให้เอง
      } else if (data.user && !data.session) {
        // ถ้ามี user แต่ไม่มี session
        setError(t('auth.loading'))
        setIsVerifying(true)
        setLoading(true)
        
        // รอ session
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // ตรวจสอบ session อีกครั้ง
        const { data: { session: newSession } } = await supabase.auth.getSession()
        if (newSession) {
          setIsVerifying(true)
          // รอให้ AuthContext โหลด profile
          // useEffect จะ redirect ให้เอง
        } else {
          setError(t('auth.error'))
          setLoading(false)
          setIsVerifying(false)
        }
      } else {
        setError(t('auth.error'))
        setLoading(false)
        setIsVerifying(false)
      }
    } catch (err) {
      console.error('Login error:', err)
      setError(t('auth.error'))
      setLoading(false)
      setIsVerifying(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        <div>
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-2xl gradient-purple shadow-glow">
              <LogIn className="w-12 h-12 text-white" />
            </div>
          </div>
          <h2 className="text-center text-4xl font-extrabold bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 bg-clip-text text-transparent">
            {t('auth.signIn')}
          </h2>
          <p className="mt-3 text-center text-sm text-gray-600">
            {t('auth.noAccount')}{' '}
            <Link
              href="/auth/signup"
              className="font-medium text-primary-600 hover:text-primary-700 transition-colors duration-200"
            >
              {t('auth.signUpLink')}
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6 bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-soft border border-purple-100" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg shadow-soft animate-fade-in">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          {(loading || isVerifying) && (
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 text-blue-700 px-4 py-3 rounded-lg shadow-soft animate-fade-in">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-medium">
                  {isVerifying ? t('auth.verifying') : t('auth.loading')}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10 w-full px-4 py-3 border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white hover:border-primary-300"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 w-full px-4 py-3 border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white hover:border-primary-300"
                  placeholder={t('auth.password')}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                href="/auth/forgot-password"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                {t('auth.forgotPassword') || 'Forgot Password?'}
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || isVerifying}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-soft text-sm font-semibold text-white gradient-purple hover:shadow-glow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all duration-300 hover-lift"
            >
              {isVerifying ? (
                <span className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{t('auth.verifying')}</span>
                </span>
              ) : loading ? (
                t('auth.loading')
              ) : (
                t('auth.submit')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  )
}

