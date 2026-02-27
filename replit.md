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

## โครงสร้างไฟล์
- `index.html`: หน้าหลัก
- `profile.html`: หน้าโปรไฟล์ผู้ใช้
- `edit-profile.html`: หน้าแก้ไขข้อมูลส่วนตัว
- `points.html`: ระบบสะสมแต้มและธนาคารขยะ
- `report.html`: ระบบแจ้งปัญหา
- `announcements.html`: ประกาศจากสภาฯ
- `guide.html`: คู่มือการใช้งาน
- `style.css`: สไตล์ชีตหลักรวมถึง Dark Mode สไตล์
- `js/`: โมดูล JavaScript สำหรับ Auth และ Data

## การดูแลรักษาระบบ (Maintenance)
- ระบบพรีวิวใช้ `static-web-server` รันบนพอร์ต 8080
- หากพรีวิวไม่ขึ้น ให้ตรวจสอบไฟล์ `.config/static-web-server.toml` หรือใช้คำสั่ง `static-web-server -p 8080 --host 0.0.0.0 &` ใน Bash
