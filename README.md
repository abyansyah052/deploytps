# 🏭 TPS Dashboard - Materials Management System

Dashboard untuk manajemen materials di sistem TPS dengan fitur CRUD, upload Excel, export data, dan analytics dashboard.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup database
# Jalankan script di database/setup_db.sql di PostgreSQL Anda

# Setup environment variables
cp .env.example .env.local
# Edit .env.local dengan database credentials Anda

# Run development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) untuk melihat aplikasi.

## 📁 Struktur Project

```
📦 TPS Dashboard
├── 🎨 FRONTEND (Next.js 15 + App Router)
│   ├── src/app/                 # Pages & API routes
│   ├── src/components/          # Reusable components  
│   └── src/lib/                # Utilities & config
├── 🗄️ DATABASE
│   ├── setup_db.sql            # Database setup
│   └── new_schema.sql          # Latest schema
├── 📜 SCRIPTS
│   ├── analytics.py            # Data analysis
│   └── cleanup.sh              # Project cleanup
└── 📚 DOCS
    └── *.xlsx                  # Templates & docs
```

**📖 Lihat [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) untuk detail lengkap!**

## 🌟 Fitur Utama

### 🏠 **Dashboard**
- 📊 Real-time statistics
- 📈 Charts & analytics
- 🎯 Quick actions

### 📦 **Materials Management**
- ➕ CRUD operations (Create, Read, Update, Delete)
- 📤 Excel export
- 📥 Bulk upload via Excel
- 📋 Template download
- 🔍 Search & filter

### 📚 **Catalog**
- 🗂️ Material catalog view
- 🏷️ Category filtering
- 📄 Detailed material info

### ⚙️ **Management**
- 👥 User management
- 🔧 System settings
- 📊 Reports

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework dengan App Router
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Chart.js** - Data visualization
- **React Hook Form** - Form handling
- **React Query** - Data fetching

### Backend
- **Next.js API Routes** - Backend API
- **PostgreSQL** - Database
- **Node.js** - Runtime

### Tools
- **ESLint** - Code linting
- **Turbopack** - Fast bundler
- **Zod** - Schema validation

## 📝 Available Scripts

```bash
npm run dev      # Development server dengan Turbopack
npm run build    # Build production
npm run start    # Start production server
npm run lint     # Check code quality
```

## 🧹 Maintenance

### Cleanup File Duplikat
```bash
bash scripts/cleanup.sh
```

### Database Migration
```bash
# Jalankan new_schema.sql untuk update schema terbaru
psql -d your_database -f database/new_schema.sql
```

## 🔧 Configuration

### Environment Variables (.env.local)
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/tps_dashboard"

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Database Setup
1. Install PostgreSQL
2. Create database: `createdb tps_dashboard`
3. Run setup script: `psql -d tps_dashboard -f database/setup_db.sql`

## 📚 Documentation

- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Struktur project detail
- [docs/](./docs/) - Template & dokumentasi
- [Next.js Docs](https://nextjs.org/docs) - Next.js documentation

## 🤝 Development

### File Organization
- **Pages**: `src/app/[page]/page.js`
- **API**: `src/app/api/[endpoint]/route.ts`
- **Components**: `src/components/[Component].js`
- **Utils**: `src/lib/[utility].ts`

### Naming Convention
- Pages: `kebab-case`
- Components: `PascalCase`
- Files: `camelCase.js/ts`
- API routes: `route.ts`

---

**🎯 Happy Coding!** 
Build dengan ❤️ menggunakan Next.js
