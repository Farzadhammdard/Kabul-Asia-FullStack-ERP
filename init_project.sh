#!/usr/bin/env bash
set -e

# ---------------- Configuration ----------------
REMOTE_URL="https://github.com/Farzadhammdard/kabul-asia.git"
BRANCH="main"
COMMIT_MSG="chore: initial commit — Next.js frontend + Django DRF backend skeleton"

echo "🚀 شروع ساخت پروژه Fullstack (Next.js + Django)..."

# ---------------- Create folder structure ----------------
echo "📂 ساخت پوشه‌ها..."
mkdir -p backend/backend backend/api frontend/{components,lib,pages,styles}

# ---------------- Write common files ----------------
echo "✏️ نوشتن فایل‌های عمومی..."
cat > .gitignore <<'EOF'
# Python
__pycache__/
*.py[cod]
venv/
env/
.venv/

# Django
db.sqlite3
/staticfiles

# Node
node_modules/
.next/

# env files
.env
.env.local
.env.production
EOF

cat > README.md <<'EOF'
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
EOF

cat > LICENSE <<'EOF'
MIT License
Copyright (c) 2026 Farzadhammdard
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
... (standard MIT text continues)
EOF

# ---------------- Backend files ----------------
echo "⚙️ نوشتن فایل‌های backend..."
cat > backend/requirements.txt <<'EOF'
django>=4.2
djangorestframework
djangorestframework-simplejwt
django-cors-headers
psycopg2-binary
weasyprint
EOF

cat > backend/manage.py <<'EOF'
#!/usr/bin/env python
import os
import sys

def main():
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError("Couldn't import Django") from exc
    execute_from_command_line(sys.argv)

if __name__ == "__main__":
    main()
EOF

touch backend/backend/__init__.py

cat > backend/backend/settings.py <<'EOF'
import os
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "unsafe-dev-secret")
DEBUG = os.getenv("DJANGO_DEBUG", "1") == "1"
ALLOWED_HOSTS = ["*"]

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "api",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
]

ROOT_URLCONF = "backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "backend.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": os.getenv("DB_ENGINE", "django.db.backends.sqlite3"),
        "NAME": os.getenv("DB_NAME", BASE_DIR / "db.sqlite3"),
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "fa"
TIME_ZONE = "Asia/Kabul"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"

# CORS
CORS_ALLOW_ALL_ORIGINS = True

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=int(os.getenv("ACCESS_TOKEN_MINUTES", "60"))),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
}
EOF

cat > backend/.env.example <<'EOF'
DJANGO_SECRET_KEY=change-me
DJANGO_DEBUG=1
DB_ENGINE=django.db.backends.sqlite3
DB_NAME=db.sqlite3
ACCESS_TOKEN_MINUTES=60
EOF

# ---------------- Frontend files ----------------
echo "⚙️ نوشتن فایل‌های frontend..."
cat > frontend/package.json <<'EOF'
{
  "name": "kabel-asia-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "axios": "^1.4.0",
    "lucide-react": "^0.270.0",
    "next": "13.4.10",
    "react": "18.2.0",
    "react-dom": "18.2.0"
  },
  "devDependencies": {
    "tailwindcss": "^3.3.3",
    "postcss": "^8.4.27",
    "autoprefixer": "^10.4.14"
  }
}
EOF

cat > frontend/next.config.js <<'EOF'
const nextConfig = {
  reactStrictMode: true,
};
module.exports = nextConfig;
EOF

cat > frontend/.env.local.example <<'EOF'
NEXT_PUBLIC_API_URL=http://localhost:8000/api
EOF

cat > frontend/styles/globals.css <<'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

body { font-family: Inter, ui-sans-serif, system-ui; background: #0f1724; color: #fff; }
EOF

# ---------------- Git Init & Commit ----------------
echo "🔧 اینیشیالایز git..."
git init
git checkout -b "${BRANCH}" || true
git add .
git commit -m "${COMMIT_MSG}"

echo "🔗 اضافه کردن remote..."
git remote add origin "${REMOTE_URL}" || true

# ---------------- Push with safety ----------------
echo "📤 Push به remote..."
if git push -u origin "${BRANCH}"; then
  echo "✅ Push موفق بود!"
else
  echo "⚠️ Push با خطا مواجه شد. احتمالا remote قبلا commit دارد."
  read -p "آیا می‌خواهید force push انجام دهید؟ [y/N]: " confirm
  if [[ "$confirm" =~ ^[Yy]$ ]]; then
    git push -u origin "${BRANCH}" --force
    echo "✅ Force push انجام شد."
  else
    echo "❌ Push متوقف شد. ابتدا تغییرات remote را pull کنید و سپس دوباره امتحان کنید."
    exit 1
  fi
fi

# ---------------- Post-setup instructions ----------------
echo "🎉 پروژه ساخته شد!"
echo "Backend: cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
echo "Frontend: cd frontend && npm install && npx tailwindcss init -p"
echo "PDF generation: در backend می‌توانید از WeasyPrint برای تولید PDF فاکتورها استفاده کنید."

echo "تمام شد."
