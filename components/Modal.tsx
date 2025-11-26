'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showCloseButton?: boolean
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}: ModalProps) {
  const { t } = useLanguage()
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
      
      {/* Modal Content */}
      <div
        className={`relative bg-white rounded-2xl shadow-glow-lg w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden flex flex-col border border-purple-100 animate-fade-in`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-5 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-white">
            {title && (
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="ml-auto text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded"
                aria-label={t('modal.close')}
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmColor?: 'primary' | 'danger'
  isLoading?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  confirmColor = 'primary',
  isLoading = false,
}: ConfirmDialogProps) {
  const { t } = useLanguage()
  const defaultConfirmText = confirmText || t('modal.confirm')
  const defaultCancelText = cancelText || t('modal.cancel')
  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm()
    }
  }

  const colorClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700',
    danger: 'bg-red-600 hover:bg-red-700',
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <p className="text-gray-700">{message}</p>
        
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {defaultCancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed ${colorClasses[confirmColor]}`}
          >
            {isLoading ? (
              <span className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{t('modal.processing')}</span>
              </span>
            ) : (
              defaultConfirmText
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}

interface AlertDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  buttonText?: string
}

export function AlertDialog({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  buttonText,
}: AlertDialogProps) {
  const { t } = useLanguage()
  const defaultButtonText = buttonText || t('modal.ok')
  const typeConfig = {
    success: {
      icon: '✓',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      borderColor: 'border-green-400',
      bgColor: 'bg-green-50',
      textColor: 'text-green-800',
    },
    error: {
      icon: '✕',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      borderColor: 'border-red-400',
      bgColor: 'bg-red-50',
      textColor: 'text-red-800',
    },
    warning: {
      icon: '⚠',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      borderColor: 'border-yellow-400',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-800',
    },
    info: {
      icon: 'ℹ',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-400',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-800',
    },
  }

  const config = typeConfig[type]

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="space-y-4">
        <div className={`flex items-start space-x-3 p-4 rounded-lg ${config.bgColor} border-l-4 ${config.borderColor}`}>
          <div className={`flex-shrink-0 w-8 h-8 rounded-full ${config.iconBg} flex items-center justify-center ${config.iconColor} font-bold text-lg`}>
            {config.icon}
          </div>
          <div className="flex-1">
            <h3 className={`font-semibold ${config.textColor} mb-1`}>{title}</h3>
            <p className={`${config.textColor} text-sm`}>{message}</p>
          </div>
        </div>
        
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className={`px-6 py-2 ${config.bgColor} ${config.textColor} rounded-lg hover:opacity-90 transition-opacity font-medium`}
          >
            {defaultButtonText}
          </button>
        </div>
      </div>
    </Modal>
  )
}

