@echo off

echo 🚀 Setting up SafeZone Core Application...

REM Backend setup
echo 🔧 Setting up backend...
cd backend-core
call npm install
copy .env.example .env
echo ✅ Backend setup complete

REM Mobile setup
echo 📱 Setting up mobile app...
cd ..\mobile-core
call npm install
echo ✅ Mobile app setup complete

REM Admin web setup
echo 🌐 Setting up admin web...
cd ..\admin-web
call npm install
echo ✅ Admin web setup complete

cd ..

echo.
echo 🎉 SafeZone Core setup complete!
echo.
echo 📝 Next steps:
echo 1. Update backend-core\.env with your database credentials
echo 2. Run 'npm run dev' in backend-core directory
echo 3. Run 'npm start' in mobile-core directory
echo 4. Run 'npm start' in admin-web directory
echo.