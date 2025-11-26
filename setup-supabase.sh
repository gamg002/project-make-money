#!/bin/bash

echo "🚀 Supabase Setup Script"
echo "========================"
echo ""

# สีสำหรับ output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ตรวจสอบว่า .env.local มีอยู่แล้วหรือยัง
if [ -f .env.local ]; then
    echo -e "${YELLOW}⚠️  ไฟล์ .env.local มีอยู่แล้ว${NC}"
    read -p "ต้องการเขียนทับหรือไม่? (y/n): " overwrite
    if [ "$overwrite" != "y" ]; then
        echo "ยกเลิกการตั้งค่า"
        exit 0
    fi
fi

echo ""
echo "📋 ขั้นตอนการตั้งค่า:"
echo ""
echo "1. ไปที่ https://supabase.com/dashboard"
echo "2. สร้างบัญชี (ถ้ายังไม่มี) หรือเข้าสู่ระบบ"
echo "3. คลิก 'New Project'"
echo "4. ตั้งค่า:"
echo "   - Name: real-estate-listing"
echo "   - Database Password: (ตั้งรหัสผ่านที่แข็งแรง)"
echo "   - Region: Southeast Asia (Singapore)"
echo "5. รอให้สร้างเสร็จ (2-3 นาที)"
echo ""
echo "6. ไปที่ Settings → API"
echo "7. คัดลอก Project URL และ anon public key"
echo ""

read -p "พร้อมแล้วหรือยัง? กด Enter เพื่อดำเนินการต่อ... "

echo ""
echo "กรุณาใส่ข้อมูลจาก Supabase Dashboard:"
echo ""

read -p "Supabase Project URL: " SUPABASE_URL
read -p "Supabase Anon Key: " SUPABASE_KEY

# Validate
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
    echo -e "${RED}❌ ข้อมูลไม่ครบ กรุณาลองใหม่อีกครั้ง${NC}"
    exit 1
fi

if [[ ! "$SUPABASE_URL" =~ ^https://.*\.supabase\.co$ ]]; then
    echo -e "${YELLOW}⚠️  ระวัง: URL ดูไม่ถูกต้อง ควรเป็น https://xxx.supabase.co${NC}"
    read -p "ต้องการดำเนินการต่อหรือไม่? (y/n): " continue
    if [ "$continue" != "y" ]; then
        exit 1
    fi
fi

# สร้างไฟล์ .env.local
cat > .env.local << EOF
# Supabase Configuration
# สร้างโดย setup-supabase.sh
# วันที่: $(date)

NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_KEY
EOF

echo ""
echo -e "${GREEN}✅ สร้างไฟล์ .env.local เรียบร้อยแล้ว${NC}"
echo ""

# ตรวจสอบว่า Supabase CLI ติดตั้งหรือยัง
if command -v supabase &> /dev/null; then
    echo "พบ Supabase CLI"
    read -p "ต้องการรัน SQL schema อัตโนมัติหรือไม่? (y/n): " run_sql
    if [ "$run_sql" = "y" ]; then
        echo ""
        echo "📝 หมายเหตุ: คุณต้อง link project ก่อน"
        echo "   รัน: supabase link --project-ref YOUR_PROJECT_REF"
        echo ""
        read -p "กด Enter เพื่อดำเนินการต่อ..."
    fi
else
    echo -e "${YELLOW}💡 คำแนะนำ: ติดตั้ง Supabase CLI เพื่อความสะดวก${NC}"
    echo "   npm install -g supabase"
    echo ""
fi

echo ""
echo "📋 ขั้นตอนต่อไป:"
echo ""
echo "1. ✅ ตั้งค่า .env.local เรียบร้อยแล้ว"
echo ""
echo "2. ตั้งค่า Database:"
echo "   - ไปที่ Supabase Dashboard → SQL Editor"
echo "   - รันโค้ดจากไฟล์: supabase/schema.sql"
echo "   - รันโค้ดจากไฟล์: supabase/auth-schema.sql"
echo ""
echo "3. สร้าง Storage Bucket:"
echo "   - ไปที่ Storage → New bucket"
echo "   - ชื่อ: listings"
echo "   - ✅ Public bucket"
echo "   - ตั้งค่า Policy: Allow public read access"
echo ""
echo "4. รีสตาร์ทเซิร์ฟเวอร์:"
echo "   npm run dev"
echo ""
echo -e "${GREEN}✨ เสร็จสิ้น!${NC}"
echo ""

