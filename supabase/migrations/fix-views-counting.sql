-- แก้ไขปัญหา views ไม่ถูกนับ (เป็น 0 เสมอ)
-- สาเหตุ: RLS policy ป้องกัน anonymous users จากการ update views

-- 1. สร้าง function สำหรับเพิ่ม views (ใช้ SECURITY DEFINER เพื่อ bypass RLS)
CREATE OR REPLACE FUNCTION increment_listing_views(listing_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE listings
  SET views = COALESCE(views, 0) + 1
  WHERE id = listing_id;
END;
$$;

-- 2. ให้สิทธิ์ execute function แก่ทุกคน (anonymous และ authenticated)
GRANT EXECUTE ON FUNCTION increment_listing_views(UUID) TO anon;
GRANT EXECUTE ON FUNCTION increment_listing_views(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_listing_views(UUID) TO service_role;

-- 3. สร้าง policy ใหม่ที่อนุญาตให้ทุกคนสามารถอัปเดต views ได้
-- (เฉพาะ views field เท่านั้น ไม่ใช่ fields อื่นๆ)
-- แต่เนื่องจาก Supabase RLS ไม่รองรับการจำกัดเฉพาะ field จึงใช้ function แทน

-- หมายเหตุ: Function increment_listing_views จะ bypass RLS เพราะใช้ SECURITY DEFINER
-- ดังนั้นทุกคนสามารถเรียกใช้ได้แม้ไม่ได้ login

