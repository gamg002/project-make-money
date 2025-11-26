#!/bin/bash

echo "🚀 Supabase Environment Setup"
echo "=============================="
echo ""
echo "ขั้นตอนที่ 1: ไปที่ https://supabase.com/dashboard"
echo "ขั้นตอนที่ 2: เลือกโปรเจกต์ของคุณ (หรือสร้างใหม่)"
echo "ขั้นตอนที่ 3: ไปที่ Settings → API"
echo ""
read -p "ใส่ Supabase Project URL: " SUPABASE_URL
read -p "ใส่ Supabase Anon Key: " SUPABASE_KEY

cat > .env.local << ENVFILE
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_KEY
ENVFILE

echo ""
echo "✅ สร้างไฟล์ .env.local เรียบร้อยแล้ว!"
echo ""
echo "ขั้นตอนต่อไป:"
echo "1. รัน SQL schema ใน Supabase SQL Editor"
echo "2. สร้าง Storage bucket ชื่อ 'listings'"
echo "3. รีสตาร์ทเซิร์ฟเวอร์ (npm run dev)"
