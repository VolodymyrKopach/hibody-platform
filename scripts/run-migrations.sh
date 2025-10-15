#!/bin/bash

# Script to run database migrations by category
# Usage: ./scripts/run-migrations.sh [category]
# Example: ./scripts/run-migrations.sh 05_admin_panel

set -e  # Exit on error

MIGRATIONS_DIR="supabase/migrations"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo -e "${RED}❌ DATABASE_URL not set${NC}"
  echo "Set it with: export DATABASE_URL='your-connection-string'"
  exit 1
fi

# Function to run SQL file
run_sql_file() {
  local file=$1
  echo -e "${BLUE}  📄 Running: $(basename $file)${NC}"
  psql "$DATABASE_URL" -f "$file" -v ON_ERROR_STOP=1
  echo -e "${GREEN}  ✅ Success${NC}"
}

# Function to run all files in a directory
run_category() {
  local category=$1
  local category_path="$MIGRATIONS_DIR/$category"
  
  if [ ! -d "$category_path" ]; then
    echo -e "${RED}❌ Category not found: $category${NC}"
    exit 1
  fi
  
  echo -e "${YELLOW}🚀 Running migrations for: $category${NC}\n"
  
  local count=0
  for file in "$category_path"/*.sql; do
    if [ -f "$file" ]; then
      run_sql_file "$file"
      ((count++))
    fi
  done
  
  echo -e "\n${GREEN}✅ Completed $count migration(s) for $category${NC}\n"
}

# Function to run all migrations
run_all() {
  echo -e "${YELLOW}🚀 Running ALL migrations in order...${NC}\n"
  
  local categories=(
    "01_initial_setup"
    "02_storage"
    "03_payments"
    "04_generation_limits"
    "05_admin_panel"
    "06_token_tracking"
    "07_features"
    "08_rls_fixes"
  )
  
  for category in "${categories[@]}"; do
    if [ -d "$MIGRATIONS_DIR/$category" ]; then
      run_category "$category"
    fi
  done
  
  echo -e "${GREEN}✅ All migrations completed!${NC}"
}

# Function to list available categories
list_categories() {
  echo -e "${BLUE}📋 Available migration categories:${NC}\n"
  for dir in "$MIGRATIONS_DIR"/*/; do
    if [ -d "$dir" ]; then
      category=$(basename "$dir")
      file_count=$(find "$dir" -name "*.sql" | wc -l)
      echo -e "  ${GREEN}$category${NC} ($file_count files)"
    fi
  done
  echo ""
}

# Main script logic
if [ $# -eq 0 ]; then
  echo -e "${YELLOW}Usage:${NC}"
  echo "  $0 all              - Run all migrations in order"
  echo "  $0 list             - List available categories"
  echo "  $0 [category]       - Run specific category"
  echo ""
  list_categories
  exit 0
fi

case "$1" in
  all)
    run_all
    ;;
  list)
    list_categories
    ;;
  *)
    run_category "$1"
    ;;
esac

