-- สร้าง Storage Bucket สำหรับเก็บรูปภาพประกาศ
INSERT INTO storage.buckets (id, name, public)
VALUES ('listings', 'listings', true)
ON CONFLICT (id) DO NOTHING;

-- ลบ policies เก่าถ้ามี (เพื่อป้องกัน error)
DROP POLICY IF EXISTS "Public can view listing images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload listing images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own listing images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own listing images" ON storage.objects;

-- Policy: ทุกคนสามารถอ่านรูปภาพได้ (public read)
CREATE POLICY "Public can view listing images"
ON storage.objects FOR SELECT
USING (bucket_id = 'listings');

-- Policy: ผู้ใช้ที่ login แล้วสามารถอัปโหลดรูปภาพได้
CREATE POLICY "Authenticated users can upload listing images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'listings' 
  AND auth.role() = 'authenticated'
);

-- Policy: ผู้ใช้ที่ login แล้วสามารถอัปเดตรูปภาพได้
CREATE POLICY "Users can update own listing images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'listings' 
  AND auth.role() = 'authenticated'
);

-- Policy: ผู้ใช้ที่ login แล้วสามารถลบรูปภาพได้
CREATE POLICY "Users can delete own listing images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'listings' 
  AND auth.role() = 'authenticated'
);

