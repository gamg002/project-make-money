'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console for debugging
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          เกิดข้อผิดพลาด
        </h2>
        <p className="text-gray-600 mb-6">
          {error.message || 'เกิดข้อผิดพลาดที่ไม่คาดคิด'}
        </p>
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={reset}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            ลองอีกครั้ง
          </button>
          <Link
            href="/"
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    </div>
  )
}

