#!/bin/bash

# Database Environment Switcher for TPS Dashboard
# Usage: ./switch-db.sh [local|supabase]

if [ "$1" = "local" ]; then
    echo "🔄 Switching to LOCAL database..."
    cp .env.local.backup .env.local
    echo "✅ Switched to LOCAL PostgreSQL database"
    echo "🔗 Database: localhost:5432/tps_dashboard"
    
elif [ "$1" = "supabase" ]; then
    echo "🔄 Switching to SUPABASE database..."
    cat > .env.local << EOF
# Database Configuration - Supabase
DB_HOST=aws-1-ap-southeast-1.pooler.supabase.com
DB_PORT=6543
DB_NAME=postgres
DB_USER=postgres.dpjupmbrqvlufeegrrjf
DB_PASSWORD=tujubelasagustus

# Next.js Configuration
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
EOF
    echo "✅ Switched to SUPABASE database"
    echo "🔗 Database: Supabase (10,027 materials)"
    
else
    echo "📋 Database Environment Switcher"
    echo ""
    echo "Usage: ./switch-db.sh [local|supabase]"
    echo ""
    echo "Options:"
    echo "  local     - Switch to local PostgreSQL database"
    echo "  supabase  - Switch to Supabase cloud database"
    echo ""
    echo "Current database configuration:"
    if grep -q "supabase.com" .env.local 2>/dev/null; then
        echo "🌐 Currently using: SUPABASE"
    else
        echo "🏠 Currently using: LOCAL"
    fi
fi

echo ""
echo "💡 After switching, restart your development server:"
echo "   npm run dev"
