@echo off
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
