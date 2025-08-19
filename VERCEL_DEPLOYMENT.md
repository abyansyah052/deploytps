# 🚀 Vercel Deployment Guide

## Environment Variables untuk Vercel

Copy dan paste environment variables berikut ke Vercel Dashboard:

### Database Configuration (Supabase)
```
DB_HOST=aws-1-ap-southeast-1.pooler.supabase.com
DB_PORT=6543
DB_NAME=postgres
DB_USER=postgres.dpjupmbrqvlufeegrrjf
DB_PASSWORD=tujubelasagustus
```

### Next.js Configuration
```
NEXTAUTH_SECRET=cQ8z1vc6MxQ/G5ogtj9CgG6kCrTVyka7tk2e33I2RPk=
NEXTAUTH_URL=https://deploytps.vercel.app
```

### Database URL (Alternative Format)
```
DATABASE_URL=postgresql://postgres.dpjupmbrqvlufeegrrjf:tujubelasagustus@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres
```

## 📝 Steps untuk Deploy:

1. **Set Environment Variables di Vercel:**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add semua variables di atas satu per satu
   - Click Save

2. **Update NEXTAUTH_URL:**
   - Ganti dengan URL production yang benar
   - Format: `https://[your-vercel-domain].vercel.app`

3. **Redeploy:**
   - Go to Deployments tab
   - Click Redeploy pada deployment terakhir

## 🔍 Troubleshooting:

### Check Browser Console Error:
1. Buka website yang error
2. Klik kanan → Inspect Element (atau tekan F12)
3. Click tab "Console"
4. Screenshot error yang muncul

### Check API Endpoint:
Test langsung API dengan membuka:
- `https://[your-domain]/api/materials`
- `https://[your-domain]/api/dashboard/stats`

## 🎯 Expected Result:
Setelah setup, aplikasi harus bisa:
- Load dashboard dengan statistics
- Menampilkan material catalog  
- Menampilkan management page
- Connect ke Supabase database
