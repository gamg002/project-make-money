'use client'

import { useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

interface NotificationBannerProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message?: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number // milliseconds, 0 = ไม่ปิดอัตโนมัติ
}

export default function NotificationBanner({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  duration = 5000, // 5 seconds default
}: NotificationBannerProps) {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isOpen, duration, onClose])

  if (!isOpen) return null

  const typeConfig = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-gradient-to-r from-green-50 to-emerald-50',
      borderColor: 'border-green-400',
      iconColor: 'text-green-600',
      titleColor: 'text-green-900',
      messageColor: 'text-green-800',
      iconBg: 'bg-green-100',
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-gradient-to-r from-red-50 to-rose-50',
      borderColor: 'border-red-400',
      iconColor: 'text-red-600',
      titleColor: 'text-red-900',
      messageColor: 'text-red-800',
      iconBg: 'bg-red-100',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-gradient-to-r from-yellow-50 to-amber-50',
      borderColor: 'border-yellow-400',
      iconColor: 'text-yellow-600',
      titleColor: 'text-yellow-900',
      messageColor: 'text-yellow-800',
      iconBg: 'bg-yellow-100',
    },
    info: {
      icon: Info,
      bgColor: 'bg-gradient-to-r from-blue-50 to-cyan-50',
      borderColor: 'border-blue-400',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-900',
      messageColor: 'text-blue-800',
      iconBg: 'bg-blue-100',
    },
  }

  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <div className="fixed top-20 left-0 right-0 z-50 px-4 sm:px-6 animate-fade-in">
      <div
        className={`max-w-4xl mx-auto ${config.bgColor} border-l-4 ${config.borderColor} rounded-lg shadow-lg p-4 sm:p-5`}
      >
        <div className="flex items-start">
          <div className={`flex-shrink-0 ${config.iconBg} rounded-full p-2`}>
            <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${config.iconColor}`} />
          </div>
          <div className="ml-3 sm:ml-4 flex-1">
            <h3 className={`text-base sm:text-lg font-semibold ${config.titleColor} mb-1`}>
              {title}
            </h3>
            {message && (
              <p className={`text-sm sm:text-base ${config.messageColor}`}>
                {message}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className={`ml-4 flex-shrink-0 ${config.iconColor} hover:opacity-70 transition-opacity`}
            aria-label="Close"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>
    </div>
  )
}

