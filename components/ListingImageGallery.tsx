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
      {/* รูปภาพหลัก */}
      <div className="relative h-96 w-full bg-gray-200 group cursor-pointer">
        <Image
          src={mainImage}
          alt={title}
          fill
          className="object-cover"
          priority
          onClick={() => handleImageClick(0)}
        />
        {/* Overlay with zoom icon */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <ZoomIn className="w-12 h-12 text-white" />
          </div>
        </div>
        {/* Image count badge */}
        {images.length > 1 && (
          <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
            +{images.length - 1} รูป
          </div>
        )}
      </div>

      {/* รูปภาพย่อย */}
      {thumbnailImages.length > 0 && (
        <div className="grid grid-cols-4 gap-2 p-4 bg-gray-50">
          {thumbnailImages.map((image, index) => (
            <div
              key={index}
              className="relative h-24 w-full bg-gray-200 rounded overflow-hidden group cursor-pointer"
              onClick={() => handleImageClick(index + 1)}
            >
              <Image
                src={image}
                alt={`${title} ${index + 2}`}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
          ))}
          {/* Show more indicator if there are more than 5 images */}
          {images.length > 5 && (
            <div
              className="relative h-24 w-full bg-gray-300 rounded overflow-hidden group cursor-pointer flex items-center justify-center"
              onClick={() => handleImageClick(4)}
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">+{images.length - 5}</div>
                <div className="text-xs text-gray-500">ดูเพิ่มเติม</div>
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
            </div>
          )}
        </div>
      )}

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

