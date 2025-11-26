'use client'

import { useEffect } from 'react'
import Script from 'next/script'

interface AdSenseProps {
  adSlot: string
  adFormat?: 'auto' | 'rectangle' | 'vertical' | 'horizontal'
  style?: React.CSSProperties
  className?: string
  fullWidthResponsive?: boolean
}

/**
 * Google AdSense Component
 * 
 * Usage:
 * <AdSense 
 *   adSlot="1234567890" 
 *   adFormat="auto"
 *   className="my-4"
 * />
 */
export default function AdSense({
  adSlot,
  adFormat = 'auto',
  style,
  className = '',
  fullWidthResponsive = true,
}: AdSenseProps) {
  // ใช้ client ID จาก environment variable หรือใช้ค่า default
  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-7897056302180263'

  return (
    <>
      <Script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`}
        crossOrigin="anonymous"
        strategy="lazyOnload"
      />
      <ins
        className={`adsbygoogle ${className}`}
        style={{
          display: 'block',
          ...style,
        }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
      />
      <Script id={`adsense-${adSlot}`} strategy="afterInteractive">
        {`
          try {
            (adsbygoogle = window.adsbygoogle || []).push({});
          } catch (e) {
            console.error('AdSense error:', e);
          }
        `}
      </Script>
    </>
  )
}

/**
 * Banner Ad (728x90 หรือ responsive)
 */
export function BannerAd({ adSlot, className }: { adSlot: string; className?: string }) {
  return (
    <div className={`w-full flex justify-center my-6 ${className || ''}`}>
      <AdSense
        adSlot={adSlot}
        adFormat="horizontal"
        className="w-full max-w-4xl"
        style={{ minHeight: '90px' }}
      />
    </div>
  )
}

/**
 * Sidebar Ad (300x250 หรือ responsive)
 */
export function SidebarAd({ adSlot, className }: { adSlot: string; className?: string }) {
  return (
    <div className={`w-full flex justify-center ${className || ''}`}>
      <AdSense
        adSlot={adSlot}
        adFormat="vertical"
        className="w-full max-w-xs"
        style={{ minHeight: '250px' }}
      />
    </div>
  )
}

/**
 * In-Article Ad (responsive)
 */
export function InArticleAd({ adSlot, className }: { adSlot: string; className?: string }) {
  return (
    <div className={`w-full flex justify-center my-8 ${className || ''}`}>
      <AdSense
        adSlot={adSlot}
        adFormat="auto"
        className="w-full"
        style={{ minHeight: '100px' }}
      />
    </div>
  )
}

/**
 * Square Ad (250x250)
 */
export function SquareAd({ adSlot, className }: { adSlot: string; className?: string }) {
  return (
    <div className={`w-full flex justify-center ${className || ''}`}>
      <AdSense
        adSlot={adSlot}
        adFormat="rectangle"
        className="w-full max-w-xs"
        style={{ minHeight: '250px' }}
      />
    </div>
  )
}

