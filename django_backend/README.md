# NUAM Plataforma Tributaria — Backend Python / Django + Supabase PostgreSQL

Este directorio contiene el backend completo en **Python 3.11+ / Django 5.1 / Django REST Framework / SimpleJWT** conectado a **Supabase PostgreSQL**.

## 1. Preparar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com).
2. En el **SQL Editor** de Supabase, ejecuta el archivo `/supabase/schema.sql` para crear las tablas (`nuam_users`, `tax_qualifications`, `dj1948_batches`, `audit_logs`), políticas RLS y habilitar `supabase_realtime`.
3. Copia tu cadena de conexión **Transaction / Session Pooler** (`SUPABASE_DB_URL`), la URL del proyecto (`SUPABASE_URL`) y la clave `SUPABASE_SERVICE_ROLE_KEY`.

## 2. Ejecutar Backend Django localmente

```bash
cd django_backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Configura variables (o exporta desde .env)
export SUPABASE_DB_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
export SUPABASE_URL="https://[PROJECT_REF].supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="[SERVICE_ROLE_KEY]"
export DJANGO_SECRET_KEY="clave-segura-produccion"

python manage.py makemigrations core
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

## 3. Conectar el Frontend React con Django o Vercel

- En **Vercel / Preview** (sin servidor Python externo), el frontend usa automáticamente las rutas serverless `/api/*` con soporte directo para `SUPABASE_DB_URL`, `SUPABASE_URL`, JWT HS256 y Server-Sent Events (`/api/reports/stream`).
- Cuando despliegues el backend Django (Railway, Render, Cloud Run o Fly.io), define `VITE_API_URL=https://tu-backend-django.example.com` en Vercel y el frontend consumirá directamente la API Django DRF + SimpleJWT.
