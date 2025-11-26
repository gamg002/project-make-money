-- สร้างตาราง listings สำหรับเก็บข้อมูลประกาศ
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12, 2) NOT NULL,
  property_type TEXT NOT NULL CHECK (property_type IN ('condo', 'house', 'land', 'commercial')),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('sale', 'rent')),
  bedrooms INTEGER,
  bathrooms INTEGER,
  area_sqm DECIMAL(10, 2),
  address TEXT NOT NULL,
  district TEXT NOT NULL,
  province TEXT NOT NULL,
  postal_code TEXT,
  images TEXT[] DEFAULT '{}',
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT,
  contact_facebook TEXT,
  contact_line TEXT,
  user_id UUID,
  is_featured BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- สร้าง index เพื่อเพิ่มความเร็วในการค้นหา
CREATE INDEX IF NOT EXISTS idx_listings_property_type ON listings(property_type);
CREATE INDEX IF NOT EXISTS idx_listings_transaction_type ON listings(transaction_type);
CREATE INDEX IF NOT EXISTS idx_listings_province ON listings(province);
CREATE INDEX IF NOT EXISTS idx_listings_district ON listings(district);
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_featured ON listings(is_featured) WHERE is_featured = true;

-- สร้าง full-text search index
CREATE INDEX IF NOT EXISTS idx_listings_search ON listings USING gin(
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(address, ''))
);

-- Function สำหรับอัปเดต updated_at อัตโนมัติ
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger สำหรับอัปเดต updated_at
CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Policy: ทุกคนสามารถอ่านได้
CREATE POLICY "Public listings are viewable by everyone"
  ON listings FOR SELECT
  USING (true);

-- Policy: ทุกคนสามารถสร้างประกาศได้ (ไม่ต้อง login)
CREATE POLICY "Anyone can insert listings"
  ON listings FOR INSERT
  WITH CHECK (true);

-- Policy: เจ้าของหรือ admin สามารถแก้ไขได้ (ถ้ามี user_id)
CREATE POLICY "Users can update their own listings"
  ON listings FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Policy: เจ้าของหรือ admin สามารถลบได้
CREATE POLICY "Users can delete their own listings"
  ON listings FOR DELETE
  USING (auth.uid() = user_id OR user_id IS NULL);

