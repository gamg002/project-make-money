-- สร้างตาราง advertisements สำหรับเก็บโฆษณา
CREATE TABLE IF NOT EXISTS advertisements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  link_url TEXT NOT NULL,
  title TEXT,
  subtitle TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- สร้าง index เพื่อเพิ่มความเร็วในการค้นหา
CREATE INDEX IF NOT EXISTS idx_advertisements_is_active ON advertisements(is_active);
CREATE INDEX IF NOT EXISTS idx_advertisements_display_order ON advertisements(display_order);

-- Function สำหรับอัปเดต updated_at อัตโนมัติ
CREATE OR REPLACE FUNCTION update_advertisements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger สำหรับอัปเดต updated_at
CREATE TRIGGER update_advertisements_updated_at
  BEFORE UPDATE ON advertisements
  FOR EACH ROW
  EXECUTE FUNCTION update_advertisements_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;

-- Policy: ทุกคนสามารถอ่านโฆษณาที่ active ได้
CREATE POLICY "Active advertisements are viewable by everyone"
  ON advertisements FOR SELECT
  USING (is_active = true);

-- Policy: Admin หรือ authenticated users สามารถจัดการโฆษณาได้
-- (สามารถปรับแต่งตามความต้องการ)
CREATE POLICY "Authenticated users can insert advertisements"
  ON advertisements FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update advertisements"
  ON advertisements FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete advertisements"
  ON advertisements FOR DELETE
  USING (auth.role() = 'authenticated');

