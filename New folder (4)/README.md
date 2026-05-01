# ระบบจัดการสินค้า — คู่มือติดตั้ง

## โครงสร้างไฟล์
```
/
├── index.html          ← หน้า Login
├── products.html       ← หน้าจัดการสินค้า
├── css/style.css       ← สไตล์ทั้งหมด
└── js/
    ├── firebase-config.js  ← ← ← ต้องแก้ไขก่อน!
    └── products.js         ← Logic ทั้งหมด
```

---

## ขั้นตอนที่ 1 — สร้าง Firebase Project

1. ไปที่ https://console.firebase.google.com
2. คลิก **Add project** → ตั้งชื่อ → Create
3. ไปที่ **Project Settings** (ไอคอนฟัน) → **Your apps** → คลิก **</>** (Web)
4. ตั้งชื่อ App → Register → คัดลอก `firebaseConfig` ที่ได้

---

## ขั้นตอนที่ 2 — เปิดใช้ Authentication

1. Firebase Console → **Authentication** → Get started
2. Sign-in method → เปิด **Email/Password**
3. Users → **Add user** → กรอก email + password ที่ต้องการใช้

---

## ขั้นตอนที่ 3 — เปิดใช้ Realtime Database

1. Firebase Console → **Realtime Database** → Create database
2. เลือก **asia-southeast1** (Singapore) เพื่อความเร็ว
3. Start in **test mode** ก่อน (แก้ rules ทีหลัง)
4. คัดลอก Database URL (รูปแบบ: `https://xxx-default-rtdb.asia-southeast1.firebasedatabase.app`)

### Database Rules (แนะนำ):
```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

---

## ขั้นตอนที่ 4 — แก้ไข firebase-config.js

เปิดไฟล์ `js/firebase-config.js` แล้วแทนที่ค่าทั้งหมด:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",           // จาก Firebase Console
  authDomain: "myapp.firebaseapp.com",
  databaseURL: "https://myapp-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "myapp",
  storageBucket: "myapp.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

## ขั้นตอนที่ 5 — Deploy ขึ้น Netlify

### วิธีที่ 1: Drag & Drop (ง่ายสุด)
1. ไปที่ https://app.netlify.com/projects/delicate-arithmetic-d8647c
2. **Deploys** → ลาก folder ทั้งหมดวางในช่อง drop zone
3. รอสักครู่ → เสร็จ!

### วิธีที่ 2: ผ่าน GitHub (แนะนำ)
1. Push ไฟล์ทั้งหมดขึ้น GitHub repo
2. Netlify → Site configuration → Link to Git → เลือก repo
3. ทุกครั้งที่ push GitHub จะ deploy อัตโนมัติ

---

## ขั้นตอนที่ 6 — นำเข้าสินค้าจาก Google Sheets

1. Login เข้า Web App
2. คลิก **📥 นำเข้าจาก Sheets**
3. กรอก:
   - **Sheet ID**: `1Xnnb-ExFqyJ0G0L71UuAZPrs0LJmzmBcZNqSCxJNWgE`
   - **Sheet Name**: `สินค้า`
   - **API Key**: สร้างได้จาก https://console.cloud.google.com → APIs & Services → Credentials → Create API Key → เปิด Google Sheets API
4. คลิก **เริ่มนำเข้า**

---

## ฟีเจอร์ที่มี

| ฟีเจอร์ | รายละเอียด |
|---------|-----------|
| 🔐 Login | Firebase Auth Email/Password |
| 🔍 ค้นหา | ค้นได้ทุกฟิลด์ กรองแบบ real-time |
| ➕ เพิ่มสินค้า | บันทึกลง Firebase ทันที |
| ✏️ แก้ไข | แก้ข้อมูลได้ทุกฟิลด์ |
| 🗑️ ลบ | มีขั้นตอนยืนยันก่อนเสมอ |
| 📥 Import | นำเข้าจาก Google Sheets ได้เลย |
| 📄 Pagination | แสดงทีละ 50 รายการ |
| 📊 Stats | นับจำนวน real-time |
