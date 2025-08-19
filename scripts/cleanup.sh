#!/bin/bash

# Script untuk membersihkan file duplikat dan versi lama
# Jalankan dengan: bash scripts/cleanup.sh

echo "🧹 Membersihkan file duplikat dan versi lama..."

# Backup file lama ke folder archive
mkdir -p archive/old-versions

echo "📦 Membackup file versi lama..."

# Backup page versions
if [ -f "src/app/page-old.js" ]; then
    mv src/app/page-old.js archive/old-versions/
    echo "✅ page-old.js dipindah ke archive"
fi

if [ -f "src/app/page-new.js" ]; then
    mv src/app/page-new.js archive/old-versions/
    echo "✅ page-new.js dipindah ke archive"
fi

# Backup API route versions
if [ -f "src/app/api/materials/route-old.ts" ]; then
    mv src/app/api/materials/route-old.ts archive/old-versions/
    echo "✅ route-old.ts dipindah ke archive"
fi

if [ -f "src/app/api/materials/route-new.ts" ]; then
    mv src/app/api/materials/route-new.ts archive/old-versions/
    echo "✅ route-new.ts dipindah ke archive"
fi

if [ -f "src/app/api/materials/route-backup.ts" ]; then
    mv src/app/api/materials/route-backup.ts archive/old-versions/
    echo "✅ route-backup.ts dipindah ke archive"
fi

if [ -f "src/app/api/materials/export-new.ts" ]; then
    mv src/app/api/materials/export-new.ts archive/old-versions/
    echo "✅ export-new.ts dipindah ke archive"
fi

echo "🎉 Cleanup selesai! File lama sudah dipindah ke archive/old-versions/"
echo "💡 Tips: Jika semua berjalan lancar, Anda bisa menghapus folder archive/"
