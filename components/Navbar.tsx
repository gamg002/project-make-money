'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Home, Plus, User, LogOut, LogIn, UserPlus, ChevronDown, Globe } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { AlertDialog } from '@/components/Modal'
import { createClient } from '@/lib/supabase/client'

export default function Navbar() {
  const router = useRouter()
  const { user, profile, loading, signOut } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const supabase = createClient()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
  const [showError, setShowError] = useState(false)
  const [hasShownError, setHasShownError] = useState(false)
  const profileRef = useRef(profile)

  // ฟังก์ชันสำหรับลบข้อมูลเก่าและ redirect ไปหน้า login (ทำงานเหมือน logout)
  const handleProfileError = async () => {
    try {
      // ทำการ logout แบบเต็มรูปแบบเหมือน signOut() ใน AuthContext
      // แต่ redirect ไปหน้า signin แทนหน้า home
      
      // 1. ลบ session จาก Supabase (เหมือน signOut() ใน AuthContext)
      // เมื่อ signOut จาก Supabase แล้ว AuthContext จะ detect ผ่าน onAuthStateChange
      // และอัปเดต state (user, session, profile) ให้เองอัตโนมัติ
      await supabase.auth.signOut()
      
      // 2. ลบ localStorage cache (เหมือน signOut() ใน AuthContext)
      // ใช้ key เดียวกับ AuthContext: 'realestate_profile' และ 'realestate_profile_timestamp'
      if (typeof window !== 'undefined') {
        localStorage.removeItem('realestate_profile')
        localStorage.removeItem('realestate_profile_timestamp')
      }
      
      // 3. Redirect ไปหน้า login (ใช้ window.location.href เพื่อให้แน่ใจว่า cookies ถูกลบ)
      // AuthContext จะอัปเดต state เองเมื่อ detect ว่า session ถูกลบแล้วผ่าน onAuthStateChange
      // ดังนั้นเราไม่ต้องเรียก signOut() จาก context เพราะมันจะ redirect ไปหน้า home
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/signin'
      }
    } catch (err) {
      console.error('Error clearing data:', err)
      // ถ้ามี error ให้ลบข้อมูลด้วยตนเองและ redirect
      try {
        await supabase.auth.signOut()
      } catch (signOutError) {
        console.error('Error signing out:', signOutError)
      }
      // ลบ localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('realestate_profile')
        localStorage.removeItem('realestate_profile_timestamp')
        // Redirect ไปหน้า login
        window.location.href = '/auth/signin'
      }
    }
  }

  // อัปเดต ref เมื่อ profile เปลี่ยน
  useEffect(() => {
    profileRef.current = profile
  }, [profile])

  // ตรวจสอบว่ามี user แต่ไม่มี profile (หลังจาก loading เสร็จ)
  // รอสักครู่เพื่อให้ profile โหลดเสร็จก่อนแสดง error
  useEffect(() => {
    // ถ้า profile โหลดเสร็จแล้ว ให้ reset error state
    if (profile && hasShownError) {
      setHasShownError(false)
      setShowError(false)
      return
    }

    // ถ้ายังไม่มี profile และ loading เสร็จแล้ว ให้รอสักครู่ก่อนแสดง error
    if (!loading && user && !profile && !hasShownError) {
      // รอ 3 วินาทีเพื่อให้ profile โหลดเสร็จก่อน (สำหรับกรณีที่ต้อง fetch จาก database)
      const timeoutId = setTimeout(() => {
        // ตรวจสอบค่าล่าสุดของ profile จาก ref
        if (!profileRef.current) {
          console.error('Navbar - User logged in but profile is missing after timeout')
          setShowError(true)
          setHasShownError(true)
        }
      }, 3000) // รอ 3 วินาที

      return () => clearTimeout(timeoutId)
    }
  }, [user, profile, loading, hasShownError])

  // ใช้เฉพาะ profile.full_name เท่านั้น ไม่แสดงอีเมล
  // ถ้าไม่มี profile ให้แสดง null แทน 'ผู้ใช้'
  const displayName = profile?.full_name?.trim() || null

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-soft border-b border-purple-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="p-2 rounded-xl gradient-purple shadow-glow group-hover:shadow-glow-lg transition-all duration-300">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              RealEstate
            </span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link
              href="/"
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200 relative group"
            >
              {t('nav.home')}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-primary-700 group-hover:w-full transition-all duration-300"></span>
            </Link>
            
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowLanguageMenu(!showLanguageMenu)
                  setShowUserMenu(false)
                }}
                className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 font-medium px-4 py-2 rounded-xl hover:bg-purple-50 transition-all duration-200"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden md:inline">{language === 'th' ? 'ไทย' : 'English'}</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {showLanguageMenu && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowLanguageMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-soft border border-purple-100 z-40 overflow-hidden animate-fade-in">
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setLanguage('th')
                          setShowLanguageMenu(false)
                        }}
                        className={`w-full text-left px-4 py-3 text-sm flex items-center space-x-3 transition-all duration-200 ${
                          language === 'th' 
                            ? 'bg-gradient-to-r from-primary-50 to-purple-50 text-primary-700 font-semibold' 
                            : 'text-gray-700 hover:bg-purple-50'
                        }`}
                      >
                        <span className="text-lg">🇹🇭</span>
                        <span>{t('nav.language.th')}</span>
                        {language === 'th' && <span className="ml-auto text-primary-600">✓</span>}
                      </button>
                      <button
                        onClick={() => {
                          setLanguage('en')
                          setShowLanguageMenu(false)
                        }}
                        className={`w-full text-left px-4 py-3 text-sm flex items-center space-x-3 transition-all duration-200 ${
                          language === 'en' 
                            ? 'bg-gradient-to-r from-primary-50 to-purple-50 text-primary-700 font-semibold' 
                            : 'text-gray-700 hover:bg-purple-50'
                        }`}
                      >
                        <span className="text-lg">🇬🇧</span>
                        <span>{t('nav.language.en')}</span>
                        {language === 'en' && <span className="ml-auto text-primary-600">✓</span>}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {loading ? (
              <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            ) : user ? (
              <>
                <Link
                  href="/listings/new"
                  className="flex items-center space-x-2 gradient-purple text-white px-6 py-2.5 rounded-xl hover:shadow-glow transition-all duration-300 hover-lift font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('nav.newListing')}</span>
                </Link>
                
                {/* User Menu - แสดงเฉพาะเมื่อมี profile */}
                {displayName ? (
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowUserMenu(!showUserMenu)
                        setShowLanguageMenu(false)
                      }}
                      className="flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-purple-50 transition-all duration-200"
                    >
                      <div className="w-10 h-10 gradient-purple rounded-full flex items-center justify-center text-white font-semibold shadow-glow">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-gray-700 font-medium hidden md:block">
                        {displayName}
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-600 hidden md:block" />
                    </button>

                    {showUserMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowUserMenu(false)}
                        />
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-soft border border-purple-100 z-20 overflow-hidden animate-fade-in">
                          <div className="px-4 py-4 border-b border-purple-100 bg-gradient-to-r from-primary-50 to-purple-50">
                            <p className="text-sm font-semibold text-gray-900">
                              {displayName}
                            </p>
                          </div>
                          <Link
                            href="/dashboard"
                            className="block px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 flex items-center space-x-3 transition-colors duration-200"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <User className="w-4 h-4 text-primary-600" />
                            <span>{t('nav.dashboard')}</span>
                          </Link>
                          <Link
                            href="/settings"
                            className="block px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 flex items-center space-x-3 transition-colors duration-200"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <User className="w-4 h-4 text-primary-600" />
                            <span>{t('nav.settings')}</span>
                          </Link>
                          <div className="border-t border-purple-100" />
                          <button
                            onClick={signOut}
                            className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-colors duration-200"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>{t('nav.signOut')}</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  // ถ้าไม่มี profile ให้แสดง loading spinner
                  <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                )}
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200"
                >
                  <LogIn className="w-5 h-5" />
                  <span>{t('nav.signIn')}</span>
                </Link>
                <Link
                  href="/auth/signup"
                  className="flex items-center space-x-2 gradient-purple text-white px-6 py-2.5 rounded-xl hover:shadow-glow transition-all duration-300 hover-lift font-medium"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{t('nav.signUp')}</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Error Dialog - แสดงเมื่อมี user แต่ไม่มี profile */}
      <AlertDialog
        isOpen={showError}
        onClose={async () => {
          setShowError(false)
          await handleProfileError()
        }}
        title={t('error.profileMissing')}
        message={t('error.profileMissingMessage')}
        type="error"
        buttonText={t('error.goToLogin')}
      />
    </nav>
  )
}
