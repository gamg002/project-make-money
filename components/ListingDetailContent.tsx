'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { Listing } from '@/lib/types'
import { MapPin, Bed, Bath, Square, Phone, Mail, Eye, ArrowLeft, Facebook, MessageCircle } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import ListingActions from '@/components/ListingActions'
import { BannerAd, InArticleAd, SidebarAd } from '@/components/AdSense'
import ListingImageGallery from '@/components/ListingImageGallery'

interface ListingDetailContentProps {
  listing: Listing
  isOwner: boolean
}

export default function ListingDetailContent({ listing, isOwner }: ListingDetailContentProps) {
  const { t } = useLanguage()

  const formatPrice = (price: number) => {
    // แปลงเป็นจำนวนเต็มเพื่อไม่ให้แสดงทศนิยม
    const priceInt = Math.round(price)
    return new Intl.NumberFormat('th-TH', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(priceInt)
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
    // ถ้าไม่เจอ type ให้ return type แทน (แต่ไม่ควรเกิดขึ้น)
    console.warn('Unknown transaction type:', type, 'normalized:', normalizedType)
    return String(type)
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8 max-w-6xl">
      <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
        <Link
          href="/"
          className="flex items-center text-primary-600 hover:text-primary-700 font-medium text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('detail.backToHome')}
        </Link>
        {isOwner && <ListingActions listingId={listing.id} />}
      </div>

      {/* Banner Ad - Top */}
      {process.env.NEXT_PUBLIC_ADSENSE_SLOT_BANNER && (
        <BannerAd adSlot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BANNER} />
      )}

      <div className="bg-white rounded-xl sm:rounded-2xl shadow-soft overflow-hidden border border-purple-100">
        {/* รูปภาพ Gallery */}
        <ListingImageGallery 
          images={listing.images || []} 
          title={listing.title}
        />

        <div className="p-4 sm:p-6 md:p-8">
          {/* หัวข้อและราคา */}
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4 gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 break-words">
                  {listing.title}
                </h1>
                <div className="flex items-start text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="break-words">
                    {listing.address}, {listing.district}, {listing.province}
                    {listing.postal_code && ` ${listing.postal_code}`}
                  </span>
                </div>
              </div>
              <div className="text-left sm:text-right flex-shrink-0">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-600 mb-1">
                  {formatPrice(listing.price)} {t('detail.price')}
                </div>
                {listing.transaction_type === 'rent' && (
                  <span className="text-sm sm:text-base text-gray-500">{t('detail.perMonth')}</span>
                )}
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-2 sm:gap-3 md:gap-4">
              <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                {getTransactionTypeLabel(listing.transaction_type || '')}
              </span>
              <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                {getPropertyTypeLabel(listing.property_type || '')}
              </span>
              {listing.views !== undefined && listing.views !== null && (
                <div className="flex items-center text-gray-500 text-sm">
                  <Eye className="w-4 h-4 mr-1" />
                  <span>{listing.views} {t('detail.views')}</span>
                </div>
              )}
            </div>
          </div>

          {/* รายละเอียด */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
            <div className="md:col-span-2">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                {t('detail.description')}
              </h2>
              {listing.description ? (
                <>
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed text-sm sm:text-base">
                    {listing.description}
                  </p>
                  {/* In-Article Ad */}
                  {process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE && (
                    <InArticleAd adSlot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE} />
                  )}
                </>
              ) : (
                <p className="text-gray-500 text-sm sm:text-base">{t('detail.noDescription')}</p>
              )}

              <div className="mt-6 sm:mt-8">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                  {t('detail.features')}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {listing.bedrooms && (
                    <div className="flex items-center space-x-2">
                      <Bed className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">{t('detail.bedrooms')}</div>
                        <div className="font-medium">{listing.bedrooms}</div>
                      </div>
                    </div>
                  )}
                  {listing.bathrooms && (
                    <div className="flex items-center space-x-2">
                      <Bath className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">{t('detail.bathrooms')}</div>
                        <div className="font-medium">{listing.bathrooms}</div>
                      </div>
                    </div>
                  )}
                  {listing.area_sqm && (
                    <div className="flex items-center space-x-2">
                      <Square className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">{t('detail.area')}</div>
                        <div className="font-medium">{listing.area_sqm} {t('detail.sqm')}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ข้อมูลติดต่อ */}
            <div className="space-y-4 sm:space-y-6">
              {/* Sidebar Ad - Top */}
              {process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR && (
                <SidebarAd adSlot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR} />
              )}
              
              <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-4 sm:p-6 h-fit border border-purple-100 shadow-soft sticky top-20">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-5 flex items-center">
                  <span className="w-1 h-5 sm:h-6 gradient-purple rounded-full mr-2 sm:mr-3"></span>
                  {t('detail.contact')}
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">{t('detail.name')}</div>
                    <div className="font-medium text-gray-900">
                      {listing.contact_name}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">{t('detail.phone')}</div>
                    <a
                      href={`tel:${listing.contact_phone}`}
                      className="flex items-center text-primary-600 hover:text-primary-700 font-medium"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      {listing.contact_phone}
                    </a>
                  </div>
                  {listing.contact_email && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">{t('detail.email')}</div>
                      <a
                        href={`mailto:${listing.contact_email}`}
                        className="flex items-center text-primary-600 hover:text-primary-700 font-medium"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        {listing.contact_email}
                      </a>
                    </div>
                  )}
                  {listing.contact_facebook && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">{t('detail.facebook')}</div>
                      <a
                        href={listing.contact_facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-primary-600 hover:text-primary-700 font-medium"
                      >
                        <Facebook className="w-4 h-4 mr-2" />
                        {t('detail.facebook')}
                      </a>
                    </div>
                  )}
                  {listing.contact_line && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">{t('detail.line')}</div>
                      <a
                        href={listing.contact_line}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-primary-600 hover:text-primary-700 font-medium"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        {t('detail.line')}
                      </a>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Sidebar Ad - Bottom */}
              {process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR_BOTTOM && (
                <SidebarAd adSlot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR_BOTTOM} />
              )}
            </div>
          </div>

          {/* ข้อมูลเพิ่มเติม */}
          <div className="border-t pt-6 text-sm text-gray-500">
            <p>
              {t('common.createdAt') || 'Created'}: {format(new Date(listing.created_at), 'dd MMMM yyyy HH:mm')}
            </p>
            {listing.updated_at !== listing.created_at && (
              <p>
                {t('common.updatedAt') || 'Updated'}: {format(new Date(listing.updated_at), 'dd MMMM yyyy HH:mm')}
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Banner Ad - Bottom */}
      {process.env.NEXT_PUBLIC_ADSENSE_SLOT_BANNER_BOTTOM && (
        <BannerAd adSlot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BANNER_BOTTOM} />
      )}
    </div>
  )
}

