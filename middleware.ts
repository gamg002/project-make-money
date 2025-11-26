import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // ตรวจสอบว่า Supabase configured หรือยัง
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey || 
      supabaseUrl.includes('your-project') || 
      supabaseKey.includes('your-key')) {
    // ถ้ายังไม่ configured ให้ผ่านไป (ใช้ mock mode)
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value)
              response.cookies.set(name, value, options)
            })
          },
        } as any,
      } as any
    )

    // Refresh session เพื่อให้แน่ใจว่า session ยัง valid
    await supabase.auth.getSession()
    
    // ตรวจสอบ user
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    // ถ้าต้องการเข้าหน้าที่ต้อง login
    if (
      request.nextUrl.pathname.startsWith('/dashboard') ||
      request.nextUrl.pathname.startsWith('/listings/new') ||
      (request.nextUrl.pathname.startsWith('/listings') && request.nextUrl.pathname.includes('/edit'))
    ) {
      // ถ้ายังไม่มี user หรือมี error
      if (!user || error) {
        // ตรวจสอบว่าไม่ได้อยู่ใน redirect loop
        const referer = request.headers.get('referer')
        const isFromSignin = referer && referer.includes('/auth/signin')
        
        // ถ้าไม่ได้มาจาก signin ให้ redirect
        if (!isFromSignin) {
          const redirectUrl = request.nextUrl.clone()
          redirectUrl.pathname = '/auth/signin'
          redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
          return NextResponse.redirect(redirectUrl)
        }
        // ถ้ามาจาก signin แล้ว ให้ผ่านไป (อาจเป็น session ยังไม่ sync)
      }
    }

    // ไม่ต้อง redirect ถ้า login แล้วไปหน้า signin/signup
    // ให้ signin/signup page จัดการเอง
  } catch (error) {
    // ถ้ามี error ในการสร้าง client ให้ผ่านไป
    console.warn('Middleware error:', error)
  }

  return response
}

export const config = {
  matcher: [
    // เพิ่ม API routes เพื่อ refresh session
    '/api/listings/:path*',
    // ปิด middleware สำหรับ pages ชั่วคราวเพื่อแก้ปัญหา redirect loop
    // '/dashboard/:path*',
    // '/listings/new',
    // '/listings/:path*/edit',
  ],
}

