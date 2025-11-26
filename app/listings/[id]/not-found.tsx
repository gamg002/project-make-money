import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">ไม่พบประกาศ</h1>
      <p className="text-gray-600 mb-8">
        ประกาศที่คุณกำลังมองหาอาจถูกลบหรือไม่มีอยู่แล้ว
      </p>
      <Link
        href="/"
        className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
      >
        กลับไปหน้าหลัก
      </Link>
    </div>
  )
}

