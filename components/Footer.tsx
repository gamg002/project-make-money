'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { Mail, Facebook, Phone } from 'lucide-react'

export default function Footer() {
  const { t } = useLanguage()
  
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white mt-12 sm:mt-20">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              {t('footer.about')}
            </h3>
            <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
              {t('footer.aboutDesc')}
            </p>
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-3 text-gray-300">
              <li>
                <a href="/" className="hover:text-purple-300 transition-colors duration-200 flex items-center group">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  {t('nav.home')}
                </a>
              </li>
              <li>
                <a href="/listings/new" className="hover:text-purple-300 transition-colors duration-200 flex items-center group">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  {t('nav.newListing')}
                </a>
              </li>
            </ul>
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              {t('footer.contact')}
            </h3>
            <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 italic">
              {t('footer.contactAds')}
            </p>
            <div className="space-y-2 sm:space-y-3 text-gray-300 text-sm sm:text-base">
              <a 
                href="mailto:gamg002@gmail.com" 
                className="flex items-center hover:text-purple-300 transition-colors duration-200 group"
              >
                <Mail className="w-4 h-4 mr-2 text-purple-400 group-hover:text-purple-300" />
                <span>gamg002@gmail.com</span>
              </a>
              <a 
                href="https://www.facebook.com/Game.SSSK/" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center hover:text-purple-300 transition-colors duration-200 group"
              >
                <Facebook className="w-4 h-4 mr-2 text-purple-400 group-hover:text-purple-300" />
                <span>Facebook</span>
              </a>
              <a 
                href="tel:0908901837" 
                className="flex items-center hover:text-purple-300 transition-colors duration-200 group"
              >
                <Phone className="w-4 h-4 mr-2 text-purple-400 group-hover:text-purple-300" />
                <span>0908901837</span>
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-purple-800/50 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center">
          <p className="text-gray-400 text-xs sm:text-sm">&copy; 2024 RealEstate. {t('footer.copyright')}.</p>
        </div>
      </div>
    </footer>
  )
}

