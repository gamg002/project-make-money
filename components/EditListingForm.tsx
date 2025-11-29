'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Upload, X } from 'lucide-react'
import { Listing } from '@/lib/types'
import { compressImage, needsCompression, formatFileSize } from '@/lib/image-utils'
import { AlertDialog } from '@/components/Modal'
import { useLanguage } from '@/contexts/LanguageContext'

interface EditListingFormProps {
  listing: Listing
}

export default function EditListingForm({ listing }: EditListingFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>(listing.images || [])
  const [compressing, setCompressing] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState({ title: '', message: '', type: 'info' as 'success' | 'error' | 'warning' | 'info' })
  const [formData, setFormData] = useState({
    title: listing.title || '',
    description: listing.description || '',
    price: listing.price?.toString() || '',
    property_type: listing.property_type || '',
    transaction_type: listing.transaction_type || '',
    bedrooms: listing.bedrooms?.toString() || '',
    bathrooms: listing.bathrooms?.toString() || '',
    area_sqm: listing.area_sqm?.toString() || '',
    address: listing.address || '',
    district: listing.district || '',
    province: listing.province || '',
    postal_code: listing.postal_code || '',
    contact_name: listing.contact_name || '',
    contact_phone: listing.contact_phone || '',
    contact_email: listing.contact_email || '',
    contact_facebook: listing.contact_facebook || '',
    contact_line: listing.contact_line || '',
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setCompressing(true)
      try {
        const files = Array.from(e.target.files)
        const processedFiles: File[] = []

        // Compress images if needed
        for (const file of files) {
          if (needsCompression(file, 1)) {
            const compressedBlob = await compressImage(file, {
              maxWidth: 1920,
              maxHeight: 1920,
              quality: 0.85,
              format: 'jpeg',
            })
            const compressedFile = new File(
              [compressedBlob],
              file.name.replace(/\.[^/.]+$/, '.jpg'),
              { type: 'image/jpeg' }
            )
            processedFiles.push(compressedFile)
            console.log(
              `Compressed: ${formatFileSize(file.size)} → ${formatFileSize(compressedFile.size)}`
            )
          } else {
            processedFiles.push(file)
          }
        }

        const newImages = [...images, ...processedFiles].slice(0, 10)
        setImages(newImages)

        const previews = newImages.map((file) => URL.createObjectURL(file))
        setImagePreviews([...listing.images, ...previews].slice(0, 10))
      } catch (error) {
        console.error('Error processing images:', error)
        setAlertMessage({
          title: t('editListing.error'),
          message: t('editListing.imageError'),
          type: 'error',
        })
        setShowAlert(true)
      } finally {
        setCompressing(false)
      }
    }
  }

  const removeImage = (index: number) => {
    if (index < listing.images.length) {
      // ลบรูปเดิม
      const newImages = listing.images.filter((_, i) => i !== index)
      setImagePreviews(newImages)
    } else {
      // ลบรูปใหม่
      const newIndex = index - listing.images.length
      const newImages = images.filter((_, i) => i !== newIndex)
      const newPreviews = newImages.map((file) => URL.createObjectURL(file))
      setImages(newImages)
      setImagePreviews([...listing.images, ...newPreviews])
    }
  }

  const uploadImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = []

    for (const image of images) {
      try {
        // Ensure image is compressed (double check)
        let fileToUpload = image
        if (needsCompression(image, 1)) {
          const compressedBlob = await compressImage(image, {
            maxWidth: 1920,
            maxHeight: 1920,
            quality: 0.85,
            format: 'jpeg',
          })
          fileToUpload = new File(
            [compressedBlob],
            image.name.replace(/\.[^/.]+$/, '.jpg'),
            { type: 'image/jpeg' }
          )
        }

        const fileExt = fileToUpload.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `listings/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('listings')
          .upload(filePath, fileToUpload, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) {
          console.error('Error uploading image:', uploadError)
          continue
        }

        const { data } = supabase.storage
          .from('listings')
          .getPublicUrl(filePath)

        if (data?.publicUrl) {
          uploadedUrls.push(data.publicUrl)
        }
      } catch (error) {
        console.error('Error processing image:', error)
        continue
      }
    }

    return [...listing.images, ...uploadedUrls]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let imageUrls = listing.images

      if (images.length > 0) {
        imageUrls = await uploadImages()
      }

      const { error } = await supabase
        .from('listings')
        .update({
          title: (formData.title || '').trim(),
          description: (formData.description || '').trim() || null,
          price: parseFloat(formData.price || '0'),
          property_type: formData.property_type || '',
          transaction_type: formData.transaction_type || '',
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
          bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
          area_sqm: formData.area_sqm ? parseFloat(formData.area_sqm) : null,
          address: (formData.address || '').trim(),
          district: (formData.district || '').trim(),
          province: (formData.province || '').trim(),
          postal_code: (formData.postal_code || '').trim() || null,
          images: imageUrls,
          contact_name: (formData.contact_name || '').trim(),
          contact_phone: (formData.contact_phone || '').trim(),
          contact_email: (formData.contact_email || '').trim() || null,
          contact_facebook: (formData.contact_facebook || '').trim() || null,
          contact_line: (formData.contact_line || '').trim() || null,
        })
        .eq('id', listing.id)

          if (error) {
            console.error('Error updating listing:', error)
            setAlertMessage({
              title: t('editListing.error'),
              message: error.message || t('editListing.errorMessage'),
              type: 'error',
            })
            setShowAlert(true)
            setLoading(false)
            return
          }

          // Redirect ไปหน้า detail (ไม่ต้อง refresh เพราะจะโหลดข้อมูลใหม่)
          router.push(`/listings/${listing.id}`)
        } catch (error) {
          console.error('Error:', error)
          setAlertMessage({
            title: t('editListing.error'),
            message: t('editListing.errorMessage'),
            type: 'error',
          })
          setShowAlert(true)
          setLoading(false)
        }
  }

  return (
    <div>
    <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-soft space-y-8 border border-purple-100">
      {/* ใช้ form เดียวกับหน้า new แต่เปลี่ยนค่าเริ่มต้น */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('editListing.titleLabel')} *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          required
          className="w-full px-4 py-3 border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('editListing.description')}
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={5}
          className="w-full px-4 py-3 border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('editListing.transactionType')} *
          </label>
          <select
            name="transaction_type"
            value={formData.transaction_type}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
          >
            <option value="sale">{t('transaction.sale')}</option>
            <option value="rent">{t('transaction.rent')}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('editListing.propertyType')} *
          </label>
          <select
            name="property_type"
            value={formData.property_type}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
          >
            <option value="condo">{t('property.condo')}</option>
            <option value="house">{t('property.house')}</option>
            <option value="land">{t('property.land')}</option>
            <option value="commercial">{t('property.commercial')}</option>
            <option value="room">{t('property.room')}</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('editListing.price')} *
        </label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleInputChange}
          required
          min="0"
          step="0.01"
          className="w-full px-4 py-3 border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('editListing.bedrooms')}
          </label>
          <input
            type="number"
            name="bedrooms"
            value={formData.bedrooms}
            onChange={handleInputChange}
            min="0"
            className="w-full px-4 py-3 border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('editListing.bathrooms')}
          </label>
          <input
            type="number"
            name="bathrooms"
            value={formData.bathrooms}
            onChange={handleInputChange}
            min="0"
            className="w-full px-4 py-3 border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('editListing.area')}
          </label>
          <input
            type="number"
            name="area_sqm"
            value={formData.area_sqm}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            className="w-full px-4 py-3 border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('editListing.address')} *
        </label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          required
          className="w-full px-4 py-3 border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('editListing.district')} *
          </label>
          <input
            type="text"
            name="district"
            value={formData.district}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('editListing.province')} *
          </label>
          <input
            type="text"
            name="province"
            value={formData.province}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('editListing.postalCode')}
          </label>
          <input
            type="text"
            name="postal_code"
            value={formData.postal_code}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('editListing.images')}
          {compressing && (
            <span className="ml-2 text-primary-600 text-xs">
              {t('editListing.compressing')}
            </span>
          )}
        </label>
        <div className="mt-2">
          <label className={`flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors ${compressing ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <div className="flex flex-col items-center">
              {compressing ? (
                <>
                  <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                  <span className="text-sm text-gray-600">{t('editListing.compressing')}</span>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">{t('editListing.uploadHint')}</span>
                  <span className="text-xs text-gray-500 mt-1">({t('editListing.uploadHintSub')})</span>
                </>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              disabled={compressing}
              className="hidden"
            />
          </label>
        </div>

        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('editListing.contactInfo')}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('editListing.contactName')} *
            </label>
            <input
              type="text"
              name="contact_name"
              value={formData.contact_name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('editListing.contactPhone')} *
            </label>
            <input
              type="tel"
              name="contact_phone"
              value={formData.contact_phone}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('editListing.contactEmail')}
          </label>
          <input
            type="email"
            name="contact_email"
            value={formData.contact_email}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('editListing.contactFacebook')}
          </label>
          <input
            type="url"
            name="contact_facebook"
            value={formData.contact_facebook}
            onChange={handleInputChange}
            placeholder={t('editListing.contactFacebookPlaceholder')}
            className="w-full px-4 py-3 border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
          />
          <p className="mt-1 text-xs text-gray-500">
            {t('editListing.contactFacebookPlaceholder')}
          </p>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('editListing.contactLine')}
          </label>
          <input
            type="url"
            name="contact_line"
            value={formData.contact_line}
            onChange={handleInputChange}
            placeholder={t('editListing.contactLinePlaceholder')}
            className="w-full px-4 py-3 border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
          />
          <p className="mt-1 text-xs text-gray-500">
            {t('editListing.contactLinePlaceholder')}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4 pt-6">
        <button
          type="submit"
          disabled={loading}
          className="gradient-purple text-white px-10 py-3.5 rounded-xl hover:shadow-glow transition-all duration-300 hover-lift font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
        >
          {loading ? t('editListing.saving') : t('editListing.save')}
        </button>
        <Link
          href={`/listings/${listing.id}`}
          className="px-8 py-3.5 border-2 border-purple-200 rounded-xl hover:bg-purple-50 hover:border-primary-300 transition-all duration-200 text-center font-medium"
        >
          {t('editListing.viewDetails')}
        </Link>
        <Link
          href="/dashboard"
          className="px-8 py-3.5 border-2 border-purple-200 rounded-xl hover:bg-purple-50 hover:border-primary-300 transition-all duration-200 text-center font-medium"
        >
          {t('editListing.backToDashboard')}
        </Link>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-8 py-3.5 border-2 border-purple-200 rounded-xl hover:bg-purple-50 hover:border-primary-300 transition-all duration-200 font-medium"
        >
          {t('editListing.cancel')}
        </button>
      </div>
    </form>

    {/* Alert Dialog */}
    <AlertDialog
      isOpen={showAlert}
      onClose={() => setShowAlert(false)}
      title={alertMessage.title}
      message={alertMessage.message}
      type={alertMessage.type}
    />
  </div>
  )
}

