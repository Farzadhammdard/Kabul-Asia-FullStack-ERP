# Kabul Asia — Fullstack Starter (Next.js + Django)

پروژه شامل:
- backend/: Django + DRF API با JWT authentication
- frontend/: Next.js app که به API وصل می‌شود

نحوه اجرا (محلی):
1) Backend
   - cd backend
   - python -m venv venv
   - source venv/bin/activate
   - pip install -r requirements.txt
   - python manage.py migrate
   - python manage.py createsuperuser
   - python manage.py runserver

2) Frontend
   - cd frontend
   - npm install
   - ایجاد .env.local بر اساس .env.local.example
   - npm run dev
