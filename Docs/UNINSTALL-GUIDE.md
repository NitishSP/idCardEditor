# Complete Uninstall and Cleanup Guide

## 🗑️ ID Card System - Complete Removal Guide

This guide provides comprehensive instructions for completely uninstalling the ID Card System application and cleaning all associated data.

---

## 📋 Table of Contents

1. [Quick Uninstall (Automated)](#quick-uninstall-automated)
2. [Manual Uninstall](#manual-uninstall)
3. [What Gets Removed](#what-gets-removed)
4. [Preserve Database Option](#preserve-database-option)
5. [Troubleshooting](#troubleshooting)
---
## 🚀 Quick Uninstall (Automated)

### Using PowerShell Script (Recommended)

1. **Close the application** completely (check system tray)

2. **Open PowerShell as Administrator**:
   - Press `Win + X`
   - Select "Windows PowerShell (Admin)" or "Terminal (Admin)"

3. **Navigate to the project directory**:
   ```powershell
   cd "D:\Learning ElectronJS\Desk_App"
   ```

4. **Run the uninstall script**:
   ```powershell
   .\uninstall-complete.ps1
   ```

5. **Confirm when prompted** by typing `yes`

### Using Node.js Script

```powershell
# Clean only user data (keeps app installed)
node cleanup-userdata.js

# Force cleanup without confirmation
node cleanup-userdata.js --force
```

---

## 🔧 Manual Uninstall

If you prefer to uninstall manually or if the automated script fails, follow these steps:

### Step 1: Stop the Application

1. Close all ID Card System windows
2. Check system tray and right-click to exit if running
3. Open Task Manager (`Ctrl + Shift + Esc`)
4. Look for "ID Card System" or "electron.exe"
5. Select and click "End Task"

### Step 2: Uninstall the Application

#### For Installed Version:

1. Open **Settings** → **Apps** → **Apps & features**
2. Search for "ID Card System"
3. Click **Uninstall**

#### For Portable Version:

1. Delete the application folder:
   ```
   D:\Learning ElectronJS\Desk_App\release\win-unpacked
   ```

### Step 3: Remove User Data

Delete the user data folder:

```powershell
# Windows
Remove-Item -Path "$env:APPDATA\id-card-system" -Recurse -Force
```

**Locations:**
- **Windows**: `%APPDATA%\id-card-system`
- **macOS**: `~/Library/Application Support/id-card-system`
- **Linux**: `~/.config/id-card-system`

This folder contains:
- `idcard.db` - Main database
- `Backups\` - Database backups
- `logs\` - Application logs
- Cache files

### Step 4: Remove Electron Cache

```powershell
# Remove Electron cache
Remove-Item -Path "$env:APPDATA\electron" -Recurse -Force
Remove-Item -Path "$env:LOCALAPPDATA\electron" -Recurse -Force
Remove-Item -Path "$env:APPDATA\electron-builder" -Recurse -Force

# Remove project electron cache
Remove-Item -Path "D:\Learning ElectronJS\Desk_App\electron-cache" -Recurse -Force
```

### Step 5: Clean Temporary Files

```powershell
# Navigate to temp folder
cd $env:TEMP

# Remove print temporary files
Remove-Item -Path "print-*.html" -Force
```

### Step 6: Remove Shortcuts

Delete shortcuts from:

1. **Desktop**: `%USERPROFILE%\Desktop\ID Card System.lnk`
2. **Start Menu**: `%APPDATA%\Microsoft\Windows\Start Menu\Programs\ID Card System.lnk`

### Step 7: Clean Build Artifacts (Development Only)

If you're a developer, clean build artifacts:

```powershell
cd "D:\Learning ElectronJS\Desk_App"

# Remove build output
Remove-Item -Path "release" -Recurse -Force

# Remove node_modules cache
Remove-Item -Path "node_modules\.cache" -Recurse -Force

# Optional: Remove all node_modules
Remove-Item -Path "node_modules" -Recurse -Force
Remove-Item -Path "Id_Card_Frontend\node_modules" -Recurse -Force
```

### Step 8: Clean Registry (Optional)

Open Registry Editor (`Win + R` → type `regedit`):

1. Navigate to: `HKEY_CURRENT_USER\Software\id-card-system`
2. Right-click and delete

---

## 📦 What Gets Removed

### Application Files
- ✅ Main application executable
- ✅ Application resources
- ✅ DLL files and dependencies

### User Data
- ✅ **Database** (`idcard.db`) - All users, templates, and fields
- ✅ **Backups** - All database backups
- ✅ **Logs** - Application logs
- ✅ **Settings** - User preferences

### Cache & Temporary Files
- ✅ Electron cache
- ✅ GPU cache
- ✅ Temporary print HTML files
- ✅ Build cache (development)

### System Integration
- ✅ Desktop shortcuts
- ✅ Start menu shortcuts
- ✅ Registry entries

---

## 💾 Preserve Database Option

If you want to keep your database and backups but clean everything else:

### Using PowerShell Script:
```powershell
.\uninstall-complete.ps1 -KeepDatabase
```

### Manual Backup Before Cleanup:
```powershell
# Create backup
Copy-Item -Path "$env:APPDATA\id-card-system\idcard.db" -Destination "$env:USERPROFILE\Desktop\idcard-backup.db"
Copy-Item -Path "$env:APPDATA\id-card-system\Backups" -Destination "$env:USERPROFILE\Desktop\Backups-backup" -Recurse

# After reinstall, restore
Copy-Item -Path "$env:USERPROFILE\Desktop\idcard-backup.db" -Destination "$env:APPDATA\id-card-system\idcard.db"
```

---

## 🔍 Verification

After uninstall, verify everything is removed:

```powershell
# Check if user data exists
Test-Path "$env:APPDATA\id-card-system"

# Check if electron cache exists
Test-Path "$env:APPDATA\electron"

# Check temp files
Get-ChildItem $env:TEMP -Filter "print-*.html"
```

All commands should return `False` or empty results.

---

## ⚠️ Troubleshooting

### "Access Denied" Error

**Solution**: Run PowerShell as Administrator

```powershell
# Right-click PowerShell → Run as Administrator
```

### Files Are Locked

**Solution**: Ensure the application is completely closed

```powershell
# Force kill all Electron processes
Get-Process | Where-Object {$_.Name -like "*electron*"} | Stop-Process -Force
Get-Process | Where-Object {$_.Name -like "*id-card*"} | Stop-Process -Force
```

### Some Files Won't Delete

**Solution**: Use safe mode or a file unlocker

1. Reboot in Safe Mode
2. Run the cleanup script again

Or use Windows built-in tool:
```powershell
# Schedule deletion on next reboot
Remove-Item -Path "$env:APPDATA\id-card-system" -Recurse -Force -ErrorAction SilentlyContinue
```

### Registry Entries Remain

**Solution**: Manually remove via Registry Editor

```
HKEY_CURRENT_USER\Software\id-card-system
HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Uninstall\id-card-system
```

---

## 🔄 Reinstallation

After complete cleanup, to reinstall:

1. **Download** the latest installer
2. **Run** the installer
3. The application will create fresh database with default users:
   - Username: `admin` / Password: `admin123`
   - Username: `pixelveda` / Password: `PixelVeda@2026`

---

## 📞 Support

If you encounter issues during uninstall:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review application logs (before deletion)
3. Contact support with error details

---

## 🔐 Security Note

**Important**: Uninstalling will permanently delete:
- All user accounts and passwords
- All templates and designs
- All field configurations
- All backups

Make sure to backup important data before uninstalling!

---

## 📝 Summary Commands

**Complete Clean (No Backup):**
```powershell
.\uninstall-complete.ps1
```

**Keep Database:**
```powershell
.\uninstall-complete.ps1 -KeepDatabase
```

**Force Clean (No Prompts):**
```powershell
.\uninstall-complete.ps1 -Force
```

**Manual Clean:**
```powershell
# Stop processes
Stop-Process -Name "electron" -Force -ErrorAction SilentlyContinue

# Remove user data
Remove-Item -Path "$env:APPDATA\id-card-system" -Recurse -Force

# Remove cache
Remove-Item -Path "$env:APPDATA\electron" -Recurse -Force
Remove-Item -Path "$env:LOCALAPPDATA\electron" -Recurse -Force

# Clean temp
Remove-Item -Path "$env:TEMP\print-*.html" -Force
```

---

**Last Updated**: January 3, 2026  
**Version**: 1.0.0
