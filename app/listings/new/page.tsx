'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Upload, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { compressImage, needsCompression, formatFileSize } from '@/lib/image-utils'
import { AlertDialog } from '@/components/Modal'

export default function NewListingPage() {
  const router = useRouter()
  const supabase = createClient()
  const { user, profile, loading: authLoading } = useAuth()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [compressing, setCompressing] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState({ title: '', message: '', type: 'info' as 'success' | 'error' | 'warning' | 'info' })
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin?redirect=/listings/new')
    }
  }, [user, authLoading, router])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    property_type: 'condo',
    transaction_type: 'sale',
    bedrooms: '',
    bathrooms: '',
    area_sqm: '',
    address: '',
    district: '',
    province: '',
    postal_code: '',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    contact_facebook: '',
    contact_line: '',
  })

  // ดึงข้อมูลการติดต่อจาก profile เมื่อ profile โหลดเสร็จ (เฉพาะครั้งแรกเท่านั้น)
  const [hasLoadedProfile, setHasLoadedProfile] = useState(false)
  useEffect(() => {
    if (profile && !hasLoadedProfile) {
      setFormData((prev) => ({
        ...prev,
        // เฉพาะเมื่อยังไม่มีข้อมูลเท่านั้นถึงจะดึงจาก profile
        contact_name: prev.contact_name || profile.full_name || '',
        contact_phone: prev.contact_phone || profile.phone || '',
        contact_email: prev.contact_email || user?.email || profile.email || '',
        contact_facebook: prev.contact_facebook || (profile as any).facebook || '',
        contact_line: prev.contact_line || (profile as any).line || '',
      }))
      setHasLoadedProfile(true)
    }
  }, [profile, user, hasLoadedProfile])

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
            // Compress image
            const compressedBlob = await compressImage(file, {
              maxWidth: 1920,
              maxHeight: 1920,
              quality: 0.85,
              format: 'jpeg',
            })
            // Convert blob back to File
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

        const newImages = [...images, ...processedFiles].slice(0, 10) // จำกัด 10 รูป
        setImages(newImages)

        // สร้าง preview
        const previews = newImages.map((file) => URL.createObjectURL(file))
        setImagePreviews(previews)
      } catch (error) {
        console.error('Error processing images:', error)
        setAlertMessage({
          title: t('newListing.imageError'),
          message: t('newListing.imageError'),
          type: 'error',
        })
        setShowAlert(true)
      } finally {
        setCompressing(false)
      }
    }
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    setImages(newImages)
    setImagePreviews(newPreviews)
  }

  const uploadImages = async (): Promise<string[]> => {
    if (images.length === 0) return []

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

    return uploadedUrls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // อัปโหลดรูปภาพ
      const imageUrls = await uploadImages()

      // ตรวจสอบว่าผู้ใช้ login
      if (!user) {
        setAlertMessage({
          title: t('newListing.signInRequired'),
          message: t('newListing.signInRequiredMessage'),
          type: 'warning',
        })
        setShowAlert(true)
        router.push('/auth/signin?redirect=/listings/new')
        setLoading(false)
        return
      }

      // Validate required fields
      if (!formData.title.trim()) {
        setAlertMessage({
          title: t('newListing.validation.title'),
          message: t('newListing.validation.titleMessage'),
          type: 'warning',
        })
        setShowAlert(true)
        setLoading(false)
        return
      }
      if (!formData.price || parseFloat(formData.price) <= 0) {
        setAlertMessage({
          title: t('newListing.validation.price'),
          message: t('newListing.validation.priceMessage'),
          type: 'warning',
        })
        setShowAlert(true)
        setLoading(false)
        return
      }
      
      // แปลงราคาเป็นจำนวนเต็มเพื่อไม่ให้มีทศนิยม
      const priceValue = Math.round(parseFloat(formData.price))
      if (!formData.address.trim()) {
        setAlertMessage({
          title: t('newListing.validation.address'),
          message: t('newListing.validation.addressMessage'),
          type: 'warning',
        })
        setShowAlert(true)
        setLoading(false)
        return
      }
      if (!formData.district.trim()) {
        setAlertMessage({
          title: t('newListing.validation.district'),
          message: t('newListing.validation.districtMessage'),
          type: 'warning',
        })
        setShowAlert(true)
        setLoading(false)
        return
      }
      if (!formData.province.trim()) {
        setAlertMessage({
          title: t('newListing.validation.province'),
          message: t('newListing.validation.provinceMessage'),
          type: 'warning',
        })
        setShowAlert(true)
        setLoading(false)
        return
      }
      if (!formData.contact_name.trim()) {
        setAlertMessage({
          title: t('newListing.validation.contactName'),
          message: t('newListing.validation.contactNameMessage'),
          type: 'warning',
        })
        setShowAlert(true)
        setLoading(false)
        return
      }
      if (!formData.contact_phone.trim()) {
        setAlertMessage({
          title: t('newListing.validation.contactName'),
          message: t('newListing.validation.contactPhoneMessage') || t('newListing.validation.contactNameMessage'),
          type: 'warning',
        })
        setShowAlert(true)
        setLoading(false)
        return
      }

      // บันทึกข้อมูลลงฐานข้อมูล
      console.log('Creating listing with data:', {
        title: formData.title,
        user_id: user.id,
        price: priceValue,
      })

      const { data, error } = await supabase
        .from('listings')
        .insert({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          price: priceValue,
          property_type: formData.property_type,
          transaction_type: formData.transaction_type,
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
          bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
          area_sqm: formData.area_sqm ? parseFloat(formData.area_sqm) : null,
          address: formData.address.trim(),
          district: formData.district.trim(),
          province: formData.province.trim(),
          postal_code: formData.postal_code.trim() || null,
          images: imageUrls,
          contact_name: formData.contact_name.trim(),
          contact_phone: formData.contact_phone.trim(),
          contact_email: formData.contact_email.trim() || null,
          contact_facebook: formData.contact_facebook.trim() || null,
          contact_line: formData.contact_line.trim() || null,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating listing:', error)
        setAlertMessage({
          title: t('newListing.error'),
          message: error.message || t('newListing.errorMessage'),
          type: 'error',
        })
        setShowAlert(true)
        setLoading(false)
        return
      }

      console.log('Listing created successfully:', data.id)

      // Redirect ไปหน้าดูรายละเอียด
      router.push(`/listings/${data.id}`)
    } catch (error) {
      console.error('Error:', error)
      setAlertMessage({
        title: t('newListing.error'),
        message: t('newListing.errorMessage'),
        type: 'error',
      })
      setShowAlert(true)
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // จะ redirect โดย useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('newListing.title')}</h1>

      <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-soft space-y-8 border border-purple-100">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('newListing.titleLabel')} *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
            placeholder={t('newListing.titlePlaceholder')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('newListing.description')}
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={5}
            className="w-full px-4 py-3 border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
            placeholder={t('newListing.descriptionPlaceholder')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('newListing.transactionType')} *
            </label>
            <select
              name="transaction_type"
              value={formData.transaction_type}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
            >
              <option value="sale">{t('search.sale')}</option>
              <option value="rent">{t('search.rent')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('newListing.propertyType')} *
            </label>
            <select
              name="property_type"
              value={formData.property_type}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
            >
              <option value="condo">{t('search.condo')}</option>
              <option value="house">{t('search.house')}</option>
              <option value="land">{t('search.land')}</option>
              <option value="commercial">{t('search.commercial')}</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('newListing.price')} *
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
            placeholder="5000000"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('newListing.bedrooms')}
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
              {t('newListing.bathrooms')}
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
              {t('newListing.area')}
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
            {t('newListing.address')} *
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
            placeholder={t('newListing.addressPlaceholder') || 'Street address'}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('newListing.district')} *
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
              {t('newListing.province')} *
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
              {t('newListing.postalCode')}
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
            {t('newListing.images')} ({t('newListing.maxImages')})
          </label>
          <div className="mt-2">
            <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-purple-200 rounded-xl cursor-pointer hover:border-primary-500 hover:bg-purple-50 transition-all duration-200">
              <div className="flex flex-col items-center">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">{t('newListing.uploadImages')}</span>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('newListing.contact')}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('newListing.contactName')} *
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
                {t('newListing.contactPhone')} *
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
              {t('newListing.contactEmail')}
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
              {t('newListing.contactFacebook')}
            </label>
            <input
              type="url"
              name="contact_facebook"
              value={formData.contact_facebook}
              onChange={handleInputChange}
              placeholder={t('newListing.contactFacebookPlaceholder')}
              className="w-full px-4 py-3 border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
            />
            <p className="mt-1 text-xs text-gray-500">
              {t('newListing.contactFacebookPlaceholder')}
            </p>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('newListing.contactLine')}
            </label>
            <input
              type="url"
              name="contact_line"
              value={formData.contact_line}
              onChange={handleInputChange}
              placeholder={t('newListing.contactLinePlaceholder')}
              className="w-full px-4 py-3 border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
            />
            <p className="mt-1 text-xs text-gray-500">
              {t('newListing.contactLinePlaceholder')}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 pt-6">
          <button
            type="submit"
            disabled={loading}
            className="gradient-purple text-white px-10 py-3.5 rounded-xl hover:shadow-glow transition-all duration-300 hover-lift font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
          >
            {loading ? t('newListing.loading') : t('newListing.submit')}
          </button>
          <Link
            href="/dashboard"
            className="px-8 py-3.5 border-2 border-purple-200 rounded-xl hover:bg-purple-50 hover:border-primary-300 transition-all duration-200 text-center font-medium"
          >
            {t('nav.dashboard')}
          </Link>
          <Link
            href="/"
            className="px-8 py-3.5 border-2 border-purple-200 rounded-xl hover:bg-purple-50 hover:border-primary-300 transition-all duration-200 text-center font-medium"
          >
            {t('nav.home')}
          </Link>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-8 py-3.5 border-2 border-purple-200 rounded-xl hover:bg-purple-50 hover:border-primary-300 transition-all duration-200 font-medium"
          >
            {t('common.cancel')}
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

