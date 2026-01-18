#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Creates a distribution package for customers
    
.DESCRIPTION
    This script builds the application and creates a complete
    distribution package ready to send to customers.
    
.EXAMPLE
    .\create-distribution.ps1
#>

$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Text, [int]$Step, [int]$Total)
    Write-Host "`n[$Step/$Total] $Text" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Text)
    Write-Host "      $Text" -ForegroundColor Green
}

function Write-Error {
    param([string]$Text)
    Write-Host "      [ERROR] $Text" -ForegroundColor Red
}

# Banner
Clear-Host
Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "  Distribution Package Creator" -ForegroundColor Magenta
Write-Host "========================================`n" -ForegroundColor Magenta

# Check if in project root
if (-not (Test-Path "package.json")) {
    Write-Error "Please run this script from the project root directory"
    exit 1
}

# Step 1: Check prerequisites
Write-Step -Text "Checking prerequisites..." -Step 1 -Total 6

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error "npm is not installed or not in PATH"
    exit 1
}
Write-Success "npm found!"

if (-not (Test-Path "node_modules")) {
    Write-Host "      Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Step 2: Build frontend
Write-Step -Text "Building frontend..." -Step 2 -Total 6

Push-Location "Id_Card_Frontend"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Frontend build failed!"
    Pop-Location
    exit 1
}
Pop-Location
Write-Success "Frontend built successfully!"

# Step 3: Build installer
Write-Step -Text "Building Windows installer..." -Step 3 -Total 6

npm run build:win:installer
if ($LASTEXITCODE -ne 0) {
    Write-Error "Installer build failed!"
    exit 1
}
Write-Success "Installer built successfully!"

# Step 4: Create distribution folder
Write-Step -Text "Creating distribution folder..." -Step 4 -Total 6

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$version = (Get-Content package.json | ConvertFrom-Json).version
$distFolder = "distribution\ID-Card-System-v$version-$timestamp"

New-Item -ItemType Directory -Path "distribution" -Force | Out-Null
if (Test-Path $distFolder) {
    Remove-Item -Path $distFolder -Recurse -Force
}
New-Item -ItemType Directory -Path $distFolder -Force | Out-Null

Write-Success "Created: $distFolder"

# Step 5: Copy files
Write-Step -Text "Copying files..." -Step 5 -Total 6

# Copy installer
$installer = Get-ChildItem "release\*Setup*.exe" | Select-Object -First 1
if ($installer) {
    Copy-Item $installer.FullName -Destination $distFolder
    Write-Success "Copied installer: $($installer.Name)"
} else {
    Write-Error "Installer not found in release folder!"
}

# Copy uninstall scripts
Copy-Item "uninstall-customer.bat" -Destination $distFolder
Copy-Item "uninstall-customer.ps1" -Destination $distFolder
Copy-Item "CUSTOMER-UNINSTALL.md" -Destination $distFolder
Write-Success "Copied uninstall scripts"

# Create README.txt
$readmeContent = @"
========================================
ID CARD SYSTEM v$version
========================================

Thank you for choosing ID Card System!

INSTALLATION:
1. Double-click the Setup.exe file
2. Follow the installation wizard
3. Launch from Desktop or Start Menu

FIRST LOGIN:
Username: admin
Password: admin123

IMPORTANT: Change the admin password after first login!

UNINSTALLATION:
Method 1: Windows Settings > Apps > Uninstall
Method 2: Start Menu > ID Card System > Uninstall
Method 3: Run "uninstall-customer.bat" as Administrator

For detailed instructions, see CUSTOMER-UNINSTALL.md

SUPPORT:
Email: support@pixelveda.com
Website: www.yourwebsite.com

========================================
"@

Set-Content -Path "$distFolder\README.txt" -Value $readmeContent
Write-Success "Created README.txt"

# Copy license if exists
if (Test-Path "LICENSE") {
    Copy-Item "LICENSE" -Destination "$distFolder\LICENSE.txt"
    Write-Success "Copied LICENSE.txt"
}

# Step 6: Create ZIP
Write-Step -Text "Creating ZIP archive..." -Step 6 -Total 6

$zipFile = "distribution\ID-Card-System-v$version-$timestamp.zip"
Compress-Archive -Path "$distFolder\*" -DestinationPath $zipFile -Force
Write-Success "ZIP created successfully!"

# Summary
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  Distribution Package Created!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "Package Location:" -ForegroundColor Cyan
Write-Host "  $distFolder`n" -ForegroundColor White

Write-Host "ZIP Archive:" -ForegroundColor Cyan
Write-Host "  $zipFile`n" -ForegroundColor White

Write-Host "Package Contents:" -ForegroundColor Cyan
Get-ChildItem $distFolder | ForEach-Object {
    Write-Host "  - $($_.Name)" -ForegroundColor White
}

Write-Host "`n========================================`n" -ForegroundColor Green

# Open distribution folder
Write-Host "Opening distribution folder..." -ForegroundColor Yellow
Start-Process $distFolder

Write-Host "`nPackage is ready to distribute to customers!`n" -ForegroundColor Green
