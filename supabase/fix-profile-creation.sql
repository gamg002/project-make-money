-- สคริปต์แก้ไขปัญหา profile ไม่ถูกสร้างอัตโนมัติ

-- 1. สร้าง function handle_new_user (ถ้ายังไม่มี)
-- ใช้ SECURITY DEFINER เพื่อให้ function มีสิทธิ์สร้าง profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- ตรวจสอบว่า profile มีอยู่แล้วหรือไม่ก่อน insert
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
  END IF;
  RETURN NEW;
END;
$$;

-- 2. ลบ trigger เก่า (ถ้ามี)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. สร้าง trigger ใหม่
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. ให้สิทธิ์ execute function และตั้งค่า SECURITY DEFINER
-- SECURITY DEFINER ทำให้ function ทำงานด้วยสิทธิ์ของเจ้าของ function (ไม่ใช่ผู้เรียก)
ALTER FUNCTION public.handle_new_user() SECURITY DEFINER;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;

-- 5. สร้าง profile สำหรับ users ที่ยังไม่มี profile (backfill)
INSERT INTO public.profiles (id, email, full_name)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.email)
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 6. ตรวจสอบผลลัพธ์
SELECT 
  COUNT(*) as total_users,
  (SELECT COUNT(*) FROM public.profiles) as total_profiles,
  COUNT(*) - (SELECT COUNT(*) FROM public.profiles) as missing_profiles
FROM auth.users;

