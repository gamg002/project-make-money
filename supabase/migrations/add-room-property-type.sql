-- เพิ่มประเภทอสังหา 'room' (ห้อง) ใน property_type CHECK constraint

-- ลบ constraint เดิม
ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_property_type_check;

-- เพิ่ม constraint ใหม่ที่รวม 'room' ด้วย
ALTER TABLE listings ADD CONSTRAINT listings_property_type_check 
  CHECK (property_type IN ('condo', 'house', 'land', 'commercial', 'room'));

