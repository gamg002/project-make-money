-- สร้างตาราง profiles สำหรับเก็บข้อมูลเพิ่มเติมของสมาชิก
-- Supabase Auth จะสร้างตาราง auth.users อัตโนมัติ
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- สร้าง index
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Function สำหรับอัปเดต updated_at
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger สำหรับอัปเดต updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_updated_at();

-- Function สำหรับสร้าง profile อัตโนมัติเมื่อสมัครสมาชิก
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger สำหรับสร้าง profile อัตโนมัติ
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: ทุกคนสามารถอ่าน profile ได้ (เฉพาะข้อมูลพื้นฐาน)
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Policy: ผู้ใช้สามารถแก้ไข profile ของตัวเองได้
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policy: ผู้ใช้สามารถสร้าง profile ของตัวเองได้
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- อัปเดต Policy ของ listings ให้เชื่อมโยงกับ auth.users
-- Policy: สมาชิกที่ login แล้วสามารถสร้างประกาศได้
CREATE POLICY "Authenticated users can insert listings"
  ON listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: เจ้าของสามารถแก้ไขประกาศของตัวเองได้
DROP POLICY IF EXISTS "Users can update their own listings" ON listings;
CREATE POLICY "Users can update their own listings"
  ON listings FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: เจ้าของสามารถลบประกาศของตัวเองได้
DROP POLICY IF EXISTS "Users can delete their own listings" ON listings;
CREATE POLICY "Users can delete their own listings"
  ON listings FOR DELETE
  USING (auth.uid() = user_id);

