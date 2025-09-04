# 🏭 TPS Dashboard - Materials Management System

Dashboard untuk manajemen materials di sistem TPS dengan fitur CRUD, upload Excel, export data, analytics dashboard, dan admin panel yang aman.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

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
│   │   ├── admin/              # Admin panel dengan authentication
│   │   ├── api/                # Backend API endpoints
│   │   ├── catalog/            # Material catalog
│   │   └── management/         # Material management
│   ├── src/components/          # Reusable components  
│   └── src/lib/                # Database & utilities
├── 🗄️ DATABASE
│   └── database/               # Database schemas
├── 📜 SCRIPTS
│   ├── analytics.py            # Data analysis
│   └── update-database.sh      # Database updates
├── 🗂️ DBSUPA
│   └── supabase-*.sql         # Supabase schemas & exports
└── 📚 DOCS
    └── *.xlsx                  # Templates & docs
```

## 🌟 Fitur Utama

### 🏠 **Dashboard**
- 📊 Real-time statistics & analytics
- 📈 Interactive charts dengan Chart.js
- 🎯 Quick access ke semua fitur
- 📱 Responsive design untuk mobile

### 📦 **Materials Management** 
- ✨ **Mobile-optimized interface** - Touch-friendly design
- ➕ CRUD operations (Create, Read, Update, Delete)
- 📤 Excel export dengan template
- 📥 Bulk upload via Excel
- 📋 Template download otomatis
- 🔍 Advanced search & filtering
- 🏷️ Dropdown management (Store Room, Unit, Machine Number)

### 📚 **Material Catalog**
- 🗂️ Grid & list view dengan Google Drive images
- 🏷️ Category & division filtering
- 📄 Detailed material information
- 🖼️ Image proxy untuk Google Drive

### 🔒 **Admin Panel** (Password Protected)
- 🛡️ **Secure Authentication** - Session-based dengan 1 jam expiry
- 📝 **SOP Editor** - Rich text editor untuk SOP & announcements
- ⚙️ **Master Admin** - Kelola dropdown & system configuration
  - Store Rooms management
  - Units of Measure management  
  - Machine Numbers by Division
  - Division management
- � Password: `TPS123`

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework dengan App Router & Turbopack
- **React 18** - UI library dengan modern hooks
- **TypeScript** - Type safety untuk API routes
- **Tailwind CSS** - Utility-first styling dengan responsive design
- **Chart.js** - Interactive data visualization
- **Lucide React** - Modern icon library
- **React Hook Form** - Efficient form handling

### Backend & Database
- **Next.js API Routes** - RESTful API endpoints
- **Supabase PostgreSQL** - Cloud database dengan real-time features
- **Node.js 18+** - JavaScript runtime

### Authentication & Security
- **Session Storage** - Client-side session management
- **Password Protection** - Master Admin access control
- **CORS & Security** - API security headers

### Development Tools
- **ESLint** - Code linting dengan Next.js config
- **Turbopack** - Ultra-fast bundler untuk development
- **PostCSS** - CSS processing dengan Tailwind

## 🔐 Security Features

### Admin Authentication
- 🔒 Password-protected Master Admin access
- ⏰ Session expires after 1 hour
- 🛡️ Route protection - direct URL access blocked
- 🔄 Automatic session cleanup

### API Security
- 🌐 CORS configuration
- 🛠️ Input validation
- 📝 Error handling & logging

## � Mobile Optimization

- 📱 **Responsive Design** - Mobile-first approach
- 👆 **Touch-friendly** - Optimized buttons & interactions
- 📊 **Adaptive Layouts** - Grid systems yang responsive
- 🎨 **Modern UI** - Clean design dengan smooth animations

## �📝 Available Scripts

```bash
npm run dev      # Development server dengan Turbopack
npm run build    # Build production
npm run start    # Start production server  
npm run lint     # Check code quality
```

## 🗃️ Database

### Supabase Integration
- **Materials Table** - Main materials database
- **Dropdown Tables** - Store rooms, units, machine numbers
- **Real-time Updates** - Live data synchronization

### Key Tables
```sql
materials          # Material data dengan Google Drive images
store_rooms        # Store room dropdown options  
units_of_measure   # Unit measurement options
machine_numbers    # Machine numbers by division
divisions          # Division categories
```

## 🎯 Usage Guide

### 1. Dashboard Home
- View real-time statistics
- Quick access buttons ke semua fitur
- Interactive charts untuk analytics

### 2. Material Management
- **Add Material**: Form dengan dropdown integration
- **Edit/Delete**: Inline editing dengan confirmation
- **Bulk Upload**: Excel template dengan validation
- **Export**: Download data dalam format Excel

### 3. Admin Panel
1. Akses `/admin`
2. Klik "Akses Master Admin"
3. Masukkan password: `TPS123`
4. Session valid untuk 1 jam

### 4. Master Admin Features
- **SOP Editor**: Rich text editing untuk announcements
- **Dropdown Management**: CRUD untuk store rooms, units, machines
- **System Configuration**: Database maintenance

## 🔧 Configuration

### Environment Variables (.env.local)
```env
# Supabase Database
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Supabase Setup
1. Create project di [Supabase](https://supabase.com)
2. Import schema dari `dbsupa/supabase-schema.sql`
3. Setup environment variables
4. Run development server

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Deploy ke Vercel
vercel --prod

# Set environment variables di Vercel dashboard
# Connect Supabase database
```

### Manual Deployment
```bash
npm run build
npm start
```

## 📚 API Documentation

### Materials API
- `GET /api/materials` - Get materials dengan pagination
- `POST /api/materials` - Create new material
- `PUT /api/materials/[id]` - Update material
- `DELETE /api/materials/[id]` - Delete material
- `POST /api/materials/upload` - Bulk upload Excel
- `GET /api/materials/export` - Export to Excel
- `GET /api/materials/template` - Download template

### Master Admin API
- `GET /api/master/dropdowns` - Get all dropdown data
- `POST /api/master/dropdowns` - Add dropdown item
- `DELETE /api/master/dropdowns` - Delete dropdown item

### SOP API
- `GET /api/sop` - Get SOP content
- `POST /api/sop` - Update SOP content

## 🤝 Development

### File Organization
- **Pages**: `src/app/[page]/page.js`
- **API**: `src/app/api/[endpoint]/route.ts`
- **Components**: `src/components/[Component].js`
- **Database**: `src/lib/db.ts`

### Code Style
- **ESLint** configuration untuk Next.js
- **Prettier** integration
- **TypeScript** untuk type safety
- **Tailwind** untuk consistent styling

### Contributing
1. Fork repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## 🐛 Troubleshooting

### Common Issues
1. **Database Connection**: Check Supabase credentials
2. **API Errors**: Verify environment variables
3. **Build Errors**: Clear `.next` folder dan restart
4. **Session Issues**: Clear browser storage

### Debug Mode
```bash
# Enable debug logging
DEBUG=true npm run dev
```

---

**🎯 Dashboard TPS Materials Management System**  
Build dengan ❤️ menggunakan **Next.js 15** + **Supabase** + **Tailwind CSS**

**🔗 Links:**
- [Live Demo](https://your-deployment-url.vercel.app)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Next.js Documentation](https://nextjs.org/docs)
