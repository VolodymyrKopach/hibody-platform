#!/bin/bash

# =============================================
# Auto-export database structure
# Run: bash scripts/export-db-structure.sh
# =============================================

echo "📊 Exporting database structure..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Install: npm i -g supabase"
    exit 1
fi

# Export as JSON
echo "1️⃣ Exporting to JSON..."
supabase db execute --file scripts/collect-db-info-json.sql > db-structure.json
echo "✅ Saved to: db-structure.json"

# Export as text
echo "2️⃣ Exporting to text..."
supabase db execute --file scripts/collect-db-info.sql > db-structure.txt
echo "✅ Saved to: db-structure.txt"

# Generate schema diagram (if pg_dump available)
if command -v pg_dump &> /dev/null; then
    echo "3️⃣ Generating schema dump..."
    supabase db dump --schema public > db-schema.sql
    echo "✅ Saved to: db-schema.sql"
fi

echo ""
echo "🎉 Done! You can now share these files:"
echo "   - db-structure.json (for AI/code)"
echo "   - db-structure.txt (for reading)"
echo "   - db-schema.sql (full schema)"

