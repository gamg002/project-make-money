'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { User, Mail, Phone, Save, Lock, ArrowLeft, Facebook, MessageCircle } from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const { user, profile, loading: authLoading, updateProfile } = useAuth()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    facebook: '',
    line: '',
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin?redirect=/settings')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        email: user?.email || profile.email || '',
        facebook: (profile as any).facebook || '',
        line: (profile as any).line || '',
      })
    }
  }, [profile, user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError(null)
    setSuccess(null)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
    setError(null)
    setSuccess(null)
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const updates: { full_name?: string; phone?: string | null; facebook?: string | null; line?: string | null } = {}
      
      if (formData.full_name.trim() !== (profile?.full_name || '')) {
        updates.full_name = formData.full_name.trim()
      }
      
      if (formData.phone.trim() !== (profile?.phone || '')) {
        updates.phone = formData.phone.trim() || null
      }
      
      if (formData.facebook.trim() !== ((profile as any)?.facebook || '')) {
        updates.facebook = formData.facebook.trim() || null
      }
      
      if (formData.line.trim() !== ((profile as any)?.line || '')) {
        updates.line = formData.line.trim() || null
      }

      if (Object.keys(updates).length === 0) {
        setError(t('settings.noChanges') || 'No changes to update')
        setSaving(false)
        return
      }

      const success = await updateProfile(updates)
      
      if (success) {
        setSuccess(t('settings.successMessage'))
        // ไม่ต้อง refreshProfile() เพราะ updateProfile() อัปเดต state แล้ว
      } else {
        setError(t('settings.errorMessage'))
      }
    } catch (err) {
      console.error('Error updating profile:', err)
      setError(t('settings.errorMessage'))
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      if (!passwordData.currentPassword || !passwordData.newPassword) {
        setError(t('settings.passwordRequired') || 'Please enter current and new password')
        setSaving(false)
        return
      }

      if (passwordData.newPassword.length < 6) {
        setError(t('settings.passwordTooShort'))
        setSaving(false)
        return
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError(t('settings.passwordMismatch'))
        setSaving(false)
        return
      }

      // ตรวจสอบรหัสผ่านปัจจุบัน
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: passwordData.currentPassword,
      })

      if (signInError) {
        setError(t('settings.currentPasswordIncorrect') || 'Current password is incorrect')
        setSaving(false)
        return
      }

      // เปลี่ยนรหัสผ่าน
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      })

      if (updateError) {
        setError(t('settings.errorMessage') + ': ' + updateError.message)
        setSaving(false)
        return
      }

      setSuccess(t('settings.passwordChanged') || 'Password changed successfully')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (err) {
      console.error('Error changing password:', err)
      setError(t('settings.errorMessage'))
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // จะ redirect โดย useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="flex items-center text-primary-600 hover:text-primary-700 font-medium mb-4 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('settings.back')} {t('nav.dashboard')}
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
          {t('settings.title')}
        </h1>
        <p className="text-gray-600 mt-2">{t('settings.subtitle') || 'Manage your account information and security'}</p>
      </div>

      {/* ข้อความแจ้งเตือน */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 shadow-soft animate-fade-in">
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

      {success && (
        <div className="bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg mb-6 shadow-soft animate-fade-in">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{success}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* ข้อมูลส่วนตัว */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-soft p-6 border border-purple-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <div className="p-2 rounded-lg gradient-purple-light mr-3">
              <User className="w-5 h-5 text-primary-600" />
            </div>
            {t('settings.profile')}
          </h2>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="pl-10 w-full px-4 py-3 border-2 border-purple-100 rounded-xl bg-purple-50 text-gray-500 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">{t('settings.emailCannotChange') || 'Email cannot be changed'}</p>
            </div>

            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.fullName')} *
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
                  className="pl-10 w-full px-4 py-3 border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
                  placeholder={t('auth.fullName')}
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.phone')}
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="pl-10 w-full px-4 py-3 border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
                  placeholder={t('auth.phone') || 'Phone number'}
                />
              </div>
            </div>

            <div>
              <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-2">
                {t('settings.facebook')}
              </label>
              <div className="relative">
                <Facebook className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="facebook"
                  name="facebook"
                  type="url"
                  value={formData.facebook}
                  onChange={handleInputChange}
                  className="pl-10 w-full px-4 py-3 border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
                  placeholder={t('settings.facebookPlaceholder')}
                />
              </div>
              {formData.facebook && (
                <div className="mt-2">
                  <a
                    href={formData.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 text-sm flex items-center space-x-1 transition-colors duration-200"
                  >
                    <Facebook className="w-4 h-4" />
                    <span>{t('settings.openLink')} {t('settings.facebook')}</span>
                  </a>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="line" className="block text-sm font-medium text-gray-700 mb-2">
                {t('settings.line')}
              </label>
              <div className="relative">
                <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="line"
                  name="line"
                  type="url"
                  value={formData.line}
                  onChange={handleInputChange}
                  className="pl-10 w-full px-4 py-3 border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
                  placeholder={t('settings.linePlaceholder')}
                />
              </div>
              {formData.line && (
                <div className="mt-2">
                  <a
                    href={formData.line}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 text-sm flex items-center space-x-1 transition-colors duration-200"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{t('settings.openLink')} {t('settings.line')}</span>
                  </a>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gradient-purple text-white px-6 py-3 rounded-xl hover:shadow-glow transition-all duration-300 hover-lift font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? t('settings.loading') : t('settings.save')}
              </button>
            </div>
          </form>
        </div>

        {/* เปลี่ยนรหัสผ่าน */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-soft p-6 border border-purple-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <div className="p-2 rounded-lg gradient-purple-light mr-3">
              <Lock className="w-5 h-5 text-primary-600" />
            </div>
            {t('settings.password')}
          </h2>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                {t('settings.currentPassword')} *
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                required
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-3 border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
                placeholder={t('settings.currentPassword')}
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                {t('settings.newPassword')} *
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                minLength={6}
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-3 border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
                placeholder={t('settings.passwordTooShort')}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                {t('settings.confirmPassword')} *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={6}
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-3 border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
                placeholder={t('settings.confirmPassword')}
              />
            </div>

            <div className="flex items-center space-x-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gradient-purple text-white px-6 py-3 rounded-xl hover:shadow-glow transition-all duration-300 hover-lift font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
              >
                <Lock className="w-4 h-4 mr-2" />
                {saving ? t('settings.loading') : t('settings.password')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

