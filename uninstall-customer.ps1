#!/usr/bin/env pwsh
<#
.SYNOPSIS
    ID Card System - Customer Uninstaller
    
.DESCRIPTION
    This script safely uninstalls the ID Card System application for end-users.
    It provides options to keep or remove user data.
    
.EXAMPLE
    .\uninstall-customer.ps1
    
.EXAMPLE
    .\uninstall-customer.ps1 -RemoveAllData
    
.EXAMPLE
    .\uninstall-customer.ps1 -Silent
#>

param(
    [switch]$RemoveAllData,
    [switch]$Silent
)

# Require Administrator
#Requires -RunAsAdministrator

$ErrorActionPreference = "SilentlyContinue"

# Colors
function Write-Step {
    param([string]$Text, [int]$Step, [int]$Total)
    Write-Host "`n[$Step/$Total] $Text" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Text)
    Write-Host "      $Text" -ForegroundColor Green
}

function Write-Info {
    param([string]$Text)
    Write-Host "      $Text" -ForegroundColor Gray
}

function Write-Warn {
    param([string]$Text)
    Write-Host "      [WARNING] $Text" -ForegroundColor Yellow
}

# Banner
Clear-Host
Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "  ID Card System - Uninstaller" -ForegroundColor Magenta
Write-Host "========================================`n" -ForegroundColor Magenta

# Step 1: Stop application
Write-Step -Text "Stopping application..." -Step 1 -Total 5

$processes = Get-Process | Where-Object { 
    $_.ProcessName -like "*id-card*" -or 
    $_.ProcessName -like "*ID Card System*" 
}

if ($processes) {
    $processes | ForEach-Object {
        Stop-Process -Id $_.Id -Force
        Write-Success "Stopped: $($_.ProcessName)"
    }
    Start-Sleep -Seconds 2
} else {
    Write-Info "Application not running"
}

# Step 2: Ask about data
if (-not $Silent -and -not $RemoveAllData) {
    Write-Host "`n========================================" -ForegroundColor Yellow
    Write-Host " Data Removal Options" -ForegroundColor Yellow
    Write-Host "========================================`n" -ForegroundColor Yellow
    
    Write-Host "What would you like to do with your data?`n"
    Write-Host "  1. Keep all data (database, backups, templates)"
    Write-Host "  2. Remove everything (fresh install next time)`n"
    
    $choice = Read-Host "Enter your choice (1 or 2)"
    
    if ($choice -eq "2") {
        Write-Host "`n[WARNING] This will permanently delete:" -ForegroundColor Red
        Write-Host "  - All user accounts" -ForegroundColor Red
        Write-Host "  - All templates and designs" -ForegroundColor Red
        Write-Host "  - All backups" -ForegroundColor Red
        Write-Host "  - All logs`n" -ForegroundColor Red
        
        $confirm = Read-Host "Are you SURE? Type YES to confirm"
        
        if ($confirm -eq "YES") {
            $RemoveAllData = $true
        } else {
            Write-Host "`nUninstall cancelled." -ForegroundColor Yellow
            Start-Sleep -Seconds 2
            exit 0
        }
    }
}

# Step 3: Uninstall application
Write-Step -Text "Uninstalling application..." -Step 3 -Total 5

$appRemoved = $false

# Check common installation paths
$installPaths = @(
    "$env:LOCALAPPDATA\Programs\id-card-system",
    "$env:LOCALAPPDATA\Programs\ID Card System",
    "$env:ProgramFiles\ID Card System",
    "${env:ProgramFiles(x86)}\ID Card System"
)

foreach ($path in $installPaths) {
    if (Test-Path $path) {
        Remove-Item -Path $path -Recurse -Force
        Write-Success "Removed: $path"
        $appRemoved = $true
    }
}

# Try to find and run official uninstaller
$uninstallKeys = @(
    "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*",
    "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*",
    "HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*"
)

foreach ($key in $uninstallKeys) {
    $apps = Get-ItemProperty $key | Where-Object { 
        $_.DisplayName -like "*ID Card System*" -or 
        $_.DisplayName -like "*id-card-system*" 
    }
    
    foreach ($app in $apps) {
        if ($app.UninstallString) {
            Write-Info "Running official uninstaller..."
            $uninstallCmd = $app.UninstallString -replace '"', ''
            if (Test-Path $uninstallCmd) {
                Start-Process -FilePath $uninstallCmd -ArgumentList "/S" -Wait -NoNewWindow
                Write-Success "Official uninstaller completed"
                $appRemoved = $true
            }
        }
    }
}

if (-not $appRemoved) {
    Write-Info "Application not found (may already be uninstalled)"
}

# Step 4: Remove user data
Write-Step -Text "Managing user data..." -Step 4 -Total 5

$userDataPath = "$env:APPDATA\id-card-system"

if ($RemoveAllData) {
    if (Test-Path $userDataPath) {
        Remove-Item -Path $userDataPath -Recurse -Force
        Write-Success "User data removed"
    } else {
        Write-Info "No user data found"
    }
} else {
    if (Test-Path $userDataPath) {
        Write-Info "Data preserved at: $userDataPath"
    } else {
        Write-Info "No user data found"
    }
}

# Step 5: Clean shortcuts and cache
Write-Step -Text "Cleaning shortcuts and cache..." -Step 5 -Total 5

# Remove shortcuts
$shortcuts = @(
    "$env:USERPROFILE\Desktop\ID Card System.lnk",
    "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\ID Card System.lnk",
    "$env:ProgramData\Microsoft\Windows\Start Menu\Programs\ID Card System.lnk"
)

foreach ($shortcut in $shortcuts) {
    if (Test-Path $shortcut) {
        Remove-Item -Path $shortcut -Force
        Write-Success "Shortcut removed"
    }
}

# Clean temp print files
$tempFiles = Get-ChildItem -Path $env:TEMP -Filter "print-*.html" -ErrorAction SilentlyContinue
if ($tempFiles) {
    $tempFiles | Remove-Item -Force
    Write-Success "Temporary files cleaned"
}

# Clean cache (only if removing all data)
if ($RemoveAllData) {
    $cachePaths = @(
        "$env:APPDATA\electron",
        "$env:LOCALAPPDATA\electron"
    )
    
    foreach ($cache in $cachePaths) {
        if (Test-Path $cache) {
            Remove-Item -Path $cache -Recurse -Force
        }
    }
    Write-Success "Cache cleaned"
}

# Registry cleanup
$regPaths = @(
    "HKCU:\Software\id-card-system",
    "HKCU:\Software\com.idcard.system"
)

foreach ($regPath in $regPaths) {
    if (Test-Path $regPath) {
        Remove-Item -Path $regPath -Recurse -Force
        Write-Success "Registry entries cleaned"
    }
}

Write-Info "Done!"

# Summary
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  Uninstall Complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

if ($RemoveAllData) {
    Write-Host "The application and all data have been removed." -ForegroundColor Green
    Write-Host "Your system is now clean.`n" -ForegroundColor Green
} else {
    Write-Host "The application has been removed." -ForegroundColor Green
    Write-Host "Your data has been preserved for future use.`n" -ForegroundColor Green
    Write-Host "Data location: " -NoNewline
    Write-Host "$userDataPath`n" -ForegroundColor Cyan
    Write-Host "To manually remove data later, delete this folder.`n"
}

Write-Host "Thank you for using ID Card System!`n" -ForegroundColor Magenta

if (-not $Silent) {
    Read-Host "Press Enter to exit"
}
