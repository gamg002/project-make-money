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

