# คู่มือระบบสมาชิก

## ฟีเจอร์ระบบสมาชิก

### 1. สมัครสมาชิก
- ผู้ใช้สามารถสมัครสมาชิกด้วยอีเมลและรหัสผ่าน
- ข้อมูลจะถูกเก็บใน Supabase Auth (ฟรี)
- สร้าง Profile อัตโนมัติเมื่อสมัครสมาชิก

### 2. เข้าสู่ระบบ / ออกจากระบบ
- เข้าสู่ระบบด้วยอีเมลและรหัสผ่าน
- ออกจากระบบได้จาก Navbar

### 3. แดชบอร์ด
- ดูประกาศทั้งหมดของตัวเอง
- ดูสถิติ (จำนวนประกาศ, ยอดดู)
- ลงประกาศใหม่
- แก้ไข/ลบประกาศ

### 4. จัดการประกาศ
- **ลงประกาศ**: ต้องเป็นสมาชิก (ถ้ายังไม่ login จะ redirect ไปหน้า login)
- **แก้ไขประกาศ**: เฉพาะเจ้าของประกาศเท่านั้น
- **ลบประกาศ**: เฉพาะเจ้าของประกาศเท่านั้น

## การตั้งค่าระบบสมาชิก

### 1. รัน SQL Schema

รันไฟล์ `supabase/auth-schema.sql` ใน Supabase SQL Editor:

```sql
-- สร้างตาราง profiles
-- สร้าง triggers และ functions
-- ตั้งค่า Row Level Security (RLS)
```

### 2. ตั้งค่า Supabase Auth

1. ไปที่ **Authentication** → **Providers** ใน Supabase Dashboard
2. เปิดใช้งาน **Email** provider (เปิดอยู่แล้วโดย default)
3. (Optional) เปิดใช้งาน **Google** หรือ **GitHub** สำหรับ Social Login

### 3. ตั้งค่า Email Templates (Optional)

1. ไปที่ **Authentication** → **Email Templates**
2. สามารถปรับแต่ง email สำหรับ:
   - Confirm signup
   - Reset password
   - Magic link

### 4. ตั้งค่า Redirect URLs

1. ไปที่ **Authentication** → **URL Configuration**
2. เพิ่ม Redirect URLs:
   - `http://localhost:3000/**` (สำหรับ development)
   - `https://your-domain.com/**` (สำหรับ production)

## การใช้งาน

### สมัครสมาชิก

1. คลิก **สมัครสมาชิก** ใน Navbar
2. กรอกข้อมูล:
   - ชื่อ-นามสกุล
   - อีเมล
   - รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)
3. คลิก **สมัครสมาชิก**
4. จะถูก redirect ไปหน้า Dashboard อัตโนมัติ

### เข้าสู่ระบบ

1. คลิก **เข้าสู่ระบบ** ใน Navbar
2. กรอกอีเมลและรหัสผ่าน
3. คลิก **เข้าสู่ระบบ**
4. จะถูก redirect ไปหน้า Dashboard

### ลงประกาศ

1. ต้องเข้าสู่ระบบก่อน
2. คลิก **ลงประกาศ** ใน Navbar
3. กรอกข้อมูลประกาศ
4. อัปโหลดรูปภาพ
5. คลิก **ลงประกาศ**

### แก้ไขประกาศ

1. ไปที่ **แดชบอร์ด**
2. คลิกปุ่ม **แก้ไข** (ไอคอนดินสอ) บนการ์ดประกาศ
3. แก้ไขข้อมูล
4. คลิก **บันทึกการแก้ไข**

### ลบประกาศ

1. ไปที่ **แดชบอร์ด**
2. คลิกปุ่ม **ลบ** (ไอคอนถังขยะ) บนการ์ดประกาศ
3. ยืนยันการลบ

## Security Features

### Row Level Security (RLS)

ระบบใช้ RLS เพื่อความปลอดภัย:

- **Profiles**: ทุกคนอ่านได้, เฉพาะเจ้าของแก้ไขได้
- **Listings**: 
  - ทุกคนอ่านได้
  - เฉพาะสมาชิกที่ login แล้วสร้างได้
  - เฉพาะเจ้าของแก้ไข/ลบได้

### Authentication

- รหัสผ่านถูก hash ด้วย bcrypt
- Session ถูกจัดการโดย Supabase
- JWT tokens สำหรับ API calls

## การขยายฟีเจอร์

### เพิ่ม Social Login

1. ไปที่ **Authentication** → **Providers**
2. เปิดใช้งาน Google/GitHub/Facebook
3. ตั้งค่า OAuth credentials
4. อัปเดตหน้า Sign In/Sign Up

### เพิ่ม Profile Picture

1. อัปโหลดรูปไปที่ Supabase Storage
2. อัปเดต `profiles.avatar_url`
3. แสดงรูปใน Navbar/Dashboard

### เพิ่ม Role-based Access

1. เพิ่มคอลัมน์ `role` ในตาราง `profiles`
2. สร้าง Policy ตาม role
3. เพิ่ม middleware สำหรับตรวจสอบ role

## Troubleshooting

### ไม่สามารถสมัครสมาชิกได้

- ตรวจสอบว่า Email provider เปิดใช้งาน
- ตรวจสอบว่า Email ไม่ถูกใช้แล้ว
- ตรวจสอบ Console สำหรับ error messages

### ไม่สามารถเข้าสู่ระบบได้

- ตรวจสอบอีเมลและรหัสผ่าน
- ตรวจสอบว่า Email ถูกยืนยันแล้ว (ถ้าเปิด Email confirmation)
- ลอง Reset password

### ไม่สามารถแก้ไข/ลบประกาศได้

- ตรวจสอบว่าเป็นเจ้าของประกาศ
- ตรวจสอบ RLS policies
- ตรวจสอบ Console สำหรับ error messages

## ข้อมูลเพิ่มเติม

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

