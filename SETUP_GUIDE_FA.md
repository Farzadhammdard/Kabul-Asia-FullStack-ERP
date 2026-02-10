# راهنمای کامل نصب و راه‌اندازی (Complete Setup Guide)

## مرحله ۱: آماده‌سازی Backend (Django)

### الف) نصب نیازمندی‌ها
```bash
cd backend
python -m venv venv
```

**برای Linux/Mac:**
```bash
source venv/bin/activate
```

**برای Windows:**
```bash
venv\Scripts\activate
```

### ب) نصب Dependencies
```bash
pip install -r requirements.txt
```

### ج) متغیرهای محیطی
ایجاد فایل `.env` در دایرکتوری backend:
```bash
DJANGO_SECRET_KEY=your-secret-key-change-this
DJANGO_DEBUG=True  # برای development
DB_ENGINE=django.db.backends.sqlite3  # یا PostgreSQL برای prod
CORS_ALLOWED_ORIGINS=http://localhost:3000
RESET_PASSWORD_TOKEN=your-reset-token
```

### د) تنظیم Database
```bash
python manage.py makemigrations
python manage.py migrate
```

### ه) ایجاد Super User
```bash
python manage.py createsuperuser
# نام کاربری: admin
# رمز: (یک رمز قوی انتخاب کنید)
# ایمیل: admin@example.com
```

### و) اجرای Server
```bash
python manage.py runserver
```

✅ Backend اجرا می‌شود در: **http://localhost:8000**

---

## مرحله ۲: آماده‌سازی Frontend (Next.js)

### الف) نصب Dependencies
```bash
cd frontend
npm install
```

### ب) متغیرهای محیطی
ایجاد فایل `.env.local`:
```bash
NEXT_PUBLIC_API_BASE=http://localhost:8000/api
```

### ج) اجرای Development Server
```bash
npm run dev
```

✅ Frontend اجرا می‌شود در: **http://localhost:3000**

---

## مرحله ۳: تست ورود

1. مرورگر را بروی `http://localhost:3000` باز کنید
2. نام کاربری و رمز را وارد کنید (admin credentials از مرحله ۱-ه)
3. شما وارد داشبورد می‌شوید ✅

---

## مرحله ۴: تنظیم‌های پیشرفته

### تنظیم Database برای Production

اگر می‌خواهید PostgreSQL استفاده کنید:

**۱. نصب PostgreSQL:**
```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# macOS
brew install postgresql
```

**۲. ایجاد Database:**
```bash
createdb kabul_asia
```

**۳. تنظیم .env:**
```bash
DB_ENGINE=django.db.backends.postgresql
DB_HOST=localhost
DB_NAME=kabul_asia
DB_USER=postgres
DB_PASSWORD=your_password
```

**۴. Migrate:**
```bash
python manage.py migrate
```

---

### تنظیم CORS برای Production

**درfrontend:** تغییر `.env.local`:
```bash
NEXT_PUBLIC_API_BASE=https://api.yourdomain.com
```

**درbackend:** `.env`:
```bash
CORS_ALLOW_ALL_ORIGINS=False
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

---

## ✅ Checklist نهایی

- [ ] Backend running on :8000
- [ ] Frontend running on :3000
- [ ] Login successful
- [ ] Dashboard loads without errors
- [ ] Can view finance/invoices pages
- [ ] Admin can access settings

---

## 🔍 Troubleshooting

### مشکل: "Connection refused" برای API

**حل:**
```bash
# بررسی کنید backend اجرا می‌شود
python manage.py runserver

# اگر CORS error است:
# بررسی کنید CORS_ALLOWED_ORIGINS صحیح است
# اگر development: CORS_ALLOW_ALL_ORIGINS=True
```

### مشکل: Login page بارنشود

**حل:**
```bash
# بررسی کنید frontend در صفحه صحیح است
# چک کنید console برای errors
# Network tab در DevTools را بررسی کنید
```

### مشکل: CSRF Token Error

**حل:**
```bash
# در Django settings، اطمینان حاصل کنید:
CSRF_TRUSTED_ORIGINS = ['http://localhost:3000']
```

### مشکل: 401 Unauthorized

**حل:**
- Token expire شده است
- یا credentials غلط است
- دوباره login کنید

---

## 📚 API Endpoints

### Auth:
- `POST /api/token/` - دریافت access و refresh tokens
- `POST /api/token/refresh/` - refresh access token
- `GET /api/users/me/` - دریافت user فعلی

### Finance:
- `GET /api/finance/report/` - گزارش مالی
- `POST /api/finance/expenses/` - ثبت هزینه

### Invoices:
- `GET /api/invoices/` - لیست بل‌ها
- `POST /api/invoices/` - ایجاد بل جدید

### Services:
- `GET /api/services/` - لیست خدمات

---

## 🚀 Deployment

### برای Vercel (Frontend):
```bash
npm run build
# Deploy to Vercel
```

### برای Heroku/Railway (Backend):
```bash
git push heroku main
# یا setup environment variables
```

---

## 📞 Support

اگر مشکلی دارید:
1. فایل `SITE_ISSUES_REPORT.md` را بخوانید
2. Console errors را چک کنید (F12)
3. Network requests را مراقب کنید

---

**نوشته شده:** 2026-02-10  
**وضعیت:** ✅ Ready for Development
