'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Listing } from '@/lib/types'
import { MapPin, Bed, Bath, Square, Edit, Trash2, Eye, MoreVertical, Star } from 'lucide-react'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { ConfirmDialog, AlertDialog } from '@/components/Modal'
import { useLanguage } from '@/contexts/LanguageContext'

interface DashboardListingCardProps {
  listing: Listing
  onDelete?: () => void
}

export default function DashboardListingCard({ listing, onDelete }: DashboardListingCardProps) {
  const router = useRouter()
  const supabase = createClient()
  const { t } = useLanguage()
  const [showMenu, setShowMenu] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isTogglingFeatured, setIsTogglingFeatured] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState({ title: '', message: '', type: 'info' as 'success' | 'error' | 'warning' | 'info' })

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M`
    }
    if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}K`
    }
    return price.toLocaleString()
  }

  const getPropertyTypeLabel = (type: string) => {
    if (!type) return ''
    const label = t(`property.${type}` as any)
    // ถ้าไม่เจอ translation ให้ return type แทน
    return label && label !== `property.${type}` ? label : type
  }

  const getTransactionTypeLabel = (type: string | null | undefined) => {
    if (!type) return ''
    // แปลง "transaction.rent" หรือ "transaction.sale" เป็น "rent" หรือ "sale"
    const normalizedType = String(type).replace(/^transaction\./, '').trim().toLowerCase()
    if (normalizedType === 'sale') {
      return t('transaction.sale')
    } else if (normalizedType === 'rent') {
      return t('transaction.rent')
    }
    return String(type)
  }

  const handleDeleteClick = () => {
    setShowMenu(false)
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    setIsDeleting(true)
    try {
      // Refresh session และดึง access token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        setAlertMessage({
          title: t('dashboard.signInRequired'),
          message: t('dashboard.signInRequiredMessage'),
          type: 'warning',
        })
        setShowAlert(true)
        setIsDeleting(false)
        router.push('/auth/signin?redirect=/dashboard')
        return
      }
      
      const response = await fetch(`/api/listings/${listing.id}/delete`, {
        method: 'POST',
        credentials: 'include', // ส่ง cookies ไปด้วย
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`, // ส่ง access token
        },
      })

      if (response.ok) {
        setShowDeleteConfirm(false)
        setAlertMessage({
          title: t('dashboard.deleteSuccess'),
          message: t('dashboard.deleteSuccessMessage'),
          type: 'success',
        })
        setShowAlert(true)
        
        // เรียก callback ถ้ามี (สำหรับ refresh ข้อมูล listings)
        if (onDelete) {
          onDelete()
        } else {
          // ถ้าไม่มี callback ให้ refresh หน้า
          router.refresh()
        }
      } else {
        const errorData = await response.json()
        setShowDeleteConfirm(false)
        setAlertMessage({
          title: t('dashboard.errorMessage'),
          message: errorData.error || errorData.details || t('dashboard.errorMessage'),
          type: 'error',
        })
        setShowAlert(true)
      }
    } catch (error) {
      console.error('Error deleting listing:', error)
      setShowDeleteConfirm(false)
      setAlertMessage({
        title: t('dashboard.errorMessage'),
        message: t('dashboard.errorMessage'),
        type: 'error',
      })
      setShowAlert(true)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleFeatured = async () => {
    setIsTogglingFeatured(true)
    setShowMenu(false)
    try {
      // ตรวจสอบว่า user login หรือยัง
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setAlertMessage({
          title: t('dashboard.signInRequired'),
          message: t('dashboard.signInRequiredMessage'),
          type: 'warning',
        })
        setShowAlert(true)
        setIsTogglingFeatured(false)
        return
      }

      const { error } = await supabase
        .from('listings')
        .update({ is_featured: !listing.is_featured })
        .eq('id', listing.id)
        .eq('user_id', user.id) // ตรวจสอบว่าเป็นเจ้าของ

      if (error) {
        setAlertMessage({
          title: t('dashboard.errorMessage'),
          message: error.message,
          type: 'error',
        })
        setShowAlert(true)
      } else {
        setAlertMessage({
          title: t('dashboard.toggleFeaturedSuccess'),
          message: t('dashboard.toggleFeaturedSuccessMessage'),
          type: 'success',
        })
        setShowAlert(true)
        
        // เรียก callback เพื่อ refresh listings (ไม่ refresh profile)
        if (onDelete) {
          onDelete()
        } else {
          // ถ้าไม่มี callback ให้ refresh หน้า
          router.refresh()
        }
      }
    } catch (error) {
      console.error('Error toggling featured:', error)
      setAlertMessage({
        title: t('dashboard.errorMessage'),
        message: t('dashboard.errorMessage'),
        type: 'error',
      })
      setShowAlert(true)
    } finally {
      setIsTogglingFeatured(false)
    }
  }

  const imageUrl = listing.images && listing.images.length > 0 
    ? listing.images[0] 
    : null

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-soft overflow-hidden hover:shadow-glow transition-all duration-300 border border-purple-100 hover-lift">
      <div className="flex flex-col sm:flex-row">
        {/* รูปภาพ */}
        <div className="relative w-full sm:w-48 h-48 sm:h-auto bg-gray-200 flex-shrink-0">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={listing.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 192px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              {t('listing.noImage')}
            </div>
          )}
          {listing.is_featured && (
            <div className="absolute top-2 left-2">
              <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center space-x-1">
                <Star className="w-3 h-3 fill-current" />
                <span>{t('dashboard.featured')}</span>
              </span>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <span className="bg-primary-600 text-white px-2 py-1 rounded text-xs font-medium">
              {getTransactionTypeLabel(listing.transaction_type)}
            </span>
          </div>
        </div>

        {/* เนื้อหา */}
        <div className="flex-1 p-3 sm:p-4 flex flex-col">
          <div className="flex items-start justify-between mb-2 gap-2">
            <div className="flex-1 min-w-0">
              <Link href={`/listings/${listing.id}`}>
                <h3 className="font-semibold text-gray-900 text-base sm:text-lg hover:text-primary-600 transition-colors mb-1 line-clamp-2">
                  {listing.title}
                </h3>
              </Link>
              <div className="flex items-center text-gray-600 text-xs sm:text-sm mb-2">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                <span className="truncate">{listing.district}, {listing.province}</span>
              </div>
            </div>

            {/* เมนู */}
            <div className="relative ml-2 sm:ml-4 flex-shrink-0">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                    <Link
                      href={`/listings/${listing.id}/edit`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      onClick={() => setShowMenu(false)}
                    >
                      <Edit className="w-4 h-4" />
                      <span>{t('common.edit')}</span>
                    </Link>
                    <Link
                      href={`/listings/${listing.id}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      onClick={() => setShowMenu(false)}
                    >
                      <Eye className="w-4 h-4" />
                      <span>{t('common.view') || 'View Details'}</span>
                    </Link>
                    <button
                      onClick={handleToggleFeatured}
                      disabled={isTogglingFeatured}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 disabled:opacity-50"
                    >
                      <Star className={`w-4 h-4 ${listing.is_featured ? 'fill-current text-yellow-500' : ''}`} />
                      <span>{listing.is_featured ? t('dashboard.notFeatured') : t('dashboard.featured')}</span>
                    </button>
                    <div className="border-t border-gray-200" />
                        <button
                          onClick={handleDeleteClick}
                          disabled={isDeleting}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>{t('common.delete')}</span>
                        </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex-1">
            <div className="text-xl sm:text-2xl font-bold text-primary-600 mb-2 sm:mb-3">
              {formatPrice(listing.price)} {t('listing.baht')}
              {listing.transaction_type === 'rent' && (
                <span className="text-xs sm:text-sm font-normal text-gray-500">{t('listing.perMonth')}</span>
              )}
            </div>

            <div className="flex items-center flex-wrap gap-2 sm:gap-3 sm:space-x-4 text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3">
              {listing.bedrooms && (
                <div className="flex items-center">
                  <Bed className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                  <span>{listing.bedrooms} {t('detail.bedrooms')}</span>
                </div>
              )}
              {listing.bathrooms && (
                <div className="flex items-center">
                  <Bath className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                  <span>{listing.bathrooms} {t('detail.bathrooms')}</span>
                </div>
              )}
              {listing.area_sqm && (
                <div className="flex items-center">
                  <Square className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                  <span>{listing.area_sqm} {t('listing.sqm')}</span>
                </div>
              )}
            </div>
          </div>

          {/* ข้อมูลด้านล่าง */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 sm:pt-3 border-t border-gray-200 gap-2">
            <div className="flex items-center space-x-2 sm:space-x-4 text-xs text-gray-500">
              <span>{getPropertyTypeLabel(listing.property_type)}</span>
              <span className="hidden sm:inline">•</span>
              <span>{format(new Date(listing.created_at), 'dd MMM yyyy')}</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Eye className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span>{listing.views || 0} {t('detail.views')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title={t('dashboard.deleteConfirm')}
        message={t('dashboard.deleteConfirmMessage')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        confirmColor="danger"
        isLoading={isDeleting}
      />

      {/* Alert Dialog */}
      <AlertDialog
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        title={alertMessage.title}
        message={alertMessage.message}
        type={alertMessage.type}
      />
    </div>
  )
}

