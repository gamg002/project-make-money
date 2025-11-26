import { createBrowserClient } from '@supabase/ssr'

// Mock Supabase client สำหรับกรณีที่ยังไม่มี config
const createMockClient = () => {
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithPassword: async () => ({ data: { user: null }, error: { message: 'Supabase not configured' } }),
      signUp: async () => ({ data: { user: null }, error: { message: 'Supabase not configured' } }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
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

export function createClient() {
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
    return createBrowserClient(url, key)
  } catch (error) {
    console.warn('Failed to create Supabase client, using mock:', error)
    return createMockClient()
  }
}

