-- Migration: เพิ่มคอลัมน์ facebook และ line ในตาราง profiles
-- Date: 2024
-- Description: เพิ่มฟิลด์สำหรับ Facebook และ Line URL ในข้อมูลโปรไฟล์

-- เพิ่มคอลัมน์ facebook
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS facebook TEXT;

-- เพิ่มคอลัมน์ line
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS line TEXT;

-- เพิ่ม comment เพื่ออธิบายคอลัมน์
COMMENT ON COLUMN profiles.facebook IS 'Facebook profile URL หรือ Messenger link';
COMMENT ON COLUMN profiles.line IS 'Line profile URL หรือ Line ID link';

