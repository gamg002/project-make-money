import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // สร้าง Supabase client โดยตรงใน API route
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ 
        error: 'Server configuration error' 
      }, { status: 500 })
    }

    // ใช้วิธีเดียวกับ middleware - ใช้ request.cookies โดยตรง
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
    
    const allCookies = request.cookies.getAll()
    
    // Debug: ตรวจสอบ cookies
    console.log('API Route - Cookies count:', allCookies.length)
    const authCookies = allCookies.filter(c => 
      c.name.includes('sb-') || c.name.includes('supabase')
    )
    console.log('API Route - Auth cookies:', authCookies.map(c => c.name))
    
    // Debug: ตรวจสอบ cookie values (ไม่แสดงค่าเต็มเพื่อความปลอดภัย)
    authCookies.forEach(cookie => {
      console.log(`API Route - Cookie ${cookie.name}: exists=${!!cookie.value}, length=${cookie.value?.length || 0}`)
    })
    
    // สร้าง Supabase client โดยใช้ cookies จาก request (เหมือน middleware)
    // แต่เราจะใช้ access token จาก header แทน
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
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
    } as any)
    
    // อ่าน access token จาก header ก่อนสร้าง client
    const authHeader = request.headers.get('authorization')
    let initialAccessToken: string | null = null
    if (authHeader && authHeader.startsWith('Bearer ')) {
      initialAccessToken = authHeader.substring(7)
    }

    // ใช้ access token ที่อ่านไว้แล้ว
    let user = null
    let userError = null
    let accessToken = initialAccessToken
    
    if (accessToken) {
      // ถ้ามี Authorization header ให้ใช้ token ในการ authenticate
      console.log('API Route - Using Authorization header token')
      
      // ใช้ token ในการ authenticate
      const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(accessToken)
      user = tokenUser
      userError = tokenError
      
      if (user) {
        console.log('API Route - User authenticated via token:', user.id)
      }
    }
    
    // ถ้ายังไม่มี user ให้ลองใช้ cookies
    if (!user) {
      console.log('API Route - Trying to authenticate via cookies...')
      
      // ลอง refresh session ก่อน (เหมือน middleware)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        accessToken = session.access_token
      }
      
      // ใช้ getUser() โดยตรง
      const getUserResult = await supabase.auth.getUser()
      user = getUserResult.data.user
      userError = getUserResult.error

      // Debug: ตรวจสอบ user
      console.log('API Route - User exists:', !!user)
      console.log('API Route - User error:', userError?.message)
    }
    
    // ถ้ายังไม่มี user ให้ return error
    if (userError || !user) {
      console.error('Auth error:', userError)
      console.error('API Route - Cannot authenticate user')
      
      return NextResponse.json({ 
        error: 'Unauthorized', 
        details: 'Session expired or invalid. Please sign in again.' 
      }, { status: 401 })
    }

    // ตรวจสอบว่าเป็นเจ้าของประกาศ
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('user_id')
      .eq('id', params.id)
      .single()

    if (listingError || !listing) {
      console.error('Listing fetch error:', listingError)
      return NextResponse.json({ 
        error: 'Listing not found' 
      }, { status: 404 })
    }

    if (listing.user_id !== user.id) {
      return NextResponse.json({ 
        error: 'Forbidden',
        details: 'You do not have permission to delete this listing'
      }, { status: 403 })
    }

    console.log('API Route - Attempting to delete listing:', params.id)
    console.log('API Route - User ID:', user.id)
    console.log('API Route - Listing user_id:', listing.user_id)
    console.log('API Route - Has access token:', !!accessToken)
    
    // ใช้ PostgREST API โดยตรงด้วย access token เพื่อให้ RLS ทำงาน
    // เพราะ Supabase client อาจไม่ส่ง user context ถูกต้อง
    let deleteData: any[] = []
    let deleteError: any = null
    
    if (accessToken) {
      // ใช้ PostgREST API โดยตรง
      const deleteUrl = `${supabaseUrl}/rest/v1/listings?id=eq.${params.id}&user_id=eq.${user.id}`
      console.log('API Route - Using PostgREST API directly')
      
      try {
        const deleteResponse = await fetch(deleteUrl, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'apikey': supabaseKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation', // Return deleted rows
          },
        })
        
        if (!deleteResponse.ok) {
          const errorText = await deleteResponse.text()
          deleteError = { message: errorText, status: deleteResponse.status }
          console.error('API Route - PostgREST delete error:', deleteError)
        } else {
          deleteData = await deleteResponse.json()
          console.log('API Route - PostgREST delete success, deleted rows:', deleteData.length)
        }
      } catch (fetchError) {
        deleteError = fetchError
        console.error('API Route - Fetch error:', fetchError)
      }
    } else {
      // Fallback: ใช้ Supabase client
      console.log('API Route - Using Supabase client (no token)')
      const result = await supabase
        .from('listings')
        .delete()
        .eq('id', params.id)
        .eq('user_id', user.id)
        .select()
      
      deleteData = result.data || []
      deleteError = result.error
    }

    console.log('API Route - Delete result:', { 
      deleteData: deleteData?.length || 0, 
      deleteError: deleteError?.message, 
    })
    
    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json({ 
        error: deleteError.message 
      }, { status: 500 })
    }
    
    // ตรวจสอบว่าลบได้จริงหรือไม่
    if (!deleteData || deleteData.length === 0) {
      console.error('API Route - Delete returned no data, listing may not exist or RLS blocked deletion')
      
      // ลองตรวจสอบว่ายังมีข้อมูลอยู่หรือไม่
      const { data: checkData, error: checkError } = await supabase
        .from('listings')
        .select('id')
        .eq('id', params.id)
        .single()
      
      if (checkData) {
        console.error('API Route - Listing still exists after delete attempt - RLS may be blocking')
        return NextResponse.json({ 
          error: 'Failed to delete listing. RLS policy may be blocking deletion.',
          details: 'Please check your database RLS policies.'
        }, { status: 500 })
      }
    }
    
    console.log('API Route - Delete successful, deleted rows:', deleteData?.length || 0)

    // ส่ง response พร้อม cookies
    const successResponse = NextResponse.json({ success: true, redirect: '/dashboard' })
    
    // Copy cookies จาก response object
    response.cookies.getAll().forEach(cookie => {
      successResponse.cookies.set(cookie.name, cookie.value, cookie)
    })
    
    return successResponse
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

