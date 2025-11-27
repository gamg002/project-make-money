import { createClient } from '@/lib/supabase/server'
import { Listing } from '@/lib/types'
import HomePageContent from '@/components/HomePageContent'

export const revalidate = 60 // Revalidate every 60 seconds

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !!(url && key && !url.includes('your-project') && !key.includes('your-key'))
}

interface AdvertisementRow {
  id: string
  image_url: string
  link_url: string
  title: string | null
  subtitle: string | null
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

async function getAdvertisements() {
  if (!isSupabaseConfigured()) {
    return []
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('advertisements')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching advertisements:', error)
      return []
    }

    return (data || []).map((ad: AdvertisementRow) => ({
      id: ad.id,
      image: ad.image_url,
      link: ad.link_url,
      title: ad.title || undefined,
      subtitle: ad.subtitle || undefined,
    }))
  } catch (error) {
    console.error('Error fetching advertisements:', error)
    return []
  }
}

async function getListings(
  filters: {
    property_type?: string
    transaction_type?: string
    min_price?: number
    max_price?: number
    bedrooms?: number
    province?: string
    district?: string
    search?: string
  } = {},
  searchParams: { [key: string]: string | string[] | undefined } = {}
) {
  // ตรวจสอบว่า Supabase config มีหรือไม่
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase ยังไม่ได้ตั้งค่า กรุณาตรวจสอบไฟล์ .env.local')
  }

  const supabase = await createClient()
  
  // เพิ่ม pagination
  const page = Number(searchParams.page) || 1
  const limit = 20
  const offset = (page - 1) * limit
  
  let query = supabase
    .from('listings')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (filters.property_type) {
    query = query.eq('property_type', filters.property_type)
  }

  if (filters.transaction_type) {
    query = query.eq('transaction_type', filters.transaction_type)
  }

  if (filters.min_price) {
    query = query.gte('price', filters.min_price)
  }

  if (filters.max_price) {
    query = query.lte('price', filters.max_price)
  }

  if (filters.bedrooms) {
    query = query.eq('bedrooms', filters.bedrooms)
  }

  if (filters.province) {
    query = query.eq('province', filters.province)
  }

  if (filters.district) {
    query = query.eq('district', filters.district)
  }

  if (filters.search) {
    const searchTerm = filters.search.replace(/'/g, "''") // escape single quotes
    
    // ค้นหาจาก title, description, address, contact_name และชื่อ user (full_name จาก profiles)
    // ขั้นแรก: ค้นหา user_id ที่มี full_name ตรงกับ search term
    const { data: matchingUsers } = await supabase
      .from('profiles')
      .select('id')
      .ilike('full_name', `%${searchTerm}%`)
    
    const userIds = (matchingUsers || []).map((u: { id: string }) => u.id)
    
    // สร้าง search conditions สำหรับ listings fields
    const searchConditions = [
      `title.ilike.%${searchTerm}%`,
      `description.ilike.%${searchTerm}%`,
      `address.ilike.%${searchTerm}%`,
      `contact_name.ilike.%${searchTerm}%`
    ]
    
    // ถ้ามี user ที่ตรงกับ search term ให้ค้นหาจาก user_id ด้วย
    if (userIds.length > 0) {
      // สร้าง base query ที่มี filters อื่นๆ แล้ว
      let baseQuery = supabase
        .from('listings')
        .select('*', { count: 'exact' })
      
      // Apply filters อื่นๆ
      if (filters.property_type) {
        baseQuery = baseQuery.eq('property_type', filters.property_type)
      }
      if (filters.transaction_type) {
        baseQuery = baseQuery.eq('transaction_type', filters.transaction_type)
      }
      if (filters.min_price) {
        baseQuery = baseQuery.gte('price', filters.min_price)
      }
      if (filters.max_price) {
        baseQuery = baseQuery.lte('price', filters.max_price)
      }
      if (filters.bedrooms) {
        baseQuery = baseQuery.eq('bedrooms', filters.bedrooms)
      }
      if (filters.province) {
        baseQuery = baseQuery.eq('province', filters.province)
      }
      if (filters.district) {
        baseQuery = baseQuery.eq('district', filters.district)
      }
      
      // ดึงข้อมูลที่ตรงกับ search conditions
      const { data: listingsByFields, error: fieldsError } = await baseQuery.or(searchConditions.join(','))
      
      if (fieldsError) {
        console.error('Error fetching listings by fields:', fieldsError)
      }
      
      // ดึงข้อมูลที่ user_id ตรงกับ search term (พร้อม filters อื่นๆ)
      const { data: listingsByUser, error: userError } = await baseQuery.in('user_id', userIds)
      
      if (userError) {
        console.error('Error fetching listings by user:', userError)
      }
      
      // รวมผลลัพธ์และลบ duplicates
      const allListings = [
        ...(listingsByFields || []),
        ...(listingsByUser || [])
      ]
      const uniqueListings = Array.from(
        new Map(allListings.map((item: any) => [item.id, item])).values()
      ) as Listing[]
      
      // Sort และ paginate
      uniqueListings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      const paginated = uniqueListings.slice(offset, offset + limit)
      
      return {
        listings: paginated,
        total: uniqueListings.length,
        page,
        limit,
      }
    } else {
      // ไม่มี user ที่ตรงกับ search term ใช้ search ปกติ
      query = query.or(searchConditions.join(','))
    }
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching listings:', error)
    throw new Error(`ไม่สามารถดึงข้อมูลจากฐานข้อมูลได้: ${error.message}`)
  }

  return {
    listings: (data as Listing[]) || [],
    total: count || 0,
    page,
    limit,
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const filters = {
    property_type: searchParams.property_type as string | undefined,
    transaction_type: searchParams.transaction_type as string | undefined,
    min_price: searchParams.min_price ? Number(searchParams.min_price) : undefined,
    max_price: searchParams.max_price ? Number(searchParams.max_price) : undefined,
    bedrooms: searchParams.bedrooms ? Number(searchParams.bedrooms) : undefined,
    province: searchParams.province as string | undefined,
    district: searchParams.district as string | undefined,
    search: searchParams.search as string | undefined,
  }

  let result
  let error: string | null = null

  try {
    result = await getListings(filters, searchParams)
  } catch (err) {
    error = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการดึงข้อมูล'
    result = {
      listings: [],
      total: 0,
      page: 1,
      limit: 20,
    }
  }

  const { listings, total, page, limit } = result
  const totalPages = Math.ceil(total / limit)

  // ดึงข้อมูลโฆษณา
  const advertisements = await getAdvertisements()

  return (
    <HomePageContent
      listings={listings}
      total={total}
      page={page}
      totalPages={totalPages}
      error={error}
      searchParams={searchParams}
      advertisements={advertisements}
    />
  )
}

