'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import EditListingForm from '@/components/EditListingForm'
import { Listing } from '@/lib/types'

export default function EditListingPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const supabase = createClient()
  const { user, loading: authLoading } = useAuth()
  const { t } = useLanguage()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // ถ้ายัง loading auth ให้รอ
    if (authLoading) {
      return
    }

    // ถ้าไม่มี user ให้ redirect
    if (!user) {
      router.push(`/auth/signin?redirect=/listings/${params.id}/edit`)
      return
    }

    // Fetch listing
    const fetchListing = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('id', params.id)
          .eq('user_id', user.id)
          .single()

        if (error || !data) {
          setError(t('editListing.notFoundOrNoPermission'))
          setLoading(false)
          return
        }

        setListing(data as Listing)
      } catch (err) {
        console.error('Error fetching listing:', err)
        setError(t('editListing.loadError'))
      } finally {
        setLoading(false)
      }
    }

    fetchListing()
  }, [user, authLoading, params.id, router, supabase, t])

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

  if (error || !listing) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || t('editListing.notFound')}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-10 text-center animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 bg-clip-text text-transparent">
          {t('editListing.title')}
        </h1>
      </div>
      <EditListingForm listing={listing} />
    </div>
  )
}

