# คู่มือตั้งค่า Environment Variables

## ขั้นตอนการตั้งค่า

### 1. สร้างบัญชี Supabase (ถ้ายังไม่มี)

1. ไปที่ [https://supabase.com](https://supabase.com)
2. คลิก **Start your project**
3. สร้างบัญชีด้วย GitHub, Google หรือ Email

### 2. สร้างโปรเจกต์ใหม่

1. คลิก **New Project**
2. ตั้งค่า:
   - **Name**: real-estate-listing (หรือชื่อที่คุณต้องการ)
   - **Database Password**: ตั้งรหัสผ่านที่แข็งแรง (บันทึกไว้!)
   - **Region**: Southeast Asia (Singapore) - ใกล้ที่สุด
3. คลิก **Create new project**
4. รอให้สร้างเสร็จ (ประมาณ 2-3 นาที)

### 3. หา Supabase URL และ Key

1. ใน Supabase Dashboard ไปที่ **Settings** (ไอคอนฟันเฟือง)
2. คลิก **API** ในเมนูซ้าย
3. คุณจะเห็น:
   - **Project URL** (อยู่ด้านบน) - คลิก Copy
   - **anon public** key (ในส่วน Project API keys) - คลิก Copy

### 4. สร้างไฟล์ .env.local

1. ในโฟลเดอร์โปรเจกต์ สร้างไฟล์ชื่อ `.env.local`
2. วางโค้ดนี้ลงไป:

```env
NEXT_PUBLIC_SUPABASE_URL=ใส่_Project_URL_ที่นี่
NEXT_PUBLIC_SUPABASE_ANON_KEY=ใส่_anon_key_ที่นี่
```

**ตัวอย่าง:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODk2NzI4MCwiZXhwIjoxOTU0NTQzMjgwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 5. รีสตาร์ทเซิร์ฟเวอร์

หลังจากสร้างไฟล์ `.env.local` แล้ว:

1. หยุดเซิร์ฟเวอร์ (กด Ctrl+C ใน terminal)
2. รันใหม่:
```bash
npm run dev
```

### 6. ตั้งค่า Database

ดูคำแนะนำในไฟล์ `SETUP.md` หรือ `README.md`

---

## ⚠️ ข้อควรระวัง

- **อย่า commit ไฟล์ `.env.local` ลง Git** (ไฟล์นี้อยู่ใน .gitignore แล้ว)
- **อย่าแชร์ Supabase Key ให้ใคร** - มันคือกุญแจเข้าถึงฐานข้อมูลของคุณ
- **เก็บรหัสผ่าน Database ไว้** - คุณจะต้องใช้เมื่อต้องการเชื่อมต่อโดยตรง

