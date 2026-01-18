@echo off
REM ============================================
REM ID Card System - Customer Uninstaller
REM ============================================
REM This script safely uninstalls the application
REM and optionally removes all user data.
REM ============================================

setlocal EnableDelayedExpansion

title ID Card System - Uninstaller

color 0F
cls

echo.
echo ========================================
echo   ID Card System - Uninstaller
echo ========================================
echo.

REM Check for admin rights
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [WARNING] This script requires Administrator privileges.
    echo Please right-click and select "Run as Administrator"
    echo.
    pause
    exit /b 1
)

REM Step 1: Stop the application
echo [1/5] Stopping application...
taskkill /F /IM "ID Card System.exe" >nul 2>&1
taskkill /F /IM "id-card-system.exe" >nul 2>&1
timeout /t 2 /nobreak >nul
echo       Done!

REM Step 2: Ask about data removal
echo.
echo [2/5] Data Removal Options
echo.
echo What would you like to do with your data?
echo.
echo   1. Keep all data (database, backups, templates)
echo   2. Remove everything (fresh install next time)
echo.
set /p choice="Enter your choice (1 or 2): "

if "%choice%"=="2" (
    set REMOVE_DATA=1
    echo.
    echo [WARNING] This will permanently delete:
    echo   - All user accounts
    echo   - All templates and designs
    echo   - All backups
    echo   - All logs
    echo.
    set /p confirm="Are you SURE? Type YES to confirm: "
    if /i not "!confirm!"=="YES" (
        echo.
        echo Uninstall cancelled.
        pause
        exit /b 0
    )
) else (
    set REMOVE_DATA=0
)

REM Step 3: Uninstall application
echo.
echo [3/5] Uninstalling application...

REM Check common installation paths
set "APP_INSTALLED=0"

if exist "%LOCALAPPDATA%\Programs\id-card-system" (
    rmdir /s /q "%LOCALAPPDATA%\Programs\id-card-system" >nul 2>&1
    if !errorlevel! equ 0 (
        echo       Application removed from Local AppData
        set "APP_INSTALLED=1"
    )
)

if exist "%ProgramFiles%\ID Card System" (
    rmdir /s /q "%ProgramFiles%\ID Card System" >nul 2>&1
    if !errorlevel! equ 0 (
        echo       Application removed from Program Files
        set "APP_INSTALLED=1"
    )
)

if exist "%ProgramFiles(x86)%\ID Card System" (
    rmdir /s /q "%ProgramFiles(x86)%\ID Card System" >nul 2>&1
    if !errorlevel! equ 0 (
        echo       Application removed from Program Files (x86)
        set "APP_INSTALLED=1"
    )
)

REM Check for uninstaller in registry and run it
reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\Uninstall\{com.idcard.system}" >nul 2>&1
if !errorlevel! equ 0 (
    for /f "tokens=2*" %%a in ('reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\Uninstall\{com.idcard.system}" /v UninstallString 2^>nul ^| find "UninstallString"') do (
        if exist "%%b" (
            echo       Running official uninstaller...
            start /wait "" "%%b" /S
            set "APP_INSTALLED=1"
        )
    )
)

if !APP_INSTALLED! equ 1 (
    echo       Done!
) else (
    echo       Application not found (may already be uninstalled)
)

REM Step 4: Remove user data (if requested)
echo.
if !REMOVE_DATA! equ 1 (
    echo [4/5] Removing user data...
    
    if exist "%APPDATA%\id-card-system" (
        rmdir /s /q "%APPDATA%\id-card-system" >nul 2>&1
        if !errorlevel! equ 0 (
            echo       User data removed
        ) else (
            echo       [WARNING] Could not remove some files
        )
    ) else (
        echo       No user data found
    )
) else (
    echo [4/5] Keeping user data...
    echo       Your data is preserved at:
    echo       %APPDATA%\id-card-system
)

REM Step 5: Clean shortcuts and cache
echo.
echo [5/5] Cleaning shortcuts and cache...

REM Remove desktop shortcut
if exist "%USERPROFILE%\Desktop\ID Card System.lnk" (
    del /f /q "%USERPROFILE%\Desktop\ID Card System.lnk" >nul 2>&1
    echo       Desktop shortcut removed
)

REM Remove start menu shortcut
if exist "%APPDATA%\Microsoft\Windows\Start Menu\Programs\ID Card System.lnk" (
    del /f /q "%APPDATA%\Microsoft\Windows\Start Menu\Programs\ID Card System.lnk" >nul 2>&1
    echo       Start menu shortcut removed
)

REM Clean temp print files
del /f /q "%TEMP%\print-*.html" >nul 2>&1

REM Clean cache (only if removing all data)
if !REMOVE_DATA! equ 1 (
    if exist "%APPDATA%\electron" (
        rmdir /s /q "%APPDATA%\electron" >nul 2>&1
    )
    if exist "%LOCALAPPDATA%\electron" (
        rmdir /s /q "%LOCALAPPDATA%\electron" >nul 2>&1
    )
    echo       Cache cleaned
)

echo       Done!

REM Summary
echo.
echo ========================================
echo   Uninstall Complete!
echo ========================================
echo.

if !REMOVE_DATA! equ 1 (
    echo The application and all data have been removed.
    echo Your system is now clean.
) else (
    echo The application has been removed.
    echo Your data has been preserved for future use.
    echo.
    echo Data location: %APPDATA%\id-card-system
    echo.
    echo To manually remove data later, delete this folder.
)

echo.
echo Thank you for using ID Card System!
echo.
pause
