'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Language = 'th' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'th',
  setLanguage: () => {},
  t: () => '',
})

const STORAGE_KEY = 'realestate_language'

// Translations
const translations: Record<Language, Record<string, string>> = {
  th: {
    // Navbar
    'nav.home': 'หน้าหลัก',
    'nav.new': 'ลงประกาศ',
    'nav.newListing': 'ลงประกาศ',
    'nav.dashboard': 'แดชบอร์ด',
    'nav.settings': 'ตั้งค่าบัญชี',
    'nav.signIn': 'เข้าสู่ระบบ',
    'nav.signUp': 'สมัครสมาชิก',
    'nav.signOut': 'ออกจากระบบ',
    'nav.language': 'ภาษา',
    'nav.language.th': 'ไทย',
    'nav.language.en': 'English',
    
    // Error messages
    'error.profileMissing': 'เกิดข้อผิดพลาด',
    'error.profileMissingMessage': 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้ กรุณาเข้าสู่ระบบอีกครั้ง',
    'error.goToLogin': 'ไปหน้า Login',
    'error.title': 'เกิดข้อผิดพลาด',
    'error.supabaseNotConfigured': 'Supabase ยังไม่ได้ตั้งค่า กรุณาตรวจสอบไฟล์ .env.local',
    'error.fetchFailed': 'ไม่สามารถดึงข้อมูลจากฐานข้อมูลได้',
    'error.checkSupabase': 'กรุณาตรวจสอบการตั้งค่า Supabase หรือลองใหม่อีกครั้ง',
    
    // Home page
    'home.title': 'ค้นหาบ้าน คอนโด ที่ดิน ภูเก็ต',
    'home.subtitle': 'พบกับอสังหาริมทรัพย์ที่คุณกำลังมองหา',
    'home.noResults': 'ไม่พบรายการที่ค้นหา',
    'home.noResultsDesc': 'ลองปรับเงื่อนไขการค้นหาหรือลองค้นหาด้วยคำอื่น',
    'home.backToHome': 'กลับไปหน้าหลัก',
    'home.page': 'หน้า',
    'home.of': 'จาก',
    'home.results': 'รายการ',
    'home.previous': 'ก่อนหน้า',
    'home.next': 'ถัดไป',
    
    // Search filters
    'search.placeholder': 'ค้นหาด้วยคำสำคัญ...',
    'search.allTransactionTypes': 'ทุกประเภทการขาย',
    'search.sale': 'ขาย',
    'search.rent': 'เช่า',
    'search.allPropertyTypes': 'ทุกประเภทอสังหา',
    'search.condo': 'คอนโด',
    'search.house': 'บ้าน',
    'search.land': 'ที่ดิน',
    'search.commercial': 'เชิงพาณิชย์',
    'search.room': 'ห้อง',
    'search.minPrice': 'ราคาต่ำสุด (บาท)',
    'search.maxPrice': 'ราคาสูงสุด (บาท)',
    'search.bedrooms': 'จำนวนห้องนอน',
    'search.bedroom': 'ห้อง',
    'search.bedrooms4plus': '4+ ห้อง',
    'search.province': 'จังหวัด',
    'search.search': 'ค้นหา',
    'search.reset': 'ล้าง',
    
    // Listing card
    'listing.baht': 'บาท',
    'listing.perMonth': '/เดือน',
    'listing.noImage': 'ไม่มีรูปภาพ',
    'listing.sqm': 'ตร.ม.',
    
    // Listing detail
    'detail.backToHome': 'กลับไปหน้าหลัก',
    'detail.price': 'บาท',
    'detail.perMonth': '/เดือน',
    'detail.bedrooms': 'ห้องนอน',
    'detail.bathrooms': 'ห้องน้ำ',
    'detail.area': 'พื้นที่',
    'detail.sqm': 'ตร.ม.',
    'detail.description': 'รายละเอียด',
    'detail.features': 'คุณสมบัติ',
    'detail.contact': 'ติดต่อ',
    'detail.name': 'ชื่อ',
    'detail.phone': 'เบอร์โทร',
    'detail.email': 'อีเมล',
    'detail.facebook': 'Facebook',
    'detail.line': 'Line',
    'detail.views': 'ครั้ง',
    'detail.noDescription': 'ไม่มีรายละเอียด',
    
    // Dashboard
    'dashboard.title': 'แดชบอร์ด',
    'dashboard.subtitle': 'จัดการประกาศของคุณ',
    'dashboard.newListing': 'ลงประกาศใหม่',
    'dashboard.noListings': 'ยังไม่มีประกาศ',
    'dashboard.noListingsDesc': 'เริ่มต้นด้วยการลงประกาศอสังหาริมทรัพย์ของคุณ',
    'dashboard.error': 'เกิดข้อผิดพลาดในการโหลดข้อมูล',
    'dashboard.loading': 'กำลังโหลด...',
    'dashboard.featured': 'แนะนำ',
    'dashboard.notFeatured': 'ไม่แนะนำ',
    'dashboard.edit': 'แก้ไข',
    'dashboard.delete': 'ลบ',
    'dashboard.deleteConfirm': 'ยืนยันการลบ',
    'dashboard.deleteConfirmMessage': 'คุณแน่ใจหรือไม่ว่าต้องการลบประกาศนี้?',
    'dashboard.deleteSuccess': 'ลบสำเร็จ',
    'dashboard.deleteSuccessMessage': 'ประกาศถูกลบเรียบร้อยแล้ว',
    'dashboard.toggleFeaturedSuccess': 'อัปเดตสำเร็จ',
    'dashboard.toggleFeaturedSuccessMessage': 'สถานะแนะนำถูกอัปเดตแล้ว',
    'dashboard.errorMessage': 'เกิดข้อผิดพลาด',
    'dashboard.signInRequired': 'ต้องเข้าสู่ระบบ',
    'dashboard.signInRequiredMessage': 'กรุณาเข้าสู่ระบบอีกครั้ง',
    'dashboard.filter': 'ค้นหาและกรอง',
    'dashboard.confirm': 'ยืนยัน',
    'dashboard.cancel': 'ยกเลิก',
    'dashboard.ok': 'ตกลง',
    
    // New Listing
    'newListing.title': 'ลงประกาศใหม่',
    'newListing.basicInfo': 'ข้อมูลพื้นฐาน',
    'newListing.propertyInfo': 'ข้อมูลอสังหาริมทรัพย์',
    'newListing.location': 'ที่อยู่',
    'newListing.contact': 'ข้อมูลติดต่อ',
    'newListing.images': 'รูปภาพ',
    'newListing.titleLabel': 'ชื่อประกาศ',
    'newListing.titlePlaceholder': 'เช่น บ้านเดี่ยว 2 ชั้น พร้อมสวน',
    'newListing.description': 'รายละเอียด',
    'newListing.descriptionPlaceholder': 'อธิบายรายละเอียดของอสังหาริมทรัพย์...',
    'newListing.price': 'ราคา (บาท)',
    'newListing.propertyType': 'ประเภทอสังหาริมทรัพย์',
    'newListing.transactionType': 'ประเภทการขาย',
    'newListing.bedrooms': 'จำนวนห้องนอน',
    'newListing.bathrooms': 'จำนวนห้องน้ำ',
    'newListing.area': 'พื้นที่ (ตร.ม.)',
    'newListing.address': 'ที่อยู่',
    'newListing.district': 'อำเภอ/เขต',
    'newListing.province': 'จังหวัด',
    'newListing.postalCode': 'รหัสไปรษณีย์',
    'newListing.contactName': 'ชื่อผู้ติดต่อ',
    'newListing.contactPhone': 'เบอร์โทรศัพท์',
    'newListing.contactEmail': 'อีเมล',
    'newListing.contactFacebook': 'Facebook (URL)',
    'newListing.contactFacebookPlaceholder': 'https://www.facebook.com/your-profile หรือ https://m.me/your-profile',
    'newListing.contactLine': 'Line (URL)',
    'newListing.contactLinePlaceholder': 'https://line.me/ti/p/~your-line-id หรือ https://line.me/R/ti/p/@your-line-id',
    'newListing.uploadImages': 'อัปโหลดรูปภาพ',
    'newListing.maxImages': 'สูงสุด 10 รูป',
    'newListing.removeImage': 'ลบรูป',
    'newListing.submit': 'ลงประกาศ',
    'newListing.cancel': 'ยกเลิก',
    'newListing.loading': 'กำลังลงประกาศ...',
    'newListing.success': 'ลงประกาศสำเร็จ',
    'newListing.successMessage': 'ประกาศของคุณถูกสร้างเรียบร้อยแล้ว',
    'newListing.error': 'เกิดข้อผิดพลาด',
    'newListing.errorMessage': 'ไม่สามารถลงประกาศได้ กรุณาลองอีกครั้ง',
    'newListing.signInRequired': 'ต้องเข้าสู่ระบบ',
    'newListing.signInRequiredMessage': 'กรุณาเข้าสู่ระบบก่อนลงประกาศ',
    'newListing.validation.title': 'ข้อมูลไม่ครบถ้วน',
    'newListing.validation.titleMessage': 'กรุณากรอกชื่อประกาศ',
    'newListing.validation.price': 'ข้อมูลไม่ถูกต้อง',
    'newListing.validation.priceMessage': 'กรุณากรอกราคาที่ถูกต้อง',
    'newListing.validation.address': 'ข้อมูลไม่ครบถ้วน',
    'newListing.validation.addressMessage': 'กรุณากรอกที่อยู่',
    'newListing.validation.district': 'ข้อมูลไม่ครบถ้วน',
    'newListing.validation.districtMessage': 'กรุณากรอกอำเภอ/เขต',
    'newListing.validation.province': 'ข้อมูลไม่ครบถ้วน',
    'newListing.validation.provinceMessage': 'กรุณากรอกจังหวัด',
    'newListing.validation.contactName': 'ข้อมูลไม่ครบถ้วน',
    'newListing.validation.contactNameMessage': 'กรุณากรอกชื่อผู้ติดต่อ',
    'newListing.validation.contactPhoneMessage': 'กรุณากรอกเบอร์โทรศัพท์',
    'newListing.imageProcessing': 'กำลังประมวลผลรูปภาพ...',
    'newListing.imageError': 'เกิดข้อผิดพลาดในการประมวลผลรูปภาพ',
    'newListing.addressPlaceholder': 'เลขที่ ถนน',
    
    // Auth
    'auth.signIn': 'เข้าสู่ระบบ',
    'auth.signUp': 'สมัครสมาชิก',
    'auth.email': 'อีเมล',
    'auth.password': 'รหัสผ่าน',
    'auth.confirmPassword': 'ยืนยันรหัสผ่าน',
    'auth.fullName': 'ชื่อ-นามสกุล',
    'auth.phone': 'เบอร์โทรศัพท์',
    'auth.submit': 'เข้าสู่ระบบ',
    'auth.submitSignUp': 'สมัครสมาชิก',
    'auth.loading': 'กำลังเข้าสู่ระบบ...',
    'auth.verifying': 'กำลังตรวจสอบ...',
    'auth.noAccount': 'ยังไม่มีบัญชี?',
    'auth.hasAccount': 'มีบัญชีแล้ว?',
    'auth.signUpLink': 'สมัครสมาชิก',
    'auth.signInLink': 'เข้าสู่ระบบ',
    'auth.error': 'เกิดข้อผิดพลาด',
    'auth.profileError': 'ไม่สามารถโหลดข้อมูลโปรไฟล์ได้ กรุณาลองอีกครั้ง',
    'auth.passwordMismatch': 'รหัสผ่านไม่ตรงกัน',
    'auth.passwordTooShort': 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
    'auth.forgotPassword': 'ลืมรหัสผ่าน?',
    'auth.terms': 'เมื่อสมัครสมาชิก แสดงว่าคุณยอมรับ',
    'auth.termsLink': 'ข้อกำหนดการใช้งาน',
    
    // Settings
    'settings.title': 'ตั้งค่าบัญชี',
    'settings.subtitle': 'จัดการข้อมูลส่วนตัวและความปลอดภัย',
    'settings.profile': 'ข้อมูลโปรไฟล์',
    'settings.password': 'เปลี่ยนรหัสผ่าน',
    'settings.save': 'บันทึก',
    'settings.cancel': 'ยกเลิก',
    'settings.loading': 'กำลังบันทึก...',
    'settings.success': 'บันทึกสำเร็จ',
    'settings.successMessage': 'ข้อมูลถูกอัปเดตเรียบร้อยแล้ว',
    'settings.error': 'เกิดข้อผิดพลาด',
    'settings.errorMessage': 'ไม่สามารถบันทึกข้อมูลได้',
    'settings.currentPassword': 'รหัสผ่านปัจจุบัน',
    'settings.newPassword': 'รหัสผ่านใหม่',
    'settings.confirmPassword': 'ยืนยันรหัสผ่านใหม่',
    'settings.passwordMismatch': 'รหัสผ่านไม่ตรงกัน',
    'settings.passwordTooShort': 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
    'settings.passwordRequired': 'กรุณากรอกรหัสผ่านปัจจุบันและรหัสผ่านใหม่',
    'settings.currentPasswordIncorrect': 'รหัสผ่านปัจจุบันไม่ถูกต้อง',
    'settings.passwordChanged': 'เปลี่ยนรหัสผ่านสำเร็จ',
    'settings.emailCannotChange': 'ไม่สามารถเปลี่ยนอีเมลได้',
    'settings.noChanges': 'ไม่มีข้อมูลที่ต้องอัปเดต',
    'settings.facebook': 'Facebook',
    'settings.facebookPlaceholder': 'https://www.facebook.com/your-profile หรือ https://m.me/your-profile',
    'settings.line': 'Line',
    'settings.linePlaceholder': 'https://line.me/ti/p/~your-line-id หรือ https://line.me/R/ti/p/@your-line-id',
    'settings.openLink': 'เปิดลิงก์',
    'settings.back': 'กลับ',
    
    // Footer
    'footer.about': 'เกี่ยวกับเรา',
    'footer.aboutDesc': 'เว็บไซต์ประกาศขายและเช่าอสังหาริมทรัพย์ ลงประกาศฟรี ไม่มีค่าใช้จ่าย',
    'footer.quickLinks': 'ลิงก์ด่วน',
    'footer.contact': 'ติดต่อเรา',
    'footer.contactAds': 'ติดต่อโฆษณา',
    'footer.copyright': 'สงวนลิขสิทธิ์',
    
    // Common
    'common.loading': 'กำลังโหลด...',
    'common.error': 'เกิดข้อผิดพลาด',
    'common.success': 'สำเร็จ',
    'common.cancel': 'ยกเลิก',
    'common.confirm': 'ยืนยัน',
    'common.save': 'บันทึก',
    'common.delete': 'ลบ',
    'common.edit': 'แก้ไข',
    'common.close': 'ปิด',
    'common.createdAt': 'ประกาศเมื่อ',
    'common.updatedAt': 'อัปเดตล่าสุด',
    'common.welcome': 'ยินดีต้อนรับ',
    'common.user': 'ผู้ใช้',
    'common.totalListings': 'ประกาศทั้งหมด',
    'common.totalViews': 'ยอดดูทั้งหมด',
    'common.featuredListings': 'ประกาศแนะนำ',
    'common.myListings': 'ประกาศของฉัน',
    'common.sale': 'ขาย',
    'common.rent': 'เช่า',
    'common.noListings': 'คุณยังไม่มีประกาศ',
    'common.noListingsFiltered': 'ไม่พบประกาศที่ตรงกับเงื่อนไข',
    'common.postFirstListing': 'ลงประกาศแรกของคุณ',
    'common.filter': 'ค้นหาและกรอง',
    'common.view': 'ดูรายละเอียด',
    'common.toggleFeatured': 'ตั้งเป็นแนะนำ',
    'common.removeFeatured': 'ยกเลิกแนะนำ',
    
    // Property types
    'property.condo': 'คอนโด',
    'property.house': 'บ้าน',
    'property.land': 'ที่ดิน',
    'property.commercial': 'เชิงพาณิชย์',
    'property.room': 'ห้อง',
    
    // Transaction types
    'transaction.sale': 'ขาย',
    'transaction.rent': 'เช่า',
    
    // Edit Listing
    'editListing.title': 'แก้ไขประกาศ',
    'editListing.titleLabel': 'หัวข้อประกาศ',
    'editListing.description': 'รายละเอียด',
    'editListing.transactionType': 'ประเภทการขาย',
    'editListing.propertyType': 'ประเภทอสังหาริมทรัพย์',
    'editListing.price': 'ราคา (บาท)',
    'editListing.bedrooms': 'ห้องนอน',
    'editListing.bathrooms': 'ห้องน้ำ',
    'editListing.area': 'พื้นที่ (ตร.ม.)',
    'editListing.address': 'ที่อยู่',
    'editListing.district': 'เขต/อำเภอ',
    'editListing.province': 'จังหวัด',
    'editListing.postalCode': 'รหัสไปรษณีย์',
    'editListing.contactInfo': 'ข้อมูลติดต่อ',
    'editListing.contactName': 'ชื่อผู้ติดต่อ',
    'editListing.contactPhone': 'เบอร์โทรศัพท์',
    'editListing.contactEmail': 'อีเมล',
    'editListing.contactFacebook': 'Facebook (URL)',
    'editListing.contactFacebookPlaceholder': 'https://www.facebook.com/your-profile หรือ https://m.me/your-profile',
    'editListing.contactLine': 'Line (URL)',
    'editListing.contactLinePlaceholder': 'https://line.me/ti/p/~your-line-id หรือ https://line.me/R/ti/p/@your-line-id',
    'editListing.images': 'รูปภาพ (สูงสุด 10 รูป)',
    'editListing.compressing': 'กำลังบีบอัดรูปภาพ...',
    'editListing.uploadHint': 'คลิกเพื่ออัปโหลดรูปภาพ',
    'editListing.uploadHintSub': '(รูปภาพจะถูกบีบอัดอัตโนมัติ)',
    'editListing.save': 'บันทึกการแก้ไข',
    'editListing.saving': 'กำลังบันทึก...',
    'editListing.viewDetails': 'ดูรายละเอียด',
    'editListing.backToDashboard': 'กลับไปแดชบอร์ด',
    'editListing.cancel': 'ยกเลิก',
    'editListing.success': 'แก้ไขสำเร็จ',
    'editListing.successMessage': 'ประกาศถูกอัปเดตเรียบร้อยแล้ว',
    'editListing.error': 'เกิดข้อผิดพลาด',
    'editListing.errorMessage': 'ไม่สามารถอัปเดตประกาศได้ กรุณาลองอีกครั้ง',
    'editListing.imageError': 'ไม่สามารถประมวลผลรูปภาพได้ กรุณาลองอีกครั้ง',
    'editListing.notFound': 'ไม่พบประกาศ',
    'editListing.notFoundOrNoPermission': 'ไม่พบประกาศหรือคุณไม่มีสิทธิ์แก้ไข',
    'editListing.loadError': 'เกิดข้อผิดพลาดในการโหลดข้อมูล',
    
    // Listing Actions
    'actions.edit': 'แก้ไข',
    'actions.delete': 'ลบ',
    'actions.dashboard': 'แดชบอร์ด',
    'actions.deleteConfirm': 'ยืนยันการลบ',
    'actions.deleteConfirmMessage': 'คุณแน่ใจหรือไม่ว่าต้องการลบประกาศนี้? การกระทำนี้ไม่สามารถยกเลิกได้',
    'actions.deleteSuccess': 'ลบสำเร็จ',
    'actions.deleteSuccessMessage': 'ประกาศถูกลบเรียบร้อยแล้ว',
    'actions.deleteError': 'เกิดข้อผิดพลาด',
    'actions.deleteErrorMessage': 'ไม่สามารถลบประกาศได้ กรุณาลองอีกครั้ง',
    
    // Modal
    'modal.close': 'ปิด',
    'modal.confirm': 'ยืนยัน',
    'modal.cancel': 'ยกเลิก',
    'modal.ok': 'ตกลง',
    'modal.processing': 'กำลังดำเนินการ...',
  },
  en: {
    // Navbar
    'nav.home': 'Home',
    'nav.new': 'New',
    'nav.newListing': 'New Listing',
    'nav.dashboard': 'Dashboard',
    'nav.settings': 'Account Settings',
    'nav.signIn': 'Sign In',
    'nav.signUp': 'Sign Up',
    'nav.signOut': 'Sign Out',
    'nav.language': 'Language',
    'nav.language.th': 'ไทย',
    'nav.language.en': 'English',
    
    // Error messages
    'error.profileMissing': 'Error',
    'error.profileMissingMessage': 'Unable to load user data. Please sign in again.',
    'error.goToLogin': 'Go to Login',
    'error.title': 'Error',
    'error.supabaseNotConfigured': 'Supabase is not configured. Please check .env.local file',
    'error.fetchFailed': 'Unable to fetch data from database',
    'error.checkSupabase': 'Please check Supabase configuration or try again',
    
    // Home page
    'home.title': 'Find House, Condo, Land, Phuket',
    'home.subtitle': 'Discover the property you are looking for',
    'home.noResults': 'No listings found',
    'home.noResultsDesc': 'Try adjusting your search filters or search with different keywords',
    'home.backToHome': 'Back to Home',
    'home.page': 'Page',
    'home.of': 'of',
    'home.results': 'results',
    'home.previous': 'Previous',
    'home.next': 'Next',
    
    // Search filters
    'search.placeholder': 'Search by keywords...',
    'search.allTransactionTypes': 'All Transaction Types',
    'search.sale': 'Sale',
    'search.rent': 'Rent',
    'search.allPropertyTypes': 'All Property Types',
    'search.condo': 'Condo',
    'search.house': 'House',
    'search.land': 'Land',
    'search.commercial': 'Commercial',
    'search.room': 'Room',
    'search.minPrice': 'Min Price (THB)',
    'search.maxPrice': 'Max Price (THB)',
    'search.bedrooms': 'Bedrooms',
    'search.bedroom': 'bedroom',
    'search.bedrooms4plus': '4+ bedrooms',
    'search.province': 'Province',
    'search.search': 'Search',
    'search.reset': 'Reset',
    
    // Listing card
    'listing.baht': 'THB',
    'listing.perMonth': '/month',
    'listing.noImage': 'No Image',
    'listing.sqm': 'sqm',
    
    // Listing detail
    'detail.backToHome': 'Back to Home',
    'detail.price': 'THB',
    'detail.perMonth': '/month',
    'detail.bedrooms': 'Bedrooms',
    'detail.bathrooms': 'Bathrooms',
    'detail.area': 'Area',
    'detail.sqm': 'sqm',
    'detail.description': 'Description',
    'detail.features': 'Features',
    'detail.contact': 'Contact',
    'detail.name': 'Name',
    'detail.phone': 'Phone',
    'detail.email': 'Email',
    'detail.facebook': 'Facebook',
    'detail.line': 'Line',
    'detail.views': 'views',
    'detail.noDescription': 'No description',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.subtitle': 'Manage your listings',
    'dashboard.newListing': 'New Listing',
    'dashboard.noListings': 'No listings yet',
    'dashboard.noListingsDesc': 'Get started by posting your property',
    'dashboard.error': 'Error loading data',
    'dashboard.loading': 'Loading...',
    'dashboard.featured': 'Featured',
    'dashboard.notFeatured': 'Not Featured',
    'dashboard.edit': 'Edit',
    'dashboard.delete': 'Delete',
    'dashboard.deleteConfirm': 'Confirm Delete',
    'dashboard.deleteConfirmMessage': 'Are you sure you want to delete this listing?',
    'dashboard.deleteSuccess': 'Deleted Successfully',
    'dashboard.deleteSuccessMessage': 'Listing has been deleted',
    'dashboard.toggleFeaturedSuccess': 'Updated Successfully',
    'dashboard.toggleFeaturedSuccessMessage': 'Featured status has been updated',
    'dashboard.errorMessage': 'An error occurred',
    'dashboard.signInRequired': 'Sign In Required',
    'dashboard.signInRequiredMessage': 'Please sign in again',
    'dashboard.filter': 'Search and Filter',
    'dashboard.confirm': 'Confirm',
    'dashboard.cancel': 'Cancel',
    'dashboard.ok': 'OK',
    
    // New Listing
    'newListing.title': 'New Listing',
    'newListing.basicInfo': 'Basic Information',
    'newListing.propertyInfo': 'Property Information',
    'newListing.location': 'Location',
    'newListing.contact': 'Contact Information',
    'newListing.images': 'Images',
    'newListing.titleLabel': 'Listing Title',
    'newListing.titlePlaceholder': 'e.g., 2-story house with garden',
    'newListing.description': 'Description',
    'newListing.descriptionPlaceholder': 'Describe your property...',
    'newListing.price': 'Price (THB)',
    'newListing.propertyType': 'Property Type',
    'newListing.transactionType': 'Transaction Type',
    'newListing.bedrooms': 'Bedrooms',
    'newListing.bathrooms': 'Bathrooms',
    'newListing.area': 'Area (sqm)',
    'newListing.address': 'Address',
    'newListing.district': 'District',
    'newListing.province': 'Province',
    'newListing.postalCode': 'Postal Code',
    'newListing.contactName': 'Contact Name',
    'newListing.contactPhone': 'Phone Number',
    'newListing.contactEmail': 'Email',
    'newListing.contactFacebook': 'Facebook (URL)',
    'newListing.contactFacebookPlaceholder': 'https://www.facebook.com/your-profile or https://m.me/your-profile',
    'newListing.contactLine': 'Line (URL)',
    'newListing.contactLinePlaceholder': 'https://line.me/ti/p/~your-line-id or https://line.me/R/ti/p/@your-line-id',
    'newListing.uploadImages': 'Upload Images',
    'newListing.maxImages': 'Max 10 images',
    'newListing.removeImage': 'Remove',
    'newListing.submit': 'Submit Listing',
    'newListing.cancel': 'Cancel',
    'newListing.loading': 'Submitting...',
    'newListing.success': 'Success',
    'newListing.successMessage': 'Your listing has been created',
    'newListing.error': 'Error',
    'newListing.errorMessage': 'Unable to submit listing. Please try again',
    'newListing.signInRequired': 'Sign In Required',
    'newListing.signInRequiredMessage': 'Please sign in before posting',
    'newListing.validation.title': 'Incomplete Information',
    'newListing.validation.titleMessage': 'Please enter listing title',
    'newListing.validation.price': 'Invalid Information',
    'newListing.validation.priceMessage': 'Please enter a valid price',
    'newListing.validation.address': 'Incomplete Information',
    'newListing.validation.addressMessage': 'Please enter address',
    'newListing.validation.district': 'Incomplete Information',
    'newListing.validation.districtMessage': 'Please enter district',
    'newListing.validation.province': 'Incomplete Information',
    'newListing.validation.provinceMessage': 'Please enter province',
    'newListing.validation.contactName': 'Incomplete Information',
    'newListing.validation.contactNameMessage': 'Please enter contact name',
    'newListing.validation.contactPhoneMessage': 'Please enter phone number',
    'newListing.imageProcessing': 'Processing images...',
    'newListing.imageError': 'Error processing images',
    'newListing.addressPlaceholder': 'Street address',
    
    // Auth
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.fullName': 'Full Name',
    'auth.phone': 'Phone Number',
    'auth.submit': 'Sign In',
    'auth.submitSignUp': 'Sign Up',
    'auth.loading': 'Signing in...',
    'auth.verifying': 'Verifying...',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    'auth.signUpLink': 'Sign Up',
    'auth.signInLink': 'Sign In',
    'auth.error': 'Error',
    'auth.profileError': 'Unable to load profile. Please try again',
    'auth.passwordMismatch': 'Passwords do not match',
    'auth.passwordTooShort': 'Password must be at least 6 characters',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.terms': 'By signing up, you agree to our',
    'auth.termsLink': 'Terms of Service',
    
    // Settings
    'settings.title': 'Account Settings',
    'settings.subtitle': 'Manage your account information and security',
    'settings.profile': 'Profile Information',
    'settings.password': 'Change Password',
    'settings.save': 'Save',
    'settings.cancel': 'Cancel',
    'settings.loading': 'Saving...',
    'settings.success': 'Saved Successfully',
    'settings.successMessage': 'Information has been updated',
    'settings.error': 'Error',
    'settings.errorMessage': 'Unable to save information',
    'settings.currentPassword': 'Current Password',
    'settings.newPassword': 'New Password',
    'settings.confirmPassword': 'Confirm New Password',
    'settings.passwordMismatch': 'Passwords do not match',
    'settings.passwordTooShort': 'Password must be at least 6 characters',
    'settings.passwordRequired': 'Please enter current and new password',
    'settings.currentPasswordIncorrect': 'Current password is incorrect',
    'settings.passwordChanged': 'Password changed successfully',
    'settings.emailCannotChange': 'Email cannot be changed',
    'settings.noChanges': 'No changes to update',
    'settings.facebook': 'Facebook',
    'settings.facebookPlaceholder': 'https://www.facebook.com/your-profile or https://m.me/your-profile',
    'settings.line': 'Line',
    'settings.linePlaceholder': 'https://line.me/ti/p/~your-line-id or https://line.me/R/ti/p/@your-line-id',
    'settings.openLink': 'Open Link',
    'settings.back': 'Back',
    
    // Footer
    'footer.about': 'About Us',
    'footer.aboutDesc': 'Real estate listing website. Post listings for free, no charges',
    'footer.quickLinks': 'Quick Links',
    'footer.contact': 'Contact Us',
    'footer.contactAds': 'Contact for Advertising',
    'footer.copyright': 'All rights reserved',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
    'common.createdAt': 'Created',
    'common.updatedAt': 'Updated',
    'common.welcome': 'Welcome',
    'common.user': 'User',
    'common.totalListings': 'Total Listings',
    'common.totalViews': 'Total Views',
    'common.featuredListings': 'Featured Listings',
    'common.myListings': 'My Listings',
    'common.sale': 'Sale',
    'common.rent': 'Rent',
    'common.noListings': 'You have no listings yet',
    'common.noListingsFiltered': 'No listings match your filters',
    'common.postFirstListing': 'Post Your First Listing',
    'common.filter': 'Search and Filter',
    'common.view': 'View Details',
    'common.toggleFeatured': 'Set as Featured',
    'common.removeFeatured': 'Remove Featured',
    
    // Edit Listing
    'editListing.title': 'Edit Listing',
    'editListing.titleLabel': 'Listing Title',
    'editListing.description': 'Description',
    'editListing.transactionType': 'Transaction Type',
    'editListing.propertyType': 'Property Type',
    'editListing.price': 'Price (THB)',
    'editListing.bedrooms': 'Bedrooms',
    'editListing.bathrooms': 'Bathrooms',
    'editListing.area': 'Area (sqm)',
    'editListing.address': 'Address',
    'editListing.district': 'District',
    'editListing.province': 'Province',
    'editListing.postalCode': 'Postal Code',
    'editListing.contactInfo': 'Contact Information',
    'editListing.contactName': 'Contact Name',
    'editListing.contactPhone': 'Phone Number',
    'editListing.contactEmail': 'Email',
    'editListing.contactFacebook': 'Facebook (URL)',
    'editListing.contactFacebookPlaceholder': 'https://www.facebook.com/your-profile or https://m.me/your-profile',
    'editListing.contactLine': 'Line (URL)',
    'editListing.contactLinePlaceholder': 'https://line.me/ti/p/~your-line-id or https://line.me/R/ti/p/@your-line-id',
    'editListing.images': 'Images (Max 10 images)',
    'editListing.compressing': 'Compressing images...',
    'editListing.uploadHint': 'Click to upload images',
    'editListing.uploadHintSub': '(Images will be compressed automatically)',
    'editListing.save': 'Save Changes',
    'editListing.saving': 'Saving...',
    'editListing.viewDetails': 'View Details',
    'editListing.backToDashboard': 'Back to Dashboard',
    'editListing.cancel': 'Cancel',
    'editListing.success': 'Updated Successfully',
    'editListing.successMessage': 'Listing has been updated',
    'editListing.error': 'Error',
    'editListing.errorMessage': 'Unable to update listing. Please try again',
    'editListing.imageError': 'Unable to process images. Please try again',
    'editListing.notFound': 'Listing Not Found',
    'editListing.notFoundOrNoPermission': 'Listing not found or you do not have permission to edit',
    'editListing.loadError': 'Error loading data',
    
    // Listing Actions
    'actions.edit': 'Edit',
    'actions.delete': 'Delete',
    'actions.dashboard': 'Dashboard',
    'actions.deleteConfirm': 'Confirm Delete',
    'actions.deleteConfirmMessage': 'Are you sure you want to delete this listing? This action cannot be undone',
    'actions.deleteSuccess': 'Deleted Successfully',
    'actions.deleteSuccessMessage': 'Listing has been deleted',
    'actions.deleteError': 'Error',
    'actions.deleteErrorMessage': 'Unable to delete listing. Please try again',
    
    // Modal
    'modal.close': 'Close',
    'modal.confirm': 'Confirm',
    'modal.cancel': 'Cancel',
    'modal.ok': 'OK',
    'modal.processing': 'Processing...',
    
    // Property types
    'property.condo': 'Condo',
    'property.house': 'House',
    'property.land': 'Land',
    'property.commercial': 'Commercial',
    'property.room': 'Room',
    
    // Transaction types
    'transaction.sale': 'Sale',
    'transaction.rent': 'Rent',
  },
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('th')

  // โหลดภาษาจาก localStorage เมื่อ component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem(STORAGE_KEY) as Language | null
      if (savedLanguage && (savedLanguage === 'th' || savedLanguage === 'en')) {
        setLanguageState(savedLanguage)
      } else {
        // ตรวจสอบ browser language
        const browserLang = navigator.language.toLowerCase()
        if (browserLang.startsWith('en')) {
          setLanguageState('en')
        } else {
          setLanguageState('th')
        }
      }
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, lang)
      // อัปเดต html lang attribute
      document.documentElement.lang = lang
    }
  }

  // อัปเดต html lang attribute เมื่อ language เปลี่ยน
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = language
    }
  }, [language])

  const t = (key: string): string => {
    return translations[language]?.[key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

