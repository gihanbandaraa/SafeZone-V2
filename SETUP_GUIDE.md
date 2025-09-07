# SafeZone Setup Guide for New PC

This guide will help you set up the complete SafeZone emergency response system on a new computer.

## Prerequisites

### Required Software
1. **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
2. **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
3. **Git** - [Download](https://git-scm.com/downloads)
4. **Expo CLI** - Install via npm: `npm install -g @expo/cli`

### Mobile Development (Optional)
- **Android Studio** (for Android development)
- **Xcode** (for iOS development - Mac only)

## Step 1: Database Setup

### Install PostgreSQL
1. Download and install PostgreSQL
2. During installation, remember the password for the `postgres` user
3. Ensure PostgreSQL service is running

### Create Database
```sql
-- Connect to PostgreSQL as postgres user
createdb safezone_core
```

### Restore Database (Option A - From Backup)
If you have a database backup file:
```bash
# Windows
restore-database.bat path/to/backup.sql

# Linux/Mac
chmod +x restore-database.sh
./restore-database.sh path/to/backup.sql
```

### Setup Fresh Database (Option B - From Scratch)
```bash
cd backend-core
npm install
node setup-complete-database.js
```

## Step 2: Project Setup

### Clone Repository
```bash
git clone <repository-url>
cd SafeZone-V2
```

### Backend Setup
```bash
cd backend-core
npm install

# Create .env file
cp .env.example .env
# Edit .env with your database credentials:
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=safezone_core
# DB_USER=postgres
# DB_PASSWORD=your_postgres_password
```

### Mobile App Setup
```bash
cd ../mobile-core
npm install
```

### Admin Web Setup
```bash
cd ../admin-web
npm install
```

## Step 3: Environment Configuration

### Backend .env Configuration
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=safezone_core
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# API Keys (if needed)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Mobile App Configuration
Update `mobile-core/src/config/api.js`:
```javascript
const API_BASE_URL = 'http://your-computer-ip:5000/api';
// For Android emulator: http://10.0.2.2:5000/api
// For iOS simulator: http://localhost:5000/api
// For physical device: http://YOUR_COMPUTER_IP:5000/api
```

## Step 4: Start the Applications

### Start Backend Server
```bash
cd backend-core
npm start
# Server should start on http://localhost:5000
```

### Start Mobile App
```bash
cd mobile-core
npm start
# Follow Expo instructions to open on device/emulator
```

### Start Admin Web (Optional)
```bash
cd admin-web
npm start
# Opens on http://localhost:3000
```

## Step 5: Test Accounts

The system comes with pre-configured test accounts:

### Admin Account
- **Email:** admin@safezone.com
- **Password:** admin123
- **Role:** Administrator

### Organization Accounts
- **Red Cross:** redcross@safezone.com / org123
- **Fire Rescue:** firerescue@safezone.com / org123

### Volunteer Accounts
- **Volunteer 1:** volunteer1@safezone.com / volunteer123
- **Volunteer 2:** volunteer2@safezone.com / volunteer123
- **Volunteer 3:** volunteer3@safezone.com / volunteer123
- **Volunteer 4:** volunteer4@safezone.com / volunteer123

### Victim Accounts
- **Victim 1:** victim1@safezone.com / victim123
- **Victim 2:** victim2@safezone.com / victim123
- **Victim 3:** victim3@safezone.com / victim123
- **Victim 4:** victim4@safezone.com / victim123

## Step 6: Testing Features

### Test Emergency Requests
The database includes sample emergency requests with:
- ✅ Real GPS coordinates for navigation testing
- ✅ Various disaster types (flood, earthquake, wildfire, etc.)
- ✅ Different urgency levels
- ✅ Multiple statuses (pending, assigned, in_progress, completed)

### Test Navigation
1. Login as volunteer
2. View available requests
3. Accept a request
4. Use navigation feature to get directions

### Test Communication
1. Login as victim with assigned request
2. Use "Contact Volunteer" feature
3. Test phone, SMS, and messaging options

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check .env database credentials
- Ensure database exists: `psql -U postgres -l`

### Mobile App Connection Issues
- Check backend server is running on correct port
- Update API_BASE_URL in mobile app config
- For physical device, use computer's IP address
- Check firewall settings

### Permission Issues
- Ensure location permissions are granted
- Check network permissions for API calls

### Port Conflicts
- Backend default: 5000
- Admin web default: 3000
- Expo default: 19000, 19001, 19002

## Advanced Setup

### Database Backup & Restore
```bash
# Create backup
cd backend-core
node export-database.js

# Restore backup (automatic scripts created)
./restore-database.sh backup_file.sql  # Linux/Mac
restore-database.bat backup_file.sql   # Windows
```

### Production Deployment
- Update environment variables for production
- Configure proper SSL certificates
- Set up domain names and DNS
- Configure production database

## Support

If you encounter issues:
1. Check that all prerequisites are installed
2. Verify environment variables are correct
3. Ensure all services are running
4. Check firewall and network settings
5. Review console logs for error messages

---

**SafeZone Emergency Response System**  
Complete setup for emergency request management, volunteer coordination, and organization oversight.