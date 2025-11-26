'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface ImageGalleryProps {
  images: string[]
  initialIndex?: number
  onClose: () => void
}

export default function ImageGallery({ images, initialIndex = 0, onClose }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    // Prevent body scroll when gallery is open
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [images.length, onClose])

  if (images.length === 0) {
    return null
  }

  const currentImage = images[currentIndex]

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-95 flex flex-col items-center justify-center"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-2 sm:top-4 right-2 sm:right-4 z-20 text-white hover:text-gray-300 transition-colors p-2 sm:p-3 bg-black bg-opacity-50 rounded-full backdrop-blur-sm"
        aria-label="ปิด"
      >
        <X className="w-6 h-6 sm:w-8 sm:h-8" />
      </button>

      {/* Previous Button */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            handlePrevious()
          }}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 text-white hover:text-gray-300 transition-colors p-2 sm:p-3 bg-black bg-opacity-50 rounded-full backdrop-blur-sm"
          aria-label="รูปก่อนหน้า"
        >
          <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>
      )}

      {/* Image Container - ปรับให้มีพื้นที่สำหรับ thumbnail */}
      <div
        className="relative w-full flex-1 flex items-center justify-center p-2 sm:p-4 pb-20 sm:pb-24 md:pb-28"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full h-full max-w-7xl max-h-full">
          <Image
            src={currentImage}
            alt={`Image ${currentIndex + 1} of ${images.length}`}
            fill
            className="object-contain"
            priority
            sizes="100vw"
          />
        </div>
      </div>

      {/* Next Button */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleNext()
          }}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 text-white hover:text-gray-300 transition-colors p-2 sm:p-3 bg-black bg-opacity-50 rounded-full backdrop-blur-sm"
          aria-label="รูปถัดไป"
        >
          <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>
      )}

      {/* Image Counter - ย้ายไปด้านบน */}
      {images.length > 1 && (
        <div className="absolute top-2 sm:top-4 left-1/2 -translate-x-1/2 z-20 text-white bg-black bg-opacity-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium backdrop-blur-sm">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Thumbnail Strip - อยู่ด้านล่างสุด ไม่บังรูป */}
      {images.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-black bg-opacity-60 backdrop-blur-sm py-2 sm:py-3 px-2 sm:px-4">
          <div className="flex gap-1.5 sm:gap-2 justify-center max-w-full overflow-x-auto scrollbar-thin scrollbar-thumb-white scrollbar-track-transparent pb-1">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentIndex(index)
                }}
                className={`relative flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentIndex
                    ? 'border-white scale-110 shadow-lg'
                    : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'
                }`}
              >
                <Image
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 48px, (max-width: 768px) 64px, 80px"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

