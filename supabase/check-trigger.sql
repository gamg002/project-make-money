-- สคริปต์ตรวจสอบว่า trigger และ function ถูกสร้างแล้วหรือไม่

-- 1. ตรวจสอบว่า function handle_new_user มีอยู่หรือไม่
SELECT 
  proname as function_name,
  prosrc as function_body
FROM pg_proc
WHERE proname = 'handle_new_user';

-- 2. ตรวจสอบว่า trigger on_auth_user_created มีอยู่หรือไม่
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgenabled as enabled,
  pg_get_triggerdef(oid) as trigger_definition
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- 3. ตรวจสอบว่า profiles table มีอยู่หรือไม่
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 4. ตรวจสอบ RLS policies บน profiles table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- 5. ตรวจสอบ users ที่ยังไม่มี profile
SELECT 
  u.id,
  u.email,
  u.created_at,
  u.email_confirmed_at,
  CASE WHEN p.id IS NULL THEN 'ไม่มี profile' ELSE 'มี profile' END as profile_status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 10;

