import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ListingDetailContent from '@/components/ListingDetailContent'

async function getListing(id: string) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  // ดึงข้อมูล listing ก่อน
  const { data: listingData, error: fetchError } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !listingData) {
    return null
  }

  // อัปเดตจำนวน views (ไม่ await เพื่อไม่ให้ช้า)
  supabase
    .from('listings')
    .update({ views: (listingData.views || 0) + 1 })
    .eq('id', id)
    .then(() => {
      // อัปเดตสำเร็จ (ไม่ต้องทำอะไร)
    })
    .catch((err: unknown) => {
      // Log error แต่ไม่ block การแสดงหน้า
      console.error('Error updating views:', err)
    })

  return { listing: listingData, isOwner: user?.id === listingData.user_id }
}

export default async function ListingDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const result = await getListing(params.id)

  if (!result || !result.listing) {
    notFound()
  }

  const { listing, isOwner } = result

  return <ListingDetailContent listing={listing} isOwner={isOwner} />
}

