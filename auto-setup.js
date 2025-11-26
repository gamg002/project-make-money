#!/usr/bin/env node

/**
 * Auto Setup Script for Supabase
 * รัน: node auto-setup.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('\n🚀 Supabase Auto Setup\n');
  console.log('='.repeat(50));
  console.log('\n📋 ขั้นตอน:\n');
  console.log('1. ไปที่ https://supabase.com/dashboard');
  console.log('2. สร้างโปรเจกต์ใหม่ (ถ้ายังไม่มี)');
  console.log('3. ไปที่ Settings → API');
  console.log('4. คัดลอก Project URL และ anon public key\n');

  const url = await question('Supabase Project URL: ');
  const key = await question('Supabase Anon Key: ');

  if (!url || !key) {
    console.log('\n❌ ข้อมูลไม่ครบ กรุณาลองใหม่อีกครั้ง\n');
    rl.close();
    process.exit(1);
  }

  // Validate URL
  if (!url.startsWith('https://') || !url.includes('.supabase.co')) {
    console.log('\n⚠️  ระวัง: URL ดูไม่ถูกต้อง');
    const continue_ = await question('ต้องการดำเนินการต่อหรือไม่? (y/n): ');
    if (continue_.toLowerCase() !== 'y') {
      rl.close();
      process.exit(0);
    }
  }

  // Create .env.local
  const envContent = `# Supabase Configuration
# สร้างโดย auto-setup.js
# วันที่: ${new Date().toISOString()}

NEXT_PUBLIC_SUPABASE_URL=${url}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${key}
`;

  const envPath = path.join(process.cwd(), '.env.local');
  
  // Check if file exists
  if (fs.existsSync(envPath)) {
    const overwrite = await question('\n⚠️  ไฟล์ .env.local มีอยู่แล้ว ต้องการเขียนทับหรือไม่? (y/n): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('\nยกเลิกการตั้งค่า\n');
      rl.close();
      process.exit(0);
    }
  }

  fs.writeFileSync(envPath, envContent);
  console.log('\n✅ สร้างไฟล์ .env.local เรียบร้อยแล้ว!\n');
  console.log('📋 ขั้นตอนต่อไป:');
  console.log('1. รัน SQL schema ใน Supabase SQL Editor');
  console.log('2. สร้าง Storage bucket ชื่อ "listings"');
  console.log('3. รีสตาร์ทเซิร์ฟเวอร์: npm run dev\n');
  console.log('📖 ดูคำแนะนำแบบละเอียด: COMPLETE_SETUP.md\n');

  rl.close();
}

main().catch(console.error);

