import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Mock Supabase client สำหรับกรณีที่ยังไม่มี config
const createMockClient = () => {
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({ data: null, error: { message: 'Supabase not configured' } }),
        order: () => ({ limit: () => ({ data: null, error: { message: 'Supabase not configured' } }) }),
      }),
      insert: () => ({ select: () => ({ single: () => ({ data: null, error: { message: 'Supabase not configured' } }) }) }),
      update: () => ({ eq: () => ({ data: null, error: { message: 'Supabase not configured' } }) }),
      delete: () => ({ eq: () => ({ data: null, error: { message: 'Supabase not configured' } }) }),
    }),
    storage: {
      from: () => ({
        upload: async () => ({ error: { message: 'Supabase not configured' } }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
  } as any
}

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // ตรวจสอบว่ามี config หรือยัง
  const isConfigured = url && key && 
    !url.includes('your-project') && 
    !key.includes('your-key') &&
    url.startsWith('https://') &&
    key.length > 20

  // ถ้ายังไม่มี config ให้ใช้ mock client
  if (!isConfigured) {
    return createMockClient()
  }

  try {
    const cookieStore = await cookies()
    return createServerClient(url!, key!, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      } as any,
    } as any)
  } catch (error) {
    console.warn('Failed to create Supabase client, using mock:', error)
    return createMockClient()
  }
}

