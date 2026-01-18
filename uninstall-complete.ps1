#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Complete Uninstall and Cleanup Script for ID Card System
.DESCRIPTION
    This script performs a complete removal of the ID Card System application
    including all user data, cache, temporary files, and installation files.
    
    What this script removes:
    - Application executable and files
    - User data (database, backups, logs)
    - Electron cache
    - Temporary print files
    - Application shortcuts
    - Registry entries (if any)
    
.EXAMPLE
    .\uninstall-complete.ps1
    
.EXAMPLE
    .\uninstall-complete.ps1 -Force
#>

param(
    [switch]$Force,
    [switch]$KeepDatabase
)

# Colors for output
$colors = @{
    Success = 'Green'
    Warning = 'Yellow'
    Error   = 'Red'
    Info    = 'Cyan'
    Header  = 'Magenta'
}

function Write-Header {
    param([string]$Text)
    Write-Host "`n========================================" -ForegroundColor $colors.Header
    Write-Host "  $Text" -ForegroundColor $colors.Header
    Write-Host "========================================`n" -ForegroundColor $colors.Header
}

function Write-Success {
    param([string]$Text)
    Write-Host "✓ $Text" -ForegroundColor $colors.Success
}

function Write-Info {
    param([string]$Text)
    Write-Host "ℹ $Text" -ForegroundColor $colors.Info
}

function Write-Warning {
    param([string]$Text)
    Write-Host "⚠ $Text" -ForegroundColor $colors.Warning
}

function Write-Error {
    param([string]$Text)
    Write-Host "✗ $Text" -ForegroundColor $colors.Error
}

function Remove-Directory {
    param(
        [string]$Path,
        [string]$Description
    )
    
    if (Test-Path $Path) {
        try {
            Remove-Item -Path $Path -Recurse -Force -ErrorAction Stop
            Write-Success "$Description removed: $Path"
            return $true
        } catch {
            Write-Error "Failed to remove $Description : $_"
            return $false
        }
    } else {
        Write-Info "$Description not found (already clean): $Path"
        return $true
    }
}

function Remove-File {
    param(
        [string]$Path,
        [string]$Description
    )
    
    if (Test-Path $Path) {
        try {
            Remove-Item -Path $Path -Force -ErrorAction Stop
            Write-Success "$Description removed: $Path"
            return $true
        } catch {
            Write-Error "Failed to remove $Description : $_"
            return $false
        }
    } else {
        Write-Info "$Description not found (already clean): $Path"
        return $true
    }
}

function Stop-Process {
    param([string]$ProcessName)
    
    $processes = Get-Process -Name $ProcessName -ErrorAction SilentlyContinue
    if ($processes) {
        Write-Warning "Stopping $ProcessName processes..."
        $processes | ForEach-Object {
            try {
                $_.Kill()
                $_.WaitForExit(5000)
                Write-Success "Process stopped: $($_.Name) (PID: $($_.Id))"
            } catch {
                Write-Error "Failed to stop process: $_"
            }
        }
        Start-Sleep -Seconds 2
    }
}

# Main execution
Write-Header "ID Card System - Complete Uninstall"

# Confirmation prompt
if (-not $Force) {
    Write-Warning "This will completely remove the ID Card System and ALL associated data!"
    Write-Host "`nThis includes:" -ForegroundColor Yellow
    Write-Host "  • Application files" -ForegroundColor Yellow
    Write-Host "  • Database (all users and templates)" -ForegroundColor Yellow
    Write-Host "  • Backups" -ForegroundColor Yellow
    Write-Host "  • Logs" -ForegroundColor Yellow
    Write-Host "  • Cache files" -ForegroundColor Yellow
    Write-Host "  • Temporary files" -ForegroundColor Yellow
    Write-Host "  • Desktop shortcuts`n" -ForegroundColor Yellow
    
    $confirmation = Read-Host "Are you sure you want to continue? (yes/no)"
    if ($confirmation -ne 'yes') {
        Write-Warning "Uninstall cancelled."
        exit 0
    }
}

Write-Host "`nStarting cleanup process...`n"

# Step 1: Stop running processes
Write-Header "Step 1: Stopping Application Processes"
Stop-Process -ProcessName "ID Card System"
Stop-Process -ProcessName "id-card-system"
Stop-Process -ProcessName "electron"

# Step 2: Remove application files
Write-Header "Step 2: Removing Application Files"

$possibleAppPaths = @(
    "$env:LOCALAPPDATA\Programs\id-card-system",
    "$env:LOCALAPPDATA\Programs\ID Card System",
    "$env:ProgramFiles\ID Card System",
    "$env:ProgramFiles(x86)\ID Card System",
    "D:\Learning ElectronJS\Desk_App\release\win-unpacked"
)

foreach ($appPath in $possibleAppPaths) {
    Remove-Directory -Path $appPath -Description "Application files"
}

# Step 3: Remove user data
Write-Header "Step 3: Removing User Data"

$userDataPath = "$env:APPDATA\id-card-system"

if ($KeepDatabase) {
    Write-Warning "Database preservation requested - keeping user data"
    
    # Remove only cache and logs, keep database and backups
    Remove-Directory -Path "$userDataPath\logs" -Description "Logs"
    Remove-Directory -Path "$userDataPath\Cache" -Description "Cache"
    Remove-Directory -Path "$userDataPath\GPUCache" -Description "GPU Cache"
} else {
    # Remove everything
    Remove-Directory -Path $userDataPath -Description "User data directory"
}

# Step 4: Remove Electron cache
Write-Header "Step 4: Removing Electron Cache"

$electronCachePaths = @(
    "$env:APPDATA\electron",
    "$env:APPDATA\electron-builder",
    "$env:LOCALAPPDATA\electron",
    "$env:LOCALAPPDATA\electron-builder",
    "D:\Learning ElectronJS\Desk_App\electron-cache"
)

foreach ($cachePath in $electronCachePaths) {
    Remove-Directory -Path $cachePath -Description "Electron cache"
}

# Step 5: Remove temporary files
Write-Header "Step 5: Removing Temporary Files"

$tempPath = [System.IO.Path]::GetTempPath()
$printTempFiles = Get-ChildItem -Path $tempPath -Filter "print-*.html" -ErrorAction SilentlyContinue

if ($printTempFiles) {
    Write-Info "Found $($printTempFiles.Count) temporary print files"
    foreach ($file in $printTempFiles) {
        Remove-File -Path $file.FullName -Description "Temp print file"
    }
} else {
    Write-Info "No temporary print files found"
}

# Step 6: Remove shortcuts
Write-Header "Step 6: Removing Shortcuts"

$shortcutLocations = @(
    "$env:USERPROFILE\Desktop\ID Card System.lnk",
    "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\ID Card System.lnk",
    "$env:ProgramData\Microsoft\Windows\Start Menu\Programs\ID Card System.lnk"
)

foreach ($shortcut in $shortcutLocations) {
    Remove-File -Path $shortcut -Description "Shortcut"
}

# Step 7: Clean build artifacts (development only)
Write-Header "Step 7: Cleaning Build Artifacts (Development)"

if (Test-Path "D:\Learning ElectronJS\Desk_App") {
    $devPaths = @(
        "D:\Learning ElectronJS\Desk_App\release",
        "D:\Learning ElectronJS\Desk_App\build\electron-cache",
        "D:\Learning ElectronJS\Desk_App\node_modules\.cache"
    )
    
    foreach ($devPath in $devPaths) {
        Remove-Directory -Path $devPath -Description "Build artifact"
    }
}

# Step 8: Clean Windows Registry (optional)
Write-Header "Step 8: Cleaning Registry Entries"

$registryPaths = @(
    "HKCU:\Software\id-card-system",
    "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\id-card-system"
)

foreach ($regPath in $registryPaths) {
    if (Test-Path $regPath) {
        try {
            Remove-Item -Path $regPath -Recurse -Force -ErrorAction Stop
            Write-Success "Registry entry removed: $regPath"
        } catch {
            Write-Warning "Could not remove registry entry: $regPath"
        }
    }
}

# Step 9: Empty Recycle Bin (optional)
Write-Header "Step 9: Final Cleanup"

Write-Info "Cleanup verification..."
Start-Sleep -Seconds 2

# Summary
Write-Header "Cleanup Summary"

$remainingItems = @()

# Check if any items remain
if (Test-Path "$env:APPDATA\id-card-system") {
    $remainingItems += "User data directory"
}

if ($remainingItems.Count -eq 0) {
    Write-Success "All application data has been successfully removed!"
    Write-Success "The system is completely clean."
} else {
    Write-Warning "Some items could not be removed:"
    $remainingItems | ForEach-Object { Write-Warning "  • $_" }
    Write-Host "`nPlease ensure:" -ForegroundColor Yellow
    Write-Host "  1. The application is completely closed" -ForegroundColor Yellow
    Write-Host "  2. No files are open in other programs" -ForegroundColor Yellow
    Write-Host "  3. You have administrator privileges`n" -ForegroundColor Yellow
}

Write-Host "`n========================================`n"
Write-Success "Uninstall process completed!"

if (-not $KeepDatabase) {
    Write-Info "To reinstall, the application will start with a fresh database."
} else {
    Write-Info "Database has been preserved for next installation."
}

Write-Host ""
