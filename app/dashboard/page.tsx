'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import DashboardListingCard from '@/components/DashboardListingCard'
import { Plus, Eye } from 'lucide-react'
import { Listing } from '@/lib/types'
import DashboardFilters from '@/components/DashboardFilters'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'

function DashboardContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()
  const { user, profile, loading: authLoading } = useAuth()
  const { t } = useLanguage()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // ถ้ายัง loading auth ให้รอ
    if (authLoading) {
      console.log('Dashboard - Waiting for auth to load...')
      return
    }

    // ถ้าไม่มี user ให้ redirect
    if (!user) {
      console.log('Dashboard - No user found, redirecting')
      router.push('/auth/signin?redirect=/dashboard')
      return
    }

    // ตั้ง timeout เพื่อป้องกันการค้าง
    const timeoutId = setTimeout(() => {
      console.warn('Dashboard - Fetch timeout, setting loading to false')
      setLoading(false)
    }, 10000) // 10 seconds timeout

    const fetchData = async () => {
      try {
        console.log('Dashboard - User found:', user.id, 'Fetching listings...')
        setLoading(true)

        // Fetch listings
        let query = supabase
          .from('listings')
          .select('*')
          .eq('user_id', user.id)

        const propertyType = searchParams.get('property_type')
        const transactionType = searchParams.get('transaction_type')
        const search = searchParams.get('search')

        if (propertyType) {
          query = query.eq('property_type', propertyType)
        }

        if (transactionType) {
          query = query.eq('transaction_type', transactionType)
        }

        if (search) {
          query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,address.ilike.%${search}%`)
        }

        const { data: listingsData, error: listingsError } = await query
          .order('created_at', { ascending: false })

        if (listingsError) {
          console.error('Error fetching listings:', listingsError)
          setError(t('dashboard.error') + ': ' + listingsError.message)
          setListings([]) // Set empty array on error
        } else {
          setListings(listingsData as Listing[] || [])
          console.log('Dashboard - Listings fetched successfully, count:', listingsData?.length || 0)
        }

      } catch (err) {
        console.error('Dashboard - Error:', err)
        setError(t('dashboard.error'))
        setListings([]) // Set empty array on error
      } finally {
        clearTimeout(timeoutId)
        setLoading(false)
        console.log('Dashboard - Loading complete')
      }
    }

    fetchData()

    return () => {
      clearTimeout(timeoutId)
    }
  }, [user, authLoading, supabase, searchParams, router, t])

  // Function สำหรับ refresh listings (ไม่ refresh profile)
  const refreshListings = useCallback(async () => {
    if (!user) return

    try {
      let query = supabase
        .from('listings')
        .select('*')
        .eq('user_id', user.id)

      const propertyType = searchParams.get('property_type')
      const transactionType = searchParams.get('transaction_type')
      const search = searchParams.get('search')

      if (propertyType) {
        query = query.eq('property_type', propertyType)
      }

      if (transactionType) {
        query = query.eq('transaction_type', transactionType)
      }

      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,address.ilike.%${search}%`)
      }

      const { data: listingsData, error: listingsError } = await query
        .order('created_at', { ascending: false })

      if (listingsError) {
        console.error('Error refreshing listings:', listingsError)
        setError(t('dashboard.error') + ': ' + listingsError.message)
      } else {
        setListings(listingsData as Listing[] || [])
      }
    } catch (err) {
      console.error('Error refreshing listings:', err)
      setError(t('dashboard.error'))
    }
  }, [user, supabase, searchParams, t])

  const totalViews = listings.reduce((sum, listing) => sum + (listing.views || 0), 0)
  const featuredCount = listings.filter(l => l.is_featured).length
  const saleCount = listings.filter(l => l.transaction_type === 'sale').length
  const rentCount = listings.filter(l => l.transaction_type === 'rent').length

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">{t('dashboard.loading')}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // จะ redirect โดย useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 bg-clip-text text-transparent">
          {t('dashboard.title')}
        </h1>
        <p className="text-gray-600 text-lg">
          {t('common.welcome')}, <span className="font-semibold text-gray-900">{profile?.full_name?.trim() || t('common.user')}</span>
        </p>
        {error && (
          <div className="mt-4 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg shadow-soft animate-fade-in">
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
      </div>

      {/* สถิติ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-soft border border-purple-100 hover-lift transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">{t('common.totalListings')}</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                {listings.length}
              </p>
            </div>
            <div className="bg-gradient-to-br from-primary-100 to-purple-100 p-3 rounded-xl">
              <Eye className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-soft border border-purple-100 hover-lift transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">{t('common.totalViews')}</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                {totalViews}
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-cyan-100 p-3 rounded-xl">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-soft border border-purple-100 hover-lift transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">{t('common.featuredListings')}</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                {featuredCount}
              </p>
            </div>
            <div className="bg-gradient-to-br from-yellow-100 to-orange-100 p-3 rounded-xl">
              <Eye className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <Link
          href="/listings/new"
          className="gradient-purple text-white p-6 rounded-2xl shadow-soft hover:shadow-glow transition-all duration-300 hover-lift flex items-center justify-center space-x-2 border border-primary-600"
        >
          <Plus className="w-6 h-6" />
          <span className="font-semibold">{t('dashboard.newListing')}</span>
        </Link>
      </div>

      {/* ฟิลเตอร์และค้นหา */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-soft p-6 mb-6 border border-purple-100">
        <DashboardFilters />
      </div>

      {/* รายการประกาศ */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-soft p-6 border border-purple-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {t('common.myListings')} <span className="text-primary-600">({listings.length})</span>
          </h2>
          <div className="flex items-center space-x-4 text-sm text-gray-600 bg-purple-50 px-4 py-2 rounded-xl">
            <span className="font-medium">{t('common.sale')}: <span className="text-primary-700 font-bold">{saleCount}</span></span>
            <span className="text-purple-300">•</span>
            <span className="font-medium">{t('common.rent')}: <span className="text-primary-700 font-bold">{rentCount}</span></span>
          </div>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-block p-4 bg-purple-100 rounded-full mb-4">
              <Eye className="w-12 h-12 text-purple-600" />
            </div>
            <p className="text-gray-600 text-lg mb-2 font-medium">
              {searchParams.get('property_type') || searchParams.get('transaction_type') || searchParams.get('search')
                ? t('common.noListingsFiltered')
                : t('common.noListings')}
            </p>
            <p className="text-gray-500 text-sm mb-6">
              {t('dashboard.noListingsDesc')}
            </p>
            <Link
              href="/listings/new"
              className="inline-flex items-center space-x-2 gradient-purple text-white px-8 py-3 rounded-xl hover:shadow-glow transition-all duration-300 hover-lift font-semibold"
            >
              <Plus className="w-5 h-5" />
              <span>{t('common.postFirstListing')}</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map((listing, index) => (
              <div key={listing.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                <DashboardListingCard 
                  listing={listing}
                  onDelete={async () => {
                    // Refresh ข้อมูล listings หลังลบ (ไม่ refresh profile)
                    await refreshListings()
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
