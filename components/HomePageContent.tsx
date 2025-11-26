'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { Listing } from '@/lib/types'
import ListingCard from '@/components/ListingCard'
import SearchFilters from '@/components/SearchFilters'
import HeroSlider from '@/components/HeroSlider'
import { BannerAd, InArticleAd } from '@/components/AdSense'
import Link from 'next/link'

interface Advertisement {
  id: string
  image: string
  link: string
  title?: string
  subtitle?: string
}

interface HomePageContentProps {
  listings: Listing[]
  total: number
  page: number
  totalPages: number
  error?: string | null
  searchParams?: { [key: string]: string | string[] | undefined }
  advertisements?: Advertisement[]
}

export default function HomePageContent({
  listings,
  total,
  page,
  totalPages,
  error,
  searchParams = {},
  advertisements = [],
}: HomePageContentProps) {
  const { t } = useLanguage()

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 p-6 mb-6 rounded-lg shadow-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                {t('error.title')}
              </h3>
              <p className="text-base text-red-800 mb-2">
                {error}
              </p>
              <p className="text-sm text-red-700">
                {t('error.checkSupabase')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Slider */}
      <HeroSlider slides={advertisements.length > 0 ? advertisements.map(ad => ({
        id: ad.id,
        image: ad.image,
        link: ad.link,
        title: ad.title,
        subtitle: ad.subtitle,
      })) : undefined} />

      <SearchFilters />

      {listings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {t('home.noResults')}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            {t('home.noResultsDesc')}
          </p>
          <Link
            href="/listings/new"
            className="mt-4 inline-block text-primary-600 hover:text-primary-700 font-medium"
          >
            {t('nav.newListing')} →
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-4 text-gray-600">
            {total} {t('home.results')} ({t('home.page')} {page} {t('home.of')} {totalPages})
          </div>
          
          {/* Banner Ad - Top */}
          {process.env.NEXT_PUBLIC_ADSENSE_SLOT_BANNER && (
            <BannerAd adSlot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BANNER} />
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing, index) => (
              <div key={listing.id}>
                <ListingCard listing={listing} />
                {/* In-Article Ad - หลังทุก 4 รายการ */}
                {process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE && 
                 (index + 1) % 4 === 0 && 
                 index < listings.length - 1 && (
                  <InArticleAd adSlot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE} />
                )}
              </div>
            ))}
          </div>
          
          {/* Banner Ad - Bottom */}
          {process.env.NEXT_PUBLIC_ADSENSE_SLOT_BANNER_BOTTOM && (
            <BannerAd adSlot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BANNER_BOTTOM} />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-8">
              <Link
                href={`?${new URLSearchParams({
                  ...Object.fromEntries(
                    Object.entries(searchParams).filter(([k]) => k !== 'page')
                  ),
                  page: String(Math.max(1, page - 1)),
                })}`}
                className={`px-4 py-2 rounded-lg border ${
                  page === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {t('home.previous')}
              </Link>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (page <= 3) {
                  pageNum = i + 1
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = page - 2 + i
                }
                
                return (
                  <Link
                    key={pageNum}
                    href={`?${new URLSearchParams({
                      ...Object.fromEntries(
                        Object.entries(searchParams).filter(([k]) => k !== 'page')
                      ),
                      page: String(pageNum),
                    })}`}
                    className={`px-5 py-3 rounded-xl border-2 font-semibold transition-all duration-200 min-w-[44px] ${
                      pageNum === page
                        ? 'gradient-purple text-white shadow-glow border-primary-600'
                        : 'bg-white text-gray-700 hover:bg-purple-50 hover:border-primary-300 hover:text-primary-700 border-purple-200'
                    }`}
                  >
                    {pageNum}
                  </Link>
                )
              })}
              
              <Link
                href={`?${new URLSearchParams({
                  ...Object.fromEntries(
                    Object.entries(searchParams).filter(([k]) => k !== 'page')
                  ),
                  page: String(Math.min(totalPages, page + 1)),
                })}`}
                className={`px-6 py-3 rounded-xl border-2 font-medium transition-all duration-200 ${
                  page === totalPages
                    ? 'bg-gray-50 text-gray-400 cursor-not-allowed pointer-events-none border-gray-200'
                    : 'bg-white text-gray-700 hover:bg-purple-50 hover:border-primary-300 hover:text-primary-700 border-purple-200'
                }`}
              >
                {t('home.next')}
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}

