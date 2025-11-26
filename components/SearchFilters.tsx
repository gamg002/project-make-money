'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function SearchFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useLanguage()
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    property_type: searchParams.get('property_type') || '',
    transaction_type: searchParams.get('transaction_type') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    province: searchParams.get('province') || '',
  })

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleSearch = () => {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      }
    })

    router.push(`/?${params.toString()}`)
  }

  const handleReset = () => {
    setFilters({
      search: '',
      property_type: '',
      transaction_type: '',
      min_price: '',
      max_price: '',
      bedrooms: '',
      province: '',
    })
    router.push('/')
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-soft mb-8 border border-purple-100 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary-400 w-5 h-5 group-focus-within:text-primary-600 transition-colors duration-200" />
            <input
              type="text"
              placeholder={t('search.placeholder')}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch()
                }
              }}
              className="w-full pl-12 pr-4 py-3 border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white hover:border-primary-300"
            />
          </div>
        </div>

        <select
          value={filters.transaction_type}
          onChange={(e) => handleFilterChange('transaction_type', e.target.value)}
          className="px-4 py-3 border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white hover:border-primary-300 cursor-pointer"
        >
          <option value="">{t('search.allTransactionTypes')}</option>
          <option value="sale">{t('search.sale')}</option>
          <option value="rent">{t('search.rent')}</option>
        </select>

        <select
          value={filters.property_type}
          onChange={(e) => handleFilterChange('property_type', e.target.value)}
          className="px-4 py-3 border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white hover:border-primary-300 cursor-pointer"
        >
          <option value="">{t('search.allPropertyTypes')}</option>
          <option value="condo">{t('search.condo')}</option>
          <option value="house">{t('search.house')}</option>
          <option value="land">{t('search.land')}</option>
          <option value="commercial">{t('search.commercial')}</option>
        </select>

        <input
          type="number"
          placeholder={t('search.minPrice')}
          value={filters.min_price}
          onChange={(e) => handleFilterChange('min_price', e.target.value)}
          className="px-4 py-3 border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white hover:border-primary-300"
        />

        <input
          type="number"
          placeholder={t('search.maxPrice')}
          value={filters.max_price}
          onChange={(e) => handleFilterChange('max_price', e.target.value)}
          className="px-4 py-3 border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white hover:border-primary-300"
        />

        <select
          value={filters.bedrooms}
          onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
          className="px-4 py-3 border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white hover:border-primary-300 cursor-pointer"
        >
          <option value="">{t('search.bedrooms')}</option>
          <option value="1">1 {t('search.bedroom')}</option>
          <option value="2">2 {t('search.bedroom')}</option>
          <option value="3">3 {t('search.bedroom')}</option>
          <option value="4">{t('search.bedrooms4plus')}</option>
        </select>

        <input
          type="text"
          placeholder={t('search.province')}
          value={filters.province}
          onChange={(e) => handleFilterChange('province', e.target.value)}
          className="px-4 py-3 border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white hover:border-primary-300"
        />
      </div>

      <div className="flex items-center space-x-3 mt-6">
        <button
          onClick={handleSearch}
          className="gradient-purple text-white px-8 py-3 rounded-xl hover:shadow-glow transition-all duration-300 hover-lift font-semibold flex items-center space-x-2 group"
        >
          <Search className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
          <span>{t('search.search')}</span>
        </button>
        <button
          onClick={handleReset}
          className="flex items-center space-x-2 text-gray-600 hover:text-primary-700 px-6 py-3 rounded-xl border-2 border-purple-200 hover:border-primary-300 transition-all duration-200 font-medium hover:bg-purple-50"
        >
          <X className="w-4 h-4" />
          <span>{t('search.reset')}</span>
        </button>
      </div>
    </div>
  )
}

