# S.T. ก้าวหน้า (S.T. Progress)

ระบบดิจิทัลสภานักเรียน (Digital Student Council System) สำหรับโรงเรียนในประเทศไทย

## ฟีเจอร์ที่เพิ่มล่าสุด
- **หน้าแก้ไขข้อมูลส่วนตัว (`edit-profile.html`)**: รองรับการเปลี่ยนรูปโปรไฟล์ (พรีวิวได้), แก้ไขชื่อ-นามสกุล และรหัสนักเรียน
- **ปรับปรุง UI แถบเมนูด้านล่าง (Bottom Navigation)**: 
  - เพิ่มความสูงของแถบเมนูเป็น 80px (h-20) และเพิ่ม padding เพื่อให้กดง่ายขึ้น
  - ย้ายสไตล์หลักไปที่ `style.css`
- **ระบบ Profile & Shortcuts**:
  - เพิ่มเมนู Dropdown เมื่อคลิกที่รูปโปรไฟล์ พร้อมทางลัดด่วน (Quick Shortcuts)
  - เพิ่มระบบ Dark Mode (โหมดมืด) ทั้งระบบพร้อมปุ่มเปิด-ปิดในเมนูโปรไฟล์
- **ระบบเช็คชื่อ (QR Code 06:00 - 08:00)**:
  - **Generate QR ถาวร**: ระบบสร้าง QR Code สำหรับนำไปพิมพ์ติดจุดเช็คชื่อ (`admin-qr-generator.html`)
  - **Time-Lock**: ระบบเช็คชื่อที่อนุญาตให้บันทึกเวลาได้เฉพาะช่วง 06:00 - 08:00 น. (`check-in.html`)

## โครงสร้างไฟล์
- `index.html`: หน้าหลัก
- `profile.html`: หน้าโปรไฟล์ผู้ใช้
- `edit-profile.html`: หน้าแก้ไขข้อมูลส่วนตัว
- `points.html`: ระบบสะสมแต้มและธนาคารขยะ
- `report.html`: ระบบแจ้งปัญหา
- `announcements.html`: ประกาศจากสภาฯ
- `guide.html`: คู่มือการใช้งาน
- `admin-dashboard.html`: แผงควบคุมแอดมิน
- `admin-qr-generator.html`: ระบบสร้าง QR Code เช็คชื่อ
- `check-in.html`: หน้าเช็คชื่อสำหรับนักเรียน
- `style.css`: สไตล์ชีตหลักรวมถึง Dark Mode สไตล์
- `js/`: โมดูล JavaScript สำหรับ Auth และ Data

## การดูแลรักษาระบบ (Maintenance)
- ระบบพรีวิวใช้ `static-web-server` รันบนพอร์ต 8080
- หากพรีวิวไม่ขึ้น ให้ตรวจสอบไฟล์ `.config/static-web-server.toml` หรือใช้คำสั่ง `static-web-server -p 8080 --host 0.0.0.0 &` ใน Bash
