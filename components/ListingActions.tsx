'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Edit, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { ConfirmDialog, AlertDialog } from '@/components/Modal'

interface ListingActionsProps {
  listingId: string
  onDelete?: () => void
}

export default function ListingActions({ listingId, onDelete }: ListingActionsProps) {
  const router = useRouter()
  const supabase = createClient()
  const { t } = useLanguage()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState({ title: '', message: '', type: 'info' as 'success' | 'error' | 'warning' | 'info' })

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    setIsDeleting(true)
    try {
      // Refresh session และดึง access token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        setAlertMessage({
          title: t('dashboard.signInRequired'),
          message: t('dashboard.signInRequiredMessage'),
          type: 'warning',
        })
        setShowAlert(true)
        setIsDeleting(false)
        router.push('/auth/signin?redirect=/dashboard')
        return
      }
      
      const response = await fetch(`/api/listings/${listingId}/delete`, {
        method: 'POST',
        credentials: 'include', // ส่ง cookies ไปด้วย
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`, // ส่ง access token
        },
      })

      if (response.ok) {
        setShowDeleteConfirm(false)
        setAlertMessage({
          title: t('actions.deleteSuccess'),
          message: t('actions.deleteSuccessMessage'),
          type: 'success',
        })
        setShowAlert(true)
        
        if (onDelete) {
          onDelete()
        }
        // Redirect ไปหน้า dashboard หลังจากปิด alert
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
      } else {
        const errorData = await response.json()
        setShowDeleteConfirm(false)
        setAlertMessage({
          title: t('actions.deleteError'),
          message: errorData.error || errorData.details || t('actions.deleteErrorMessage'),
          type: 'error',
        })
        setShowAlert(true)
      }
    } catch (error) {
      console.error('Error deleting listing:', error)
      setShowDeleteConfirm(false)
      setAlertMessage({
        title: t('actions.deleteError'),
        message: t('actions.deleteErrorMessage'),
        type: 'error',
      })
      setShowAlert(true)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Link
        href={`/listings/${listingId}/edit`}
        className="flex items-center px-6 py-2.5 gradient-purple text-white rounded-xl hover:shadow-glow transition-all duration-300 hover-lift font-medium"
      >
        <Edit className="w-4 h-4 mr-2" />
        {t('actions.edit')}
      </Link>
      <button
        onClick={handleDeleteClick}
        disabled={isDeleting}
        className="flex items-center px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 hover:shadow-lg transition-all duration-300 hover-lift disabled:opacity-50 font-medium"
      >
        <Trash2 className="w-4 h-4 mr-2" />
        {t('actions.delete')}
      </button>
      <Link
        href="/dashboard"
        className="flex items-center px-6 py-2.5 border-2 border-purple-200 rounded-xl hover:bg-purple-50 hover:border-primary-300 transition-all duration-200 font-medium"
      >
        {t('actions.dashboard')}
      </Link>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title={t('actions.deleteConfirm')}
        message={t('actions.deleteConfirmMessage')}
        confirmText={t('actions.delete')}
        cancelText={t('modal.cancel')}
        confirmColor="danger"
        isLoading={isDeleting}
      />

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

