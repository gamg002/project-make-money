-- สคริปต์ทดสอบว่า trigger ทำงานหรือไม่

-- 1. ตรวจสอบว่า trigger มีอยู่และเปิดใช้งานอยู่
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  CASE 
    WHEN tgenabled = 'O' THEN 'Enabled'
    WHEN tgenabled = 'D' THEN 'Disabled'
    ELSE 'Unknown'
  END as status,
  pg_get_triggerdef(oid) as trigger_definition
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- 2. ตรวจสอบ function
SELECT 
  proname as function_name,
  prosecdef as is_security_definer,
  proconfig as config
FROM pg_proc
WHERE proname = 'handle_new_user';

-- 3. ตรวจสอบ RLS policies บน profiles
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

-- 4. ทดสอบสร้าง user จำลอง (ไม่ควรรันใน production)
-- หมายเหตุ: ต้องใช้ service_role key หรือ admin
-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
-- VALUES (
--   gen_random_uuid(),
--   'test@example.com',
--   crypt('password', gen_salt('bf')),
--   NOW(),
--   NOW(),
--   NOW(),
--   '{"full_name": "Test User"}'::jsonb
-- );

-- 5. ตรวจสอบ users ที่ยังไม่มี profile
SELECT 
  u.id,
  u.email,
  u.created_at,
  u.email_confirmed_at,
  CASE WHEN p.id IS NULL THEN '❌ ไม่มี profile' ELSE '✅ มี profile' END as profile_status,
  u.raw_user_meta_data->>'full_name' as full_name_from_metadata
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 20;

