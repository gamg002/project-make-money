export interface Listing {
  id: string
  title: string
  description: string
  price: number
  property_type: 'condo' | 'house' | 'land' | 'commercial'
  transaction_type: 'sale' | 'rent'
  bedrooms?: number
  bathrooms?: number
  area_sqm?: number
  address: string
  district: string
  province: string
  postal_code?: string
  images: string[]
  contact_name: string
  contact_phone: string
  contact_email?: string
  contact_facebook?: string
  contact_line?: string
  created_at: string
  updated_at: string
  user_id?: string
  is_featured?: boolean
  views?: number
}

export interface ListingFilters {
  property_type?: string
  transaction_type?: string
  min_price?: number
  max_price?: number
  bedrooms?: number
  province?: string
  district?: string
  search?: string
}

export interface Profile {
  id: string
  email?: string
  full_name?: string
  phone?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email?: string
  profile?: Profile
}
