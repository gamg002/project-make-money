'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Listing } from '@/lib/types'
import { MapPin, Bed, Bath, Square } from 'lucide-react'
import { format } from 'date-fns'
import { useLanguage } from '@/contexts/LanguageContext'

interface ListingCardProps {
  listing: Listing
}

export default function ListingCard({ listing }: ListingCardProps) {
  const { t } = useLanguage()
  
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

  const imageUrl = listing.images && listing.images.length > 0 
    ? listing.images[0] 
    : null

  return (
    <Link href={`/listings/${listing.id}`}>
      <div className="bg-white rounded-2xl shadow-soft overflow-hidden hover-lift cursor-pointer border border-purple-50 group">
        <div className="relative h-56 w-full bg-gradient-to-br from-purple-100 to-purple-50 overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={listing.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHhYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-purple-50 to-purple-100">
              {t('listing.noImage')}
            </div>
          )}
          <div className="absolute top-3 right-3">
            <span className="gradient-purple text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-glow">
              {getTransactionTypeLabel(listing.transaction_type)}
            </span>
          </div>
          {listing.is_featured && (
            <div className="absolute top-3 left-3">
              <span className="bg-yellow-400 text-yellow-900 px-3 py-1.5 rounded-full text-xs font-semibold shadow-md">
                ⭐ {t('dashboard.featured')}
              </span>
            </div>
          )}
        </div>
        
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-bold text-gray-900 line-clamp-2 flex-1 text-lg group-hover:text-primary-700 transition-colors">
              {listing.title}
            </h3>
          </div>

          <div className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-3">
            {formatPrice(listing.price)} {t('listing.baht')}
            {listing.transaction_type === 'rent' && <span className="text-base font-normal text-gray-500">{t('listing.perMonth')}</span>}
          </div>

          <div className="flex items-center text-gray-600 text-sm mb-3">
            <MapPin className="w-4 h-4 mr-1.5 text-primary-500" />
            <span className="line-clamp-1">
              {listing.district}, {listing.province}
            </span>
          </div>

          <div className="flex items-center space-x-5 text-gray-600 text-sm mb-4">
            {listing.bedrooms && (
              <div className="flex items-center bg-purple-50 px-3 py-1.5 rounded-lg">
                <Bed className="w-4 h-4 mr-1.5 text-primary-600" />
                <span className="font-medium">{listing.bedrooms}</span>
              </div>
            )}
            {listing.bathrooms && (
              <div className="flex items-center bg-purple-50 px-3 py-1.5 rounded-lg">
                <Bath className="w-4 h-4 mr-1.5 text-primary-600" />
                <span className="font-medium">{listing.bathrooms}</span>
              </div>
            )}
            {listing.area_sqm && (
              <div className="flex items-center bg-purple-50 px-3 py-1.5 rounded-lg">
                <Square className="w-4 h-4 mr-1.5 text-primary-600" />
                <span className="font-medium">{listing.area_sqm} {t('listing.sqm')}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-purple-100">
            <span className="text-xs font-medium text-primary-700 bg-purple-50 px-3 py-1 rounded-full">
              {getPropertyTypeLabel(listing.property_type)}
            </span>
            <span className="text-xs text-gray-500">
              {format(new Date(listing.created_at), 'dd MMM yyyy')}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

