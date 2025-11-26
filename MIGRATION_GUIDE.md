# คู่มือการรัน SQL Migration

## เพิ่มคอลัมน์ Facebook และ Line

ไฟล์ migration: `supabase/migrations/add-contact-facebook-line.sql`

## วิธีรันใน Supabase

### 1. เปิด Supabase Dashboard

1. ไปที่ [https://supabase.com](https://supabase.com)
2. เข้าสู่ระบบ
3. เลือกโปรเจกต์ของคุณ

### 2. เปิด SQL Editor

1. คลิก **SQL Editor** ในเมนูด้านซ้าย
2. คลิก **New query**

### 3. คัดลอกและวาง SQL

คัดลอกโค้ด SQL ต่อไปนี้:

```sql
-- Migration: เพิ่มคอลัมน์ contact_facebook และ contact_line ในตาราง listings
-- Date: 2024
-- Description: เพิ่มฟิลด์สำหรับ Facebook และ Line URL ในข้อมูลติดต่อ

-- เพิ่มคอลัมน์ contact_facebook
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS contact_facebook TEXT;

-- เพิ่มคอลัมน์ contact_line
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS contact_line TEXT;

-- เพิ่ม comment เพื่ออธิบายคอลัมน์
COMMENT ON COLUMN listings.contact_facebook IS 'Facebook profile URL หรือ Messenger link';
COMMENT ON COLUMN listings.contact_line IS 'Line profile URL หรือ Line ID link';
```

### 4. รัน SQL

1. คลิกปุ่ม **Run** (หรือกด `Ctrl+Enter` / `Cmd+Enter`)
2. รอให้เสร็จสิ้น (ควรใช้เวลาไม่กี่วินาที)

### 5. ตรวจสอบผลลัพธ์

คุณควรเห็นข้อความ:
```
Success. No rows returned
```

### 6. ตรวจสอบว่าคอลัมน์ถูกเพิ่มแล้ว

รัน SQL นี้เพื่อตรวจสอบ:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'listings'
AND column_name IN ('contact_facebook', 'contact_line');
```

คุณควรเห็นผลลัพธ์:
```
contact_facebook | text | YES
contact_line     | text | YES
```

## วิธีรันด้วย Supabase CLI (ถ้ามี)

```bash
# ติดตั้ง Supabase CLI (ถ้ายังไม่มี)
npm install -g supabase

# Login
supabase login

# Link โปรเจกต์
supabase link --project-ref your-project-ref

# รัน migration
supabase db push
```

## วิธีรันด้วย psql (ถ้ามี)

```bash
# เชื่อมต่อกับ Supabase database
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# รัน migration
\i supabase/migrations/add-contact-facebook-line.sql
```

## Troubleshooting

### Error: column already exists

ถ้าเห็น error นี้ แสดงว่าคอลัมน์ถูกเพิ่มไปแล้ว ไม่ต้องทำอะไร

### Error: relation "listings" does not exist

ตรวจสอบว่า:
1. คุณอยู่ในโปรเจกต์ที่ถูกต้อง
2. ตาราง `listings` ถูกสร้างแล้ว (รัน `supabase/schema.sql` ก่อน)

### Error: permission denied

ตรวจสอบว่า:
1. คุณมีสิทธิ์ในการแก้ไข database
2. คุณใช้ service role key หรือ admin account

## หมายเหตุ

- Migration นี้ใช้ `IF NOT EXISTS` ดังนั้นสามารถรันซ้ำได้โดยไม่เกิด error
- ข้อมูลเดิมจะไม่หายไป คอลัมน์ใหม่จะเป็น `NULL` สำหรับข้อมูลเก่า
- หลังจากรัน migration แล้ว คุณสามารถใช้ฟีเจอร์ Facebook และ Line ได้ทันที

---

**หลังจากรัน migration แล้ว ให้รีสตาร์ท development server:**

```bash
npm run dev
```

