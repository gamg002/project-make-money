'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { UserPlus, Mail, Lock, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'

function SignUpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const { user, profile, loading: authLoading } = useAuth()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
  })

  // ถ้า login แล้วและ profile โหลดเสร็จแล้วให้ redirect
  useEffect(() => {
    if (!authLoading && user && profile && isVerifying) {
      const redirect = searchParams.get('redirect') || '/dashboard'
      setTimeout(() => {
        window.location.href = redirect
      }, 100)
    }
  }, [user, profile, authLoading, isVerifying, searchParams])

  // ตั้ง timeout สำหรับกรณีที่ profile โหลดช้าเกินไป
  useEffect(() => {
    if (isVerifying) {
      const timeoutId = setTimeout(() => {
        if (!profile) {
          setError(t('auth.profileError'))
          setLoading(false)
          setIsVerifying(false)
        }
      }, 5000) // 5 seconds

      return () => clearTimeout(timeoutId)
    }
  }, [isVerifying, profile, t])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    setIsVerifying(false)

    // Validation
    if (!formData.full_name.trim()) {
      setError(t('auth.fullName') + ' ' + t('common.error') || 'กรุณากรอกชื่อ-นามสกุล')
      setLoading(false)
      return
    }

    if (formData.full_name.trim().length < 2) {
      setError(t('auth.fullName') + ' ต้องมีอย่างน้อย 2 ตัวอักษร')
      setLoading(false)
      return
    }

    if (!formData.email.trim()) {
      setError(t('auth.email') + ' ' + t('common.error') || 'กรุณากรอกอีเมล')
      setLoading(false)
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('รูปแบบอีเมลไม่ถูกต้อง')
      setLoading(false)
      return
    }

    if (!formData.password) {
      setError(t('auth.password') + ' ' + t('common.error') || 'กรุณากรอกรหัสผ่าน')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError(t('auth.passwordTooShort'))
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name.trim(),
          },
        },
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
        // useEffect จะตรวจสอบ profile และ redirect ให้เอง
        // ไม่ต้องทำอะไรเพิ่มเติมที่นี่
      } else if (data.user && !data.session) {
        // ถ้ามี user แต่ไม่มี session - อาจเป็นเพราะต้องยืนยันอีเมล
        // ตรวจสอบว่ามี confirmation_sent_at หรือไม่ (อาจอยู่ใน user object หรือ response)
        const userWithConfirmation = data.user as any
        const hasConfirmationSent = userWithConfirmation?.confirmation_sent_at || 
                                   (data as any)?.confirmation_sent_at
        
        if (hasConfirmationSent) {
          // Email confirmation ถูกส่งแล้ว - แสดงข้อความสำเร็จ
          setSuccess(t('auth.emailConfirmationSent') || 'กรุณาตรวจสอบอีเมลของคุณเพื่อยืนยันบัญชี')
          setLoading(false)
          setIsVerifying(false)
          // ล้างฟอร์ม
          setFormData({
            email: '',
            password: '',
            full_name: '',
          })
        } else {
          // ถ้าไม่มี confirmation_sent_at อาจเป็นเพราะ session ยังไม่พร้อม
          // หรือ email confirmation ไม่ได้เปิดใช้งาน
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
            // ถ้ายังไม่มี session และไม่มี confirmation_sent_at 
            // อาจเป็นเพราะ email confirmation ถูกเปิดใช้งาน
            // แสดงข้อความสำเร็จแทน error
            setSuccess(t('auth.emailConfirmationSent') || 'กรุณาตรวจสอบอีเมลของคุณเพื่อยืนยันบัญชี')
            setLoading(false)
            setIsVerifying(false)
            // ล้างฟอร์ม
            setFormData({
              email: '',
              password: '',
              full_name: '',
            })
          }
        }
      }
    } catch (err) {
      console.error('Signup error:', err)
      setError(t('auth.error'))
      setLoading(false)
      setIsVerifying(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <UserPlus className="w-12 h-12 text-primary-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('auth.signUp')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('auth.hasAccount')}{' '}
            <Link
              href="/auth/signin"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              {t('auth.signInLink')}
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          {(loading || isVerifying) && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span>
                  {isVerifying ? t('auth.verifying') : t('auth.loading')}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.fullName')}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={t('auth.fullName')}
                />
              </div>
            </div>

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
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  minLength={6}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={t('auth.passwordTooShort')}
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || isVerifying}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? (
                <span className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{t('auth.verifying')}</span>
                </span>
              ) : loading ? (
                t('auth.loading')
              ) : (
                t('auth.submitSignUp')
              )}
            </button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            {t('auth.terms') || 'By signing up, you agree to our'}{' '}
            <Link href="/terms" className="text-primary-600 hover:underline">
              {t('auth.termsLink') || 'Terms of Service'}
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <SignUpForm />
    </Suspense>
  )
}

