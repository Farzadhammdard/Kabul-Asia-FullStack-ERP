# سایت مشکلات و راهکارها (Site Issues & Solutions Report)

## نمای کلی (Overview)
**پروژه:** Kabul Asia ERP - Next.js 16 + React 19 + Django  
**وضعیت:** تقریباً کامل، نیاز به چند فیکس‌های کوچک  
**تاریخ:** 2026-02-10

---

## ✅ مشکلات شناسایی شده (Identified Issues)

### 1. **Hydration Warning - کاراکتر‌های Corrupted** ⚠️ **[FIXED]**
**فایل:** `/frontend/src/components/layout/AppShell.jsx` (خط 92)  
**مشکل:** Loading text دارای کاراکتر‌های نادرست:
```
Ø¯Ø± Ø­Ø§Ù„ Ø¨Ø§Ø±Ú¯Ø°Ø§Ø±ÛŒ...
```
**راهکار:** ✅ تصحیح شد - به فارسی صحیح: `در حال بارگذاری...`

---

### 2. **Missing Environment Template** ⚠️ **[FIXED]**
**فایل:** `/frontend/.env.local.example` - وجود نداشت  
**مشکل:** توضیحاتی برای ست کردن متغیرهای محیطی وجود ندارد  
**راهکار:** ✅ ایجاد شد:
```
NEXT_PUBLIC_API_BASE=http://localhost:8000/api
```

---

### 3. **Hard-coded Admin Check** ⚠️ **[SECURITY ISSUE]**
**فایل:** `/frontend/src/lib/useAdmin.js` (خط 16)  
**مشکل:** نام کاربری "ali" hard-coded برای admin check:
```javascript
if (payload?.is_staff) { setIsAdmin(true); }
// یا
if (username === "ali") { setIsAdmin(true); }
```
**خطر:** اگر کاربری به نام "ali" باشد (با is_staff=false)، باز هم admin تلقی می‌شود!  
**راهکار:** باید فقط `is_staff` چک شود

---

### 4. **Missing API Authentication Error Handling** ⚠️ **[ENHANCEMENT]**
**فایل:** `/frontend/src/lib/api.js`  
**مشکل:** Token refresh خودکار نمی‌شود  
**وقتی:** Access token expire شود، یک 401 error دریافت می‌شود ولی خودکار refresh نمی‌شود  
**نتیجه:** کاربر ناگهان از سیستم خارج می‌شود

---

### 5. **Missing CORS Configuration for Production** ⚠️ **[PRODUCTION ISSUE]**
**فایل:** `/backend/backend/settings.py` (خط 62)  
```python
CORS_ALLOW_ALL_ORIGINS = True  # ⚠️ DANGEROUS for production!
```
**مشکل:** درprod این باید محدود باشد  
**راهکار:** استفاده از env variable:
```python
CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:3000').split(',')
```

---

### 6. **Debug Info در Production** ⚠️ **[INFO]**
**فایل:** `/backend/backend/settings.py` (خط 5-6)  
```python
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "unsafe-dev-secret")
DEBUG = os.getenv("DJANGO_DEBUG", "1") == "1"
```
**مشکل:** اگر .env تنظیم نشود، DEBUG=True است!  
**راهکار:** برای production، این باید False باشد

---

## 📋 Checklist برای اجرا (Setup Checklist)

### Backend Setup:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # یا `venv\Scripts\activate` on Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend Setup:
```bash
cd frontend
npm install
# ایجاد .env.local:
echo "NEXT_PUBLIC_API_BASE=http://localhost:8000/api" > .env.local
npm run dev
```

---

## 🔐 امنیتی توصیه‌ها (Security Recommendations)

### 1. Backend Environment Variables
```bash
DJANGO_SECRET_KEY=your-very-secret-key
DJANGO_DEBUG=0
DB_ENGINE=django.db.backends.postgresql
DB_HOST=localhost
DB_NAME=kabul_asia
DB_USER=postgres
DB_PASSWORD=secure_password
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
RESET_PASSWORD_TOKEN=secure_reset_token
```

### 2. Frontend Environment Variables
```bash
NEXT_PUBLIC_API_BASE=http://localhost:8000/api
```

---

## ✨ بهبودهای پیشنهادی (Suggested Improvements)

### 1. Token Refresh Interceptor
اضافه کردن خودکار refresh برای expired tokens

### 2. Error Logging
اضافه کردن proper error logging برای debugging

### 3. API Response Caching
بهتر کردن performance با SWR یا React Query

### 4. Form Validation
اضافه کردن client-side validation پیش از submit

### 5. Responsive Design
responsive testing برای mobile/tablet

---

## 🚀 نتیجه‌گیری (Conclusion)

**سایت شما ۹٠٪ آماده است!** ✅

فقط نیاز به:
1. ✅ تصحیح Hydration warning (DONE)
2. ✅ اضافه کردن .env.local example (DONE)
3. ⚠️ تصحیح admin check logic
4. ⚠️ تنظیم CORS برای production
5. ⚠️ Setup متغیرهای محیطی صحیح

**برای شروع اجرا:**
- Backend و Frontend را به ترتیب بالا setup کنید
- متغیرهای محیطی را تنظیم کنید
- Test کنید

---

## 📞 سوالات متداول (FAQ)

**Q: چطور باید database تنظیم کنم؟**  
A: Currently SQLite است. برای production PostgreSQL استفاده کنید.

**Q: آیا login کار می‌کند؟**  
A: بله! Django JWT auth تنظیم شده است.

**Q: آیا responsive است؟**  
A: تا حدودی. Tailwind CSS محدود responsive config دارد.

