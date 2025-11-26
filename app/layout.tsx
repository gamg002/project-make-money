import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { AuthProvider } from '@/contexts/AuthContext'
import { LanguageProvider } from '@/contexts/LanguageContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ประกาศขาย-เช่าอสังหาริมทรัพย์',
  description: 'เว็บไซต์ประกาศขายและเช่าคอนโด บ้าน ที่ดิน',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // ใช้ client ID จาก environment variable หรือใช้ค่า default
  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-7897056302180263'

  return (
    <html lang="th">
      <head>
        {/* Google AdSense Script - ต้องอยู่ใน head tag สำหรับการยืนยัน */}
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`}
          crossOrigin="anonymous"
        />
      </head>
      <body className={inter.className}>
        <LanguageProvider>
          <AuthProvider>
            <Navbar />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}

