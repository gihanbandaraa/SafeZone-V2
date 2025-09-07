const { exec } = require('child_process');
const path = require('path');
require('dotenv').config();

// Database connection details from .env
const DB_NAME = process.env.DB_NAME || 'safezone_core';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'password';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || '5432';

function exportDatabase() {
  console.log('📦 Exporting SafeZone database...');
  
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
  const backupFileName = `safezone_backup_${timestamp}.sql`;
  const backupPath = path.join(__dirname, 'backups', backupFileName);
  
  // Create backups directory if it doesn't exist
  const fs = require('fs');
  const backupsDir = path.join(__dirname, 'backups');
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }
  
  // Set PGPASSWORD environment variable
  const env = { ...process.env, PGPASSWORD: DB_PASSWORD };
  
  // pg_dump command
  const command = `pg_dump -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} --no-password --verbose --clean --if-exists --create > "${backupPath}"`;
  
  exec(command, { env }, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Export failed:', error.message);
      return;
    }
    
    if (stderr) {
      console.log('ℹ️  Export output:', stderr);
    }
    
    console.log('✅ Database exported successfully!');
    console.log(`📁 Backup saved to: ${backupPath}`);
    console.log('');
    console.log('📋 To restore on another PC:');
    console.log('  1. Install PostgreSQL');
    console.log('  2. Copy the backup file');
    console.log('  3. Run: psql -U postgres < path/to/backup.sql');
    console.log('  4. Update .env file with database credentials');
    console.log('  5. Run: npm install in all project folders');
    console.log('');
  });
}

// Also create a simple restore script
function createRestoreScript() {
  const restoreScript = `#!/bin/bash
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
`;

  const fs = require('fs');
  const scriptPath = path.join(__dirname, 'restore-database.sh');
  fs.writeFileSync(scriptPath, restoreScript);
  console.log('📄 Restore script created: restore-database.sh');
}

function createWindowsRestoreScript() {
  const restoreScript = `@echo off
REM SafeZone Database Restore Script for Windows
REM Usage: restore-database.bat backup_file.sql

if "%~1"=="" (
    echo Usage: %0 ^<backup_file.sql^>
    exit /b 1
)

set BACKUP_FILE=%1

echo 🔄 Restoring SafeZone database from %BACKUP_FILE%...

REM Check if PostgreSQL is accessible
pg_isready -q
if errorlevel 1 (
    echo ❌ PostgreSQL is not running. Please start PostgreSQL service.
    exit /b 1
)

REM Restore database
echo 📥 Restoring database...
psql -U postgres < "%BACKUP_FILE%"

if %errorlevel%==0 (
    echo ✅ Database restored successfully!
    echo.
    echo 🚀 Next steps:
    echo   1. Update .env file with your database credentials
    echo   2. Run 'npm install' in backend-core, mobile-core, and admin-web folders
    echo   3. Start the backend: npm start
    echo   4. Start the mobile app: npm start
) else (
    echo ❌ Database restore failed!
)

pause
`;

  const fs = require('fs');
  const scriptPath = path.join(__dirname, 'restore-database.bat');
  fs.writeFileSync(scriptPath, restoreScript);
  console.log('📄 Windows restore script created: restore-database.bat');
}

console.log('🛠️  SafeZone Database Export Tool');
console.log('');

// Create restore scripts
createRestoreScript();
createWindowsRestoreScript();

// Export database
exportDatabase();