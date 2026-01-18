/**
 * Database Reset Utility
 * Run this script to reset the database and recreate default users
 * 
 * Usage: node reset-database.js
 * 
 * WARNING: This will delete all existing data!
 */

const fs = require('fs');
const path = require('path');
const { app } = require('electron');

// Since this runs outside Electron app, we need to manually set the path
const userDataPath = process.env.APPDATA || 
  (process.platform === 'darwin' 
    ? path.join(process.env.HOME, 'Library', 'Application Support') 
    : path.join(process.env.HOME, '.config'));

const dbPath = path.join(userDataPath, 'id-card-system', 'idcard.db');

console.log('Database Reset Utility');
console.log('======================\n');
console.log(`Database path: ${dbPath}\n`);

if (fs.existsSync(dbPath)) {
  try {
    // Delete database file
    fs.unlinkSync(dbPath);
    console.log('✓ Database deleted successfully!');
    console.log('\nThe database will be recreated with default users on next app launch:');
    console.log('  - admin / admin123');
    console.log('  - pixelveda / PixelVeda@2026');
    console.log('  - pixelVedaAdmin / PixelVeda@2026');
    console.log('  - pixelVedaTesting / PixelVeda@testing');
    console.log('  - pixelVedaLogin / PixelVeda@Login');
  } catch (error) {
    console.error('✗ Error deleting database:', error.message);
    console.log('\nPlease close the application and try again.');
  }
} else {
  console.log('ℹ Database file not found. It will be created on next app launch.');
}

console.log('\n======================\n');
