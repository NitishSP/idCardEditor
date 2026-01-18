@echo off
REM ============================================
REM ID Card System - Distribution Package Creator
REM ============================================
REM This script creates a ready-to-distribute
REM package for customers
REM ============================================

setlocal EnableDelayedExpansion

title ID Card System - Create Distribution Package

color 0B
cls

echo.
echo ========================================
echo   Distribution Package Creator
echo ========================================
echo.

REM Check if running in project root
if not exist "package.json" (
    echo ERROR: Please run this script from the project root directory
    echo        D:\Learning ElectronJS\Desk_App
    pause
    exit /b 1
)

echo [1/6] Checking prerequisites...

REM Check if npm is installed
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed or not in PATH
    pause
    exit /b 1
)

echo       npm found!

REM Check if node_modules exists
if not exist "node_modules" (
    echo       Installing dependencies...
    call npm install
)

echo.
echo [2/6] Building frontend...
cd Id_Card_Frontend
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Frontend build failed!
    cd ..
    pause
    exit /b 1
)
cd ..
echo       Frontend built successfully!

echo.
echo [3/6] Building Windows installer...
call npm run build:win:installer
if %errorlevel% neq 0 (
    echo ERROR: Installer build failed!
    pause
    exit /b 1
)
echo       Installer built successfully!

echo.
echo [4/6] Creating distribution folder...

REM Create distribution folder with timestamp
set "timestamp=%date:~-4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "timestamp=%timestamp: =0%"
set "distFolder=distribution\ID-Card-System-v1.0.0-%timestamp%"

if not exist "distribution" mkdir "distribution"
if exist "%distFolder%" rmdir /s /q "%distFolder%"
mkdir "%distFolder%"

echo       Created: %distFolder%

echo.
echo [5/6] Copying files...

REM Copy main installer
for %%F in (release\*Setup*.exe) do (
    copy "%%F" "%distFolder%\" >nul
    echo       Copied installer: %%~nxF
)

REM Copy uninstall scripts
copy "uninstall-customer.bat" "%distFolder%\" >nul
copy "uninstall-customer.ps1" "%distFolder%\" >nul
copy "CUSTOMER-UNINSTALL.md" "%distFolder%\" >nul
echo       Copied uninstall scripts

REM Create README.txt
(
echo ========================================
echo ID CARD SYSTEM v1.0.0
echo ========================================
echo.
echo Thank you for choosing ID Card System!
echo.
echo INSTALLATION:
echo 1. Double-click the Setup.exe file
echo 2. Follow the installation wizard
echo 3. Launch from Desktop or Start Menu
echo.
echo FIRST LOGIN:
echo Username: admin
echo Password: admin123
echo.
echo IMPORTANT: Change the admin password after first login!
echo.
echo UNINSTALLATION:
echo Method 1: Windows Settings ^> Apps ^> Uninstall
echo Method 2: Start Menu ^> ID Card System ^> Uninstall
echo Method 3: Run "uninstall-customer.bat" as Administrator
echo.
echo For detailed instructions, see CUSTOMER-UNINSTALL.md
echo.
echo SUPPORT:
echo Email: support@pixelveda.com
echo Website: www.yourwebsite.com
echo.
echo ========================================
) > "%distFolder%\README.txt"

echo       Created README.txt

REM Copy license if exists
if exist "LICENSE" (
    copy "LICENSE" "%distFolder%\LICENSE.txt" >nul
    echo       Copied LICENSE.txt
)

echo.
echo [6/6] Creating ZIP archive...

REM Create ZIP file using PowerShell
powershell -Command "Compress-Archive -Path '%distFolder%\*' -DestinationPath 'distribution\ID-Card-System-v1.0.0-%timestamp%.zip' -Force"

if %errorlevel% equ 0 (
    echo       ZIP created successfully!
) else (
    echo       Warning: Could not create ZIP file
)

REM Summary
echo.
echo ========================================
echo   Distribution Package Created!
echo ========================================
echo.
echo Package Location:
echo   %distFolder%
echo.
echo ZIP Archive:
echo   distribution\ID-Card-System-v1.0.0-%timestamp%.zip
echo.
echo Package Contents:
dir /b "%distFolder%"
echo.
echo ========================================
echo.

REM Open distribution folder
echo Opening distribution folder...
start "" "%distFolder%"

echo.
echo Package is ready to distribute to customers!
echo.
pause
