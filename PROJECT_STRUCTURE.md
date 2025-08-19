# TPS Dashboard - Struktur Project

## 📁 **FRONTEND (Next.js 15 dengan App Router)**

### **🎨 Pages (Halaman-halaman)**
```
src/app/
├── page.js                 # 🏠 Homepage/Dashboard utama (/)
├── page-old.js            # 📄 Versi lama homepage
├── page-new.js            # 📄 Versi baru homepage
├── layout.js              # 🎯 Layout utama untuk semua halaman
├── globals.css            # 🎨 Style global CSS
├── favicon.ico            # 🔸 Icon website
├── catalog/
│   └── page.js           # 📚 Halaman Catalog (/catalog)
└── management/
    └── page.js           # ⚙️ Halaman Management (/management)
```

### **🧩 Components (Komponen)**
```
src/components/
└── Navigation.js          # 🧭 Komponen navigasi/menu
```

### **🔧 Libraries & Utilities**
```
src/lib/
└── db.ts                  # 🗄️ Konfigurasi database connection
```

### **🖼️ Assets Statis**
```
public/
├── file.svg               # 📄 Icon file
├── globe.svg              # 🌍 Icon globe  
├── next.svg               # ▲ Logo Next.js
├── vercel.svg             # 🔺 Logo Vercel
└── window.svg             # 🪟 Icon window
```

---

## 🔧 **BACKEND (API Routes & Server)**

### **📡 API Routes (Next.js API)**
```
src/app/api/
├── dashboard/
│   └── stats/
│       └── route.ts       # 📊 API untuk statistik dashboard
└── materials/
    ├── route.ts           # 📦 CRUD materials utama
    ├── route-old.ts       # 📦 Versi lama API materials
    ├── route-new.ts       # 📦 Versi baru API materials
    ├── route-backup.ts    # 💾 Backup API materials
    ├── export-new.ts      # 📤 Export materials (versi baru)
    ├── [id]/
    │   └── route.ts       # 📦 API materials by ID
    ├── export/
    │   └── route.ts       # 📤 Export materials
    ├── template/
    │   └── route.ts       # 📋 Template materials
    └── upload/
        └── route.ts       # 📥 Upload materials
```

### **🖥️ Backend Server Terpisah (Opsional)**
```
backend/
└── src/
    └── routes/
        ├── dashboard.ts   # 🎯 Routes untuk dashboard
        └── materials.ts   # 📦 Routes untuk materials
```

---

## 🗄️ **DATABASE**
```
database/
├── setup_db.sql          # 🛠️ Script setup database awal
└── new_schema.sql         # 📋 Schema database terbaru
```

---

## 📜 **SCRIPTS & UTILITIES**
```
scripts/
└── analytics.py           # 📈 Script analisis data Python
```

---

## 📚 **DOCUMENTATION**
```
docs/
└── TPS Dashboard Materials Template.xlsx  # 📊 Template Excel untuk materials
```

---

## ⚙️ **CONFIGURATION FILES**
```
Root Directory:
├── package.json           # 📦 Dependencies & scripts Node.js
├── next.config.ts         # ⚙️ Konfigurasi Next.js
├── tsconfig.json          # 🔧 Konfigurasi TypeScript
├── eslint.config.mjs      # 🧹 Konfigurasi ESLint
├── postcss.config.mjs     # 🎨 Konfigurasi PostCSS
├── next-env.d.ts          # 🔷 Type definitions Next.js
├── .env.local             # 🔐 Environment variables
├── .gitignore             # 📝 File yang diabaikan Git
└── README.md              # 📖 Dokumentasi project
```

---

## 🚀 **CARA KERJA ROUTING**

### **Frontend Pages:**
- `/` → `src/app/page.js` (Dashboard utama)
- `/catalog` → `src/app/catalog/page.js` (Halaman catalog)
- `/management` → `src/app/management/page.js` (Halaman management)

### **API Endpoints:**
- `GET/POST /api/materials` → CRUD materials
- `GET /api/materials/[id]` → Get material by ID
- `POST /api/materials/upload` → Upload materials
- `GET /api/materials/export` → Export materials
- `GET /api/materials/template` → Download template
- `GET /api/dashboard/stats` → Dashboard statistics

---

## 🛠️ **DEVELOPMENT COMMANDS**
```bash
npm run dev      # Jalankan development server
npm run build    # Build untuk production
npm run start    # Jalankan production server
npm run lint     # Check code quality
```

---

## 🔄 **FILE VERSIONS**
Beberapa file memiliki versi berbeda:
- `page.js` vs `page-old.js` vs `page-new.js`
- `route.ts` vs `route-old.ts` vs `route-new.ts`

**Rekomendasi:** Gunakan file tanpa suffix sebagai versi aktif, dan hapus versi lama setelah testing selesai.
