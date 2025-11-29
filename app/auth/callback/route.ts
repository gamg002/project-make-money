import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // ถ้ามี error ให้ redirect ไปหน้า signin พร้อม error message
  if (error) {
    const errorMessage = errorDescription || error
    return NextResponse.redirect(
      new URL(`/auth/signin?error=${encodeURIComponent(errorMessage)}`, requestUrl.origin)
    )
  }

  // ถ้ามี code ให้ exchange สำหรับ session
  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!exchangeError) {
      // สำเร็จ - redirect ไปหน้าที่ต้องการ
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    } else {
      // มี error ในการ exchange
      console.error('Error exchanging code for session:', exchangeError)
      return NextResponse.redirect(
        new URL(`/auth/signin?error=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin)
      )
    }
  }

  // ถ้าไม่มี code และไม่มี error ให้ redirect ไปหน้า signin
  return NextResponse.redirect(new URL('/auth/signin', requestUrl.origin))
}

