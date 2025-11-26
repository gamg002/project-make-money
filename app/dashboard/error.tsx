'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console for debugging
    console.error('Dashboard error:', error)
    
    // ถ้า error เกี่ยวกับ authentication ให้ redirect ไป signin
    if (error.message && (error.message.includes('auth') || error.message.includes('user'))) {
      // ใช้ window.location แทน useRouter เพื่อหลีกเลี่ยง hook issues
      setTimeout(() => {
        window.location.href = '/auth/signin?redirect=/dashboard'
      }, 1000)
    }
  }, [error])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          เกิดข้อผิดพลาด
        </h2>
        <p className="text-gray-600 mb-6">{error.message}</p>
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={reset}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            ลองอีกครั้ง
          </button>
          <Link
            href="/auth/signin"
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            ไปหน้า Login
          </Link>
        </div>
      </div>
    </div>
  )
}

