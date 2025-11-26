'use client'

import { useState } from 'react'
import Image from 'next/image'
import ImageGallery from './ImageGallery'
import { ZoomIn } from 'lucide-react'

interface ListingImageGalleryProps {
  images: string[]
  title: string
}

export default function ListingImageGallery({ images, title }: ListingImageGalleryProps) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="h-96 w-full bg-gray-200 flex items-center justify-center">
        <span className="text-gray-400">ไม่มีรูปภาพ</span>
      </div>
    )
  }

  const mainImage = images[0]
  const thumbnailImages = images.slice(1, 5)

  const handleImageClick = (index: number) => {
    setSelectedIndex(index)
    setIsGalleryOpen(true)
  }

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-2 sm:gap-3 bg-gray-50 p-2 sm:p-3 lg:p-4">
        {/* รูปภาพหลัก */}
        <div className="relative w-full lg:flex-1 h-64 sm:h-80 md:h-96 lg:h-[500px] bg-gray-200 rounded-lg sm:rounded-xl overflow-hidden group cursor-pointer">
          <Image
            src={mainImage}
            alt={title}
            fill
            className="object-cover"
            priority
            onClick={() => handleImageClick(0)}
            sizes="(max-width: 1024px) 100vw, 70vw"
          />
          {/* Overlay with zoom icon */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <ZoomIn className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
            </div>
          </div>
          {/* Image count badge - ย้ายไปด้านล่างซ้าย */}
          {images.length > 1 && (
            <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 bg-black bg-opacity-70 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium backdrop-blur-sm">
              {images.length} รูป
            </div>
          )}
        </div>

        {/* รูปภาพย่อย - แสดงด้านข้างบน desktop, ด้านล่างบน mobile */}
        {thumbnailImages.length > 0 && (
          <div className="flex lg:flex-col gap-2 sm:gap-3 w-full lg:w-24 xl:w-28 overflow-x-auto lg:overflow-y-auto pb-2 lg:pb-0 lg:h-[500px] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
            {thumbnailImages.map((image, index) => (
              <div
                key={index}
                className="relative flex-shrink-0 w-20 sm:w-24 md:w-28 lg:w-full h-20 sm:h-24 md:h-28 lg:h-24 xl:h-28 bg-gray-200 rounded-lg overflow-hidden group cursor-pointer border-2 border-transparent hover:border-primary-500 transition-all duration-300"
                onClick={() => handleImageClick(index + 1)}
              >
                <Image
                  src={image}
                  alt={`${title} ${index + 2}`}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  sizes="(max-width: 1024px) 112px, 112px"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                  <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            ))}
            {/* Show more indicator if there are more than 5 images */}
            {images.length > 5 && (
              <div
                className="relative flex-shrink-0 w-20 sm:w-24 md:w-28 lg:w-full h-20 sm:h-24 md:h-28 lg:h-24 xl:h-28 bg-gray-300 rounded-lg overflow-hidden group cursor-pointer flex items-center justify-center border-2 border-dashed border-gray-400 hover:border-primary-500 transition-all duration-300"
                onClick={() => handleImageClick(4)}
              >
                <div className="text-center">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-600">+{images.length - 5}</div>
                  <div className="text-xs text-gray-500 hidden sm:block">ดูเพิ่ม</div>
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lightbox Gallery */}
      {isGalleryOpen && (
        <ImageGallery
          images={images}
          initialIndex={selectedIndex}
          onClose={() => setIsGalleryOpen(false)}
        />
      )}
    </>
  )
}

