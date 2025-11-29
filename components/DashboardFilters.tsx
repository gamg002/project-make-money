'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Search, X, Filter } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function DashboardFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useLanguage()
  const [filters, setFilters] = useState({
    search: '',
    property_type: '',
    transaction_type: '',
  })

  // อัปเดต filters เมื่อ searchParams เปลี่ยน
  useEffect(() => {
    setFilters({
      search: searchParams.get('search') || '',
      property_type: searchParams.get('property_type') || '',
      transaction_type: searchParams.get('transaction_type') || '',
    })
  }, [searchParams])

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleSearch = () => {
    try {
      const params = new URLSearchParams()
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.set(key, value)
        }
      })

      const queryString = params.toString()
      router.push(queryString ? `/dashboard?${queryString}` : '/dashboard')
    } catch (error) {
      console.error('Error in handleSearch:', error)
    }
  }

  const handleReset = () => {
    try {
      setFilters({
        search: '',
        property_type: '',
        transaction_type: '',
      })
      router.push('/dashboard')
    } catch (error) {
      console.error('Error in handleReset:', error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-3 sm:mb-4">
        <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">{t('dashboard.filter') || 'Search and Filter'}</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="sm:col-span-2 lg:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('search.placeholder')}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <select
          value={filters.transaction_type}
          onChange={(e) => handleFilterChange('transaction_type', e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">{t('search.allTransactionTypes')}</option>
          <option value="sale">{t('search.sale')}</option>
          <option value="rent">{t('search.rent')}</option>
        </select>

        <select
          value={filters.property_type}
          onChange={(e) => handleFilterChange('property_type', e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">{t('search.allPropertyTypes')}</option>
          <option value="condo">{t('search.condo')}</option>
          <option value="house">{t('search.house')}</option>
          <option value="land">{t('search.land')}</option>
          <option value="commercial">{t('search.commercial')}</option>
          <option value="room">{t('search.room')}</option>
        </select>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
        <button
          onClick={handleSearch}
          className="bg-primary-600 text-white px-5 sm:px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm sm:text-base"
        >
          {t('search.search')}
        </button>
        <button
          onClick={handleReset}
          className="flex items-center justify-center space-x-1 text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors text-sm sm:text-base"
        >
          <X className="w-4 h-4" />
          <span>{t('search.reset')}</span>
        </button>
      </div>
    </div>
  )
}

