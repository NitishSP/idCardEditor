# ID Card System

Professional ID Card Design and Management System built with Electron and React.

## Features

- 🎨 **Visual Template Editor** - Drag-and-drop interface for designing ID cards
- 🖼️ **Rich Elements** - Add text, images, QR codes, and shapes to your designs
- 💾 **Template Management** - Save and reuse templates
- 👥 **User Management** - Manage employee data and print ID cards
- 🔐 **Secure Authentication** - Password-protected access with bcrypt encryption
- 📦 **Backup & Restore** - Encrypted database backups
- 🖨️ **Print Ready** - Generate print-ready ID cards

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Desk_App
```

2. Install dependencies:
```bash
npm install
cd Id_Card_Frontend
npm install
cd ..
```

3. Set up environment variables:
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
# For production, set ENABLE_DEV_CREDENTIALS=false
```

## Development

### Running the App

1. Start the frontend development server:
```bash
cd Id_Card_Frontend
npm run dev
```

2. In a new terminal, start the Electron app:
```bash
npm run watch
```

### Building the Frontend

Before building the Electron app, build the frontend:
```bash
cd Id_Card_Frontend
npm run build
cd ..
```

## Production Build

1. Build the frontend:
```bash
cd Id_Card_Frontend
npm run build
cd ..
```

2. Build the Electron app:
```bash
npm run build
```

The compiled app will be in the `release` directory.

## Default Credentials

⚠️ **SECURITY WARNING:** Default credentials are DISABLED in production by default.

### For Development/Testing Only

Set `ENABLE_DEV_CREDENTIALS=true` in your `.env` file to enable these test accounts:

- **Username:** pixelVedaAdmin / **Password:** PixelVeda@2026
- **Username:** pixelVedaTesting / **Password:** PixelVeda@testing
- **Username:** pixelVedaLogin / **Password:** PixelVeda@Login

### Production Deployment

🔒 **For production:**
1. Set `ENABLE_DEV_CREDENTIALS=false` in `.env`
2. Create your first admin account manually using the Developer Panel
3. Never use default credentials in production
4. Use strong, unique passwords for all accounts

⚠️ **CRITICAL:** Never commit `.env` files to version control!

### Note
All accounts are stored in the database and work in both development and production builds.

## Configuration

Edit `.env` file to configure:
- `NODE_ENV` - Environment (development/production)
- `LOG_LEVEL` - Logging level (error/warn/info/debug)
- `ENABLE_DEV_CREDENTIALS` - Enable fallback credentials (true/false)

See `.env.example` for all available options.

## Project Structure

```
Desk_App/
├── main.js                 # Electron main process
├── preload.js             # Preload script (IPC bridge)
├── Database.js            # SQLite database management
├── BackupManager.js       # Backup/restore functionality
├── config.js              # Application configuration
├── PasswordService.js     # Password hashing service
├── ValidationService.js   # Input validation
├── RateLimiter.js        # Rate limiting for security
├── Id_Card_Frontend/     # React frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── hooks/        # Custom React hooks
│   │   └── store/        # Zustand state management
│   └── dist/            # Built frontend (generated)
└── release/             # Built Electron app (generated)
```

## Security Features

- ✅ Context Isolation enabled
- ✅ Node Integration disabled
- ✅ Sandbox mode enabled
- ✅ Content Security Policy (CSP)
- ✅ Password hashing with bcrypt
- ✅ Rate limiting on API calls
- ✅ Input validation on all inputs
- ✅ Encrypted database backups (AES-256-GCM)

## Database

The app uses SQLite for data storage. Database file is located in:
- **Windows:** `%APPDATA%/id-card-system/idcard.db`
- **macOS:** `~/Library/Application Support/id-card-system/idcard.db`
- **Linux:** `~/.config/id-card-system/idcard.db`

### Backup Location

Backups are stored in:
- **Windows:** `%APPDATA%/id-card-system/Backups/`
- **macOS:** `~/Library/Application Support/id-card-system/Backups/`
- **Linux:** `~/.config/id-card-system/Backups/`

## Troubleshooting

### App won't start
1. Ensure all dependencies are installed
2. Check that the frontend is built (`Id_Card_Frontend/dist` exists)
3. Check logs in `%APPDATA%/id-card-system/logs/`

### Database errors
1. Close all instances of the app
2. Check if database file is corrupted
3. Restore from a backup if needed

### Build errors
1. Delete `node_modules` and reinstall
2. Delete `release` folder and rebuild
3. Ensure you built the frontend first

## 📦 Production Deployment

### For Developers - Creating Distribution Package

Create a complete distribution package for customers with one command:

```powershell
npm run create:distribution
```

This creates a ready-to-distribute package with:
- Windows installer
- Uninstall scripts for customers
- README and documentation
- ZIP archive

**See [PRODUCTION-GUIDE.md](PRODUCTION-GUIDE.md) for complete distribution guide**

### For End Users - Installation & Uninstallation

**Installation:**
1. Double-click `ID Card System Setup.exe`
2. Follow the installation wizard
3. Login with default credentials: `admin` / `admin123`

**Uninstallation:**
- Method 1: Windows Settings → Apps → Uninstall
- Method 2: Start Menu → ID Card System → Uninstall
- Method 3: Run `uninstall-customer.bat` as Administrator

**See [CUSTOMER-UNINSTALL.md](CUSTOMER-UNINSTALL.md) for customer uninstall guide**

## 🗑️ Developer Cleanup

For development environment cleanup (not for customers):

```powershell
# Complete cleanup including dev files
.\uninstall-complete.ps1

# Keep database
.\uninstall-complete.ps1 -KeepDatabase
```

**See [UNINSTALL-GUIDE.md](UNINSTALL-GUIDE.md) for developer cleanup guide**

## 📚 Documentation

| Document | Purpose | Audience |
|----------|---------|----------|
| [README.md](README.md) | Main documentation | Developers |
| [PRODUCTION-GUIDE.md](PRODUCTION-GUIDE.md) | Deployment & distribution | Developers |
| [DISTRIBUTION.md](DISTRIBUTION.md) | Packaging guide | Developers |
| [CUSTOMER-UNINSTALL.md](CUSTOMER-UNINSTALL.md) | Uninstall instructions | End Users |
| [UNINSTALL-GUIDE.md](UNINSTALL-GUIDE.md) | Dev environment cleanup | Developers |

