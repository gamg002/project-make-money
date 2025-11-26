import Link from 'next/link'
import { CheckCircle, XCircle, ExternalLink } from 'lucide-react'

function checkEnvVar(name: string): boolean {
  const value = process.env[name]
  return !!(value && 
    !value.includes('your-project') && 
    !value.includes('your-key') &&
    (name.includes('URL') ? value.startsWith('https://') : value.length > 20)
  )
}

export default function SetupPage() {
  const hasUrl = checkEnvVar('NEXT_PUBLIC_SUPABASE_URL')
  const hasKey = checkEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  const isConfigured = hasUrl && hasKey

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          🚀 ตั้งค่า Supabase
        </h1>

        <div className="space-y-6">
          {/* Status Check */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">สถานะการตั้งค่า</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                {hasUrl ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-500" />
                )}
                <span className={hasUrl ? 'text-green-700' : 'text-red-700'}>
                  NEXT_PUBLIC_SUPABASE_URL {hasUrl ? '✓ ตั้งค่าแล้ว' : '✗ ยังไม่ได้ตั้งค่า'}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                {hasKey ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-500" />
                )}
                <span className={hasKey ? 'text-green-700' : 'text-red-700'}>
                  NEXT_PUBLIC_SUPABASE_ANON_KEY {hasKey ? '✓ ตั้งค่าแล้ว' : '✗ ยังไม่ได้ตั้งค่า'}
                </span>
              </div>
            </div>

            {isConfigured ? (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                <p className="text-green-800 font-medium">
                  ✅ ตั้งค่าเรียบร้อยแล้ว! เว็บไซต์พร้อมใช้งาน
                </p>
              </div>
            ) : (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-yellow-800">
                  ⚠️ ยังไม่ได้ตั้งค่า Supabase กำลังใช้โหมด Demo (ข้อมูลตัวอย่าง)
                </p>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div>
            <h2 className="text-xl font-semibold mb-4">📋 ขั้นตอนการตั้งค่า</h2>
            <ol className="list-decimal list-inside space-y-4 text-gray-700">
              <li>
                <strong>สร้างบัญชี Supabase</strong>
                <br />
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline inline-flex items-center space-x-1"
                >
                  <span>ไปที่ supabase.com</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
                {' '}และสร้างบัญชี (ฟรี)
              </li>
              <li>
                <strong>สร้างโปรเจกต์ใหม่</strong>
                <br />
                คลิก &quot;New Project&quot; → ตั้งชื่อ → เลือก Region: <strong>Southeast Asia</strong> → รอ 2-3 นาที
              </li>
              <li>
                <strong>หา API Keys</strong>
                <br />
                ไปที่ <strong>Settings</strong> → <strong>API</strong> → คัดลอก:
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li><strong>Project URL</strong> (อยู่ด้านบน)</li>
                  <li><strong>anon public</strong> key (ในส่วน Project API keys)</li>
                </ul>
              </li>
              <li>
                <strong>ตั้งค่า .env.local</strong>
                <br />
                เปิดไฟล์ <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code> ในโฟลเดอร์โปรเจกต์
                <br />
                ใส่ค่าที่คัดลอกมา:
                <pre className="bg-gray-100 p-4 rounded mt-2 overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}
                </pre>
              </li>
              <li>
                <strong>ตั้งค่า Database</strong>
                <br />
                ดูคำแนะนำใน{' '}
                <Link href="/QUICK_START.md" className="text-primary-600 hover:underline">
                  QUICK_START.md
                </Link>
                {' '}หรือ{' '}
                <Link href="/SETUP.md" className="text-primary-600 hover:underline">
                  SETUP.md
                </Link>
              </li>
              <li>
                <strong>รีสตาร์ทเซิร์ฟเวอร์</strong>
                <br />
                หยุดเซิร์ฟเวอร์ (Ctrl+C) แล้วรันใหม่: <code className="bg-gray-100 px-2 py-1 rounded">npm run dev</code>
              </li>
            </ol>
          </div>

          {/* Quick Links */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">🔗 ลิงก์ด่วน</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
              >
                <ExternalLink className="w-5 h-5 text-primary-600" />
                <span className="text-primary-700 font-medium">Supabase Dashboard</span>
              </a>
              <Link
                href="/"
                className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-gray-700 font-medium">← กลับหน้าหลัก</span>
              </Link>
            </div>
          </div>

          {/* Help */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <p className="text-blue-800">
              <strong>💡 คำแนะนำ:</strong> ใช้ script <code className="bg-blue-100 px-2 py-1 rounded">./setup-env.sh</code> เพื่อตั้งค่า .env.local อัตโนมัติ
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

