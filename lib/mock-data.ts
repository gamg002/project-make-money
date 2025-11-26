import { Listing } from '@/lib/types'

// Mock data สำหรับทดสอบเมื่อยังไม่มี Supabase
export const mockListings: Listing[] = [
  {
    id: '1',
    title: 'คอนโดหรู 2 ห้องนอน ใจกลางเมือง',
    description: 'คอนโดมิเนียมหรู ตกแต่งพร้อมอยู่ 2 ห้องนอน 2 ห้องน้ำ ใจกลางเมือง ใกล้ BTS และห้างสรรพสินค้า',
    price: 8500000,
    property_type: 'condo',
    transaction_type: 'sale',
    bedrooms: 2,
    bathrooms: 2,
    area_sqm: 45,
    address: '123 ถนนสุขุมวิท',
    district: 'คลองตัน',
    province: 'กรุงเทพมหานคร',
    postal_code: '10110',
    images: [],
    contact_name: 'คุณสมชาย',
    contact_phone: '081-234-5678',
    contact_email: 'somchai@example.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    views: 125,
  },
  {
    id: '2',
    title: 'บ้านเดี่ยว 3 ห้องนอน สวนสวย',
    description: 'บ้านเดี่ยว 2 ชั้น 3 ห้องนอน 3 ห้องน้ำ สวนสวย บรรยากาศเงียบสงบ',
    price: 12000000,
    property_type: 'house',
    transaction_type: 'sale',
    bedrooms: 3,
    bathrooms: 3,
    area_sqm: 180,
    address: '456 ถนนรัชดาภิเษก',
    district: 'ห้วยขวาง',
    province: 'กรุงเทพมหานคร',
    postal_code: '10310',
    images: [],
    contact_name: 'คุณสมหญิง',
    contact_phone: '082-345-6789',
    contact_email: 'somying@example.com',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    views: 89,
  },
  {
    id: '3',
    title: 'คอนโด 1 ห้องนอน สำหรับเช่า',
    description: 'คอนโด 1 ห้องนอน 1 ห้องน้ำ ตกแต่งสวย พร้อมเฟอร์นิเจอร์ ใกล้สถานีรถไฟฟ้า',
    price: 15000,
    property_type: 'condo',
    transaction_type: 'rent',
    bedrooms: 1,
    bathrooms: 1,
    area_sqm: 32,
    address: '789 ถนนพหลโยธิน',
    district: 'จตุจักร',
    province: 'กรุงเทพมหานคร',
    postal_code: '10900',
    images: [],
    contact_name: 'คุณวิชัย',
    contact_phone: '083-456-7890',
    contact_email: 'wichai@example.com',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString(),
    views: 156,
  },
  {
    id: '4',
    title: 'ที่ดินเปล่า 200 ตร.ว. โซนพัฒนา',
    description: 'ที่ดินเปล่า 200 ตร.ว. โซนพัฒนา ใกล้ถนนใหญ่ เหมาะสำหรับสร้างบ้านหรือทำธุรกิจ',
    price: 5000000,
    property_type: 'land',
    transaction_type: 'sale',
    area_sqm: 800,
    address: '321 ถนนบางนา-ตราด',
    district: 'บางนา',
    province: 'กรุงเทพมหานคร',
    postal_code: '10260',
    images: [],
    contact_name: 'คุณประเสริฐ',
    contact_phone: '084-567-8901',
    contact_email: 'prasert@example.com',
    created_at: new Date(Date.now() - 259200000).toISOString(),
    updated_at: new Date(Date.now() - 259200000).toISOString(),
    views: 67,
  },
  {
    id: '5',
    title: 'บ้าน 4 ห้องนอน สระว่ายน้ำส่วนตัว',
    description: 'บ้านหรู 4 ห้องนอน 4 ห้องน้ำ สระว่ายน้ำส่วนตัว สวนสวย บรรยากาศเงียบสงบ',
    price: 25000000,
    property_type: 'house',
    transaction_type: 'sale',
    bedrooms: 4,
    bathrooms: 4,
    area_sqm: 350,
    address: '654 ถนนสุขุมวิท',
    district: 'บางรัก',
    province: 'กรุงเทพมหานคร',
    postal_code: '10500',
    images: [],
    contact_name: 'คุณวิไล',
    contact_phone: '085-678-9012',
    contact_email: 'wilai@example.com',
    created_at: new Date(Date.now() - 345600000).toISOString(),
    updated_at: new Date(Date.now() - 345600000).toISOString(),
    views: 234,
    is_featured: true,
  },
]

export function filterMockListings(
  listings: Listing[],
  filters: {
    property_type?: string
    transaction_type?: string
    min_price?: number
    max_price?: number
    bedrooms?: number
    province?: string
    district?: string
    search?: string
  }
): Listing[] {
  let filtered = [...listings]

  if (filters.property_type) {
    filtered = filtered.filter((l) => l.property_type === filters.property_type)
  }

  if (filters.transaction_type) {
    filtered = filtered.filter((l) => l.transaction_type === filters.transaction_type)
  }

  if (filters.min_price) {
    filtered = filtered.filter((l) => l.price >= filters.min_price!)
  }

  if (filters.max_price) {
    filtered = filtered.filter((l) => l.price <= filters.max_price!)
  }

  if (filters.bedrooms) {
    filtered = filtered.filter((l) => l.bedrooms === filters.bedrooms)
  }

  if (filters.province) {
    filtered = filtered.filter((l) =>
      l.province.toLowerCase().includes(filters.province!.toLowerCase())
    )
  }

  if (filters.district) {
    filtered = filtered.filter((l) =>
      l.district.toLowerCase().includes(filters.district!.toLowerCase())
    )
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filtered = filtered.filter(
      (l) =>
        l.title.toLowerCase().includes(searchLower) ||
        l.description?.toLowerCase().includes(searchLower) ||
        l.address.toLowerCase().includes(searchLower)
    )
  }

  return filtered
}

