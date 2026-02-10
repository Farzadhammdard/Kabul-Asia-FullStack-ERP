# Kabul Asia ERP - Deployment Guide

## سایت آماده برای استقرار است ✅

پروژه شما یک اپلیکیشن Full-Stack شامل:
- **Frontend**: Next.js 16 (RTL Support - فارسی)
- **Backend**: Django REST API
- **Database**: PostgreSQL (یا MySQL)

---

## 1. FRONTEND DEPLOYMENT (Next.js) 📦

### گزینه A: Vercel (توصیه شده)

#### مرحله 1: اتصال GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### مرحله 2: صفحه Vercel
1. به vercel.com رفتید
2. روی "Import Project" کلیک کنید
3. مخزن GitHub را انتخاب کنید
4. متغیرهای محیطی را اضافه کنید:

```
NEXT_PUBLIC_API_BASE = https://your-django-backend.com/api
```

#### مرحله 3: Deploy
- Vercel خودکار deploy می‌کند

### گزینه B: GitHub Pages / Netlify / AWS Amplify

```bash
# Frontend Build
cd frontend
npm install
npm run build
```

---

## 2. BACKEND DEPLOYMENT (Django) 🔧

### گزینه A: Heroku

```bash
# 1. نصب Heroku CLI
# 2. ایجاد app
heroku create your-app-name

# 3. تنظیم Database
heroku addons:create heroku-postgresql:hobby-dev

# 4. متغیرهای محیطی
heroku config:set SECRET_KEY=your-secret-key
heroku config:set DEBUG=False
heroku config:set ALLOWED_HOSTS=your-app.herokuapp.com
heroku config:set CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app

# 5. Deploy
git push heroku main
heroku run python manage.py migrate
heroku run python manage.py createsuperuser
```

### گزینه B: AWS EC2

```bash
# SSH به سرور
ssh -i your-key.pem ubuntu@your-server-ip

# نصب وابستگی‌ها
sudo apt update
sudo apt install python3-pip python3-venv postgresql

# Clone کنید
git clone https://github.com/your-repo.git
cd backend

# Virtual Environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Setup Database
python manage.py migrate
python manage.py createsuperuser

# Gunicorn
pip install gunicorn
gunicorn backend.wsgi:application --bind 0.0.0.0:8000
```

### گزینه C: Railway.app / Render.com

1. مخزن GitHub را متصل کنید
2. متغیرهای محیطی را اضافه کنید
3. Deploy

---

## 3. متغیرهای محیطی (Environment Variables)

### Backend (.env)
```
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
DATABASE_URL=postgresql://user:password@localhost/dbname
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
CORS_ALLOW_ALL_ORIGINS=False
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_BASE=https://your-api.com/api
```

---

## 4. Database Setup

### PostgreSQL
```bash
# ایجاد database
createdb kabul_asia_db

# Run Migrations
python manage.py migrate
```

### MySQL
```bash
# Create Database
mysql -u root -p
CREATE DATABASE kabul_asia_db;
```

---

## 5. SSL/HTTPS Setup

### Let's Encrypt (رایگان)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --standalone -d your-domain.com
```

### خودکار توسط Vercel / Heroku
- Vercel: خودکار ✅
- Heroku: خودکار ✅
- Railway: خودکار ✅

---

## 6. Domain Setup

### نقاط DNS
```
Frontend (Vercel): 
  A Record → 76.76.19.132
  CNAME → cname.vercel-dns.com

Backend (Heroku):
  CNAME → your-app.herokuapp.com
```

---

## 7. Performance Optimization

### Frontend
- ✅ Next.js Built-in Optimization
- ✅ Image Optimization
- ✅ CSS/JS Minification
- ✅ RTL Support (Farsi)

### Backend
- ✅ Django Debug Toolbar
- ✅ Database Query Optimization
- ✅ Caching Strategy
- ✅ CORS Configured

---

## 8. Monitoring & Logging

### Frontend
```bash
# Vercel Analytics
# خودکار در Vercel فعال است
```

### Backend
```bash
# Django Logging
# برای Production logs setup کنید
```

---

## 9. Backup & Recovery

### Database Backup (PostgreSQL)
```bash
# Backup
pg_dump kabul_asia_db > backup.sql

# Restore
psql kabul_asia_db < backup.sql
```

---

## 10. Checklist قبل از Deploy

- [ ] `.env.local` در Frontend تنظیم شده
- [ ] Backend Database Setup شده
- [ ] CORS تنظیم شده
- [ ] SECRET_KEY تولید شده
- [ ] DEBUG=False در Production
- [ ] ALLOWED_HOSTS تنظیم شده
- [ ] SSL/HTTPS تنظیم شده
- [ ] Backups تهیه شده

---

## Support

اگر مشکل دارید:
1. Vercel Logs را بررسی کنید
2. Heroku/Server Logs را بررسی کنید
3. Network Requests را بررسی کنید (DevTools → Network)
4. CORS Errors را بررسی کنید

---

**Created**: 2026-02-10
**Status**: Ready for Deployment ✅
