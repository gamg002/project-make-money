import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ListingDetailContent from '@/components/ListingDetailContent'

async function getListing(id: string) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  // อัปเดตจำนวน views
  await supabase
    .from('listings')
    .update({ views: (data.views || 0) + 1 })
    .eq('id', id)

  return { listing: data, isOwner: user?.id === data.user_id }
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

