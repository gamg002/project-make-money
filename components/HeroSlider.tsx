'use client'

import { useState, useEffect, useMemo } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'

interface HeroSlide {
  id: string
  image: string
  title?: string
  subtitle?: string
  link?: string
}

interface HeroSliderProps {
  slides?: HeroSlide[]
}

// ตรวจสอบว่า URL รูปภาพถูกต้องหรือไม่
function isValidImageUrl(url: string): boolean {
  if (!url || url.trim() === '') return false
  // ตรวจสอบว่าเป็น URL ที่ถูกต้อง
  try {
    const urlObj = new URL(url)
    // ตรวจสอบว่าไม่ใช่แค่ domain เปล่าๆ
    return urlObj.pathname !== '/' || urlObj.search !== '' || urlObj.hash !== ''
  } catch {
    return false
  }
}

export default function HeroSlider({ slides }: HeroSliderProps) {
  const { t } = useLanguage()
  const [currentSlide, setCurrentSlide] = useState(0)

  // Default slide - แสดงข้อความ default
  const defaultSlide: HeroSlide = useMemo(() => ({
    id: 'default',
    image: '',
    title: t('home.title'),
    subtitle: t('home.subtitle'),
  }), [t])

  // ถ้ามีโฆษณา ให้เพิ่ม default slide เป็นอันแรก
  // ถ้าไม่มีโฆษณา ให้แสดงแค่ default slide
  const hasAds = slides && slides.length > 0
  const slideList = useMemo(() => {
    return hasAds 
      ? [defaultSlide, ...slides]
      : [defaultSlide]
  }, [hasAds, slides, defaultSlide])

  // Auto slide with different timing
  useEffect(() => {
    // ถ้าไม่มีโฆษณา ไม่ต้องสไลด์
    if (!hasAds || slideList.length <= 1) return

    const totalSlides = slideList.length
    let timeoutId: NodeJS.Timeout
    const delay = currentSlide === 0 ? 2000 : 5000

    timeoutId = setTimeout(() => {
      setCurrentSlide((prev) => {
        // จาก default slide (index 0) → ไปที่โฆษณาแรก (index 1)
        if (prev === 0) {
          return 1
        }
        // จากโฆษณาสุดท้าย → วนกลับไปที่โฆษณาแรก (index 1)
        if (prev >= totalSlides - 1) {
          return 1
        }
        // ไปที่ slide ถัดไป
        return prev + 1
      })
    }, delay)

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [currentSlide, slideList.length, hasAds])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const goToPrevious = () => {
    setCurrentSlide((prev) => {
      if (!hasAds) return prev
      // ถ้าอยู่ที่โฆษณาแรก (index 1) ให้ไปที่โฆษณาสุดท้าย
      if (prev === 1) {
        return slideList.length - 1
      }
      // ถ้าอยู่ที่ default slide (index 0) ให้ไปที่โฆษณาสุดท้าย
      if (prev === 0) {
        return slideList.length - 1
      }
      // ถ้าไม่ใช่ ให้ไปที่ slide ก่อนหน้า
      return prev - 1
    })
  }

  const goToNext = () => {
    setCurrentSlide((prev) => {
      if (!hasAds) return prev
      // ถ้าอยู่ที่โฆษณาสุดท้าย ให้วนกลับไปที่โฆษณาแรก (index 1)
      if (prev === slideList.length - 1) {
        return 1
      }
      // ถ้าไม่ใช่ ให้ไปที่ slide ถัดไป
      return prev + 1
    })
  }

  const currentSlideData = slideList[currentSlide]

  const handleSlideClick = () => {
    if (currentSlideData.link) {
      window.open(currentSlideData.link, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div 
      className={`relative w-full mb-10 rounded-2xl overflow-hidden bg-white ${currentSlideData.link ? 'cursor-pointer' : ''}`}
      onClick={handleSlideClick}
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        {currentSlideData.image && isValidImageUrl(currentSlideData.image) ? (
          <Image
            src={currentSlideData.image}
            alt={currentSlideData.title || 'Hero Slide'}
            fill
            className="object-cover"
            priority
            sizes="100vw"
            onError={(e) => {
              // ถ้าโหลดรูปภาพไม่สำเร็จ ให้ซ่อนรูปภาพ
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <div className="w-full h-full bg-white" />
        )}
        {/* Light overlay for better text readability when image exists */}
        {currentSlideData.image && isValidImageUrl(currentSlideData.image) && (
          <div className="absolute inset-0 bg-white/50" />
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 pt-8 pb-4">
        <div className="max-w-4xl mx-auto">
          {currentSlideData.title && (
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 bg-clip-text text-transparent break-words leading-[1.6] py-4 overflow-visible drop-shadow-lg" style={{ lineHeight: '1.6', paddingTop: '1rem', paddingBottom: '1rem' }}>
              {currentSlideData.title}
            </h1>
          )}
          {currentSlideData.subtitle && (
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto break-words leading-relaxed drop-shadow-md">
              {currentSlideData.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Navigation Arrows - Only show if more than 1 slide */}
      {slideList.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              goToPrevious()
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all duration-200 hover:scale-110"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              goToNext()
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all duration-200 hover:scale-110"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </>
      )}

      {/* Dots Indicator - Only show if more than 1 slide */}
      {slideList.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
          {slideList.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation()
                goToSlide(index)
              }}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentSlide
                  ? 'bg-primary-600 w-8'
                  : 'bg-gray-400 hover:bg-gray-500'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

