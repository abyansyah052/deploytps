# 🚀 Deployment Guide - Vercel

## ⚙️ Environment Variables di Vercel

### 1. Masuk ke Vercel Dashboard
- Buka project Anda di Vercel
- Pilih tab **Settings** → **Environment Variables**

### 2. Tambahkan Variables Ini:

```env
# Database Connection
DATABASE_URL=postgresql://postgres.dpjupmbrqvlufeegrrjf:tujubelasagustus@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require

# Next.js Public URL (akan auto-generate)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 3. Deploy Settings

#### ✅ Build Command (Default - Tidak perlu ubah):
```bash
npm run build
```

#### ✅ Install Command (Default - Tidak perlu ubah):
```bash
npm install
```

#### ❌ TIDAK PERLU Post Install Script!

## 🔧 Database Schema Setup

### Option 1: Manual Setup (Recommended)
1. Login ke Supabase dashboard
2. Buka SQL Editor
3. Copy-paste isi file `dbsupa/supabase-schema.sql`
4. Run script

### Option 2: Via Local Script
```bash
# Dari local machine (setelah deploy)
cd dbsupa
node supabase-setup.js schema
node supabase-setup.js seed
```

## 📋 Vercel Deploy Checklist

- [ ] Environment variables sudah di-set
- [ ] Database schema sudah dijalankan
- [ ] Test connection ke database
- [ ] Deploy dari GitHub repo
- [ ] Test aplikasi di production URL

## 🚨 Security Notes

- ✅ Environment files (.env*) sudah di-gitignore
- ✅ Database credentials tidak ter-commit
- ✅ Supabase connection menggunakan SSL
- ✅ Row Level Security (RLS) aktif di Supabase

## 🔍 Troubleshooting

### Jika Build Gagal:
1. Check Node.js version (gunakan Node 18+)
2. Pastikan environment variables benar
3. Test database connection

### Jika Runtime Error:
1. Check database connection di Vercel logs
2. Pastikan SSL connection aktif
3. Verify Supabase pooler settings
