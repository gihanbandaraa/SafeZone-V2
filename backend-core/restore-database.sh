#!/bin/bash
# SafeZone Database Restore Script
# Usage: ./restore-database.sh backup_file.sql

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <backup_file.sql>"
    exit 1
fi

BACKUP_FILE=$1

echo "🔄 Restoring SafeZone database from $BACKUP_FILE..."

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL service."
    exit 1
fi

# Restore database
echo "📥 Restoring database..."
psql -U postgres < "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Database restored successfully!"
    echo ""
    echo "🚀 Next steps:"
    echo "  1. Update .env file with your database credentials"
    echo "  2. Run 'npm install' in backend-core, mobile-core, and admin-web folders"
    echo "  3. Start the backend: npm start"
    echo "  4. Start the mobile app: npm start"
else
    echo "❌ Database restore failed!"
fi
