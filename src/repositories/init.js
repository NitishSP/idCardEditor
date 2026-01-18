const authRepository = require('./auth.repository');
const fieldsRepository = require('./fields.repository');
const templatesRepository = require('./templates.repository');
const usersRepository = require('./users.repository');
const config = require('../../config');
const passwordService = require('../../PasswordService');
const logger = require('../utils/logger');

/**
 * Initialize all database tables and seed default data
 */
async function initializeDatabase() {
  try {
    // Initialize tables
    authRepository.initializeTable();
    fieldsRepository.initializeTable();
    templatesRepository.initializeTable();
    usersRepository.initializeTable();

    logger.info('All database tables initialized');

    // Seed default data
    await seedDefaultData();
  } catch (error) {
    logger.error('Database initialization error:', error);
    throw error;
  }
}

/**
 * Seed default data
 */
async function seedDefaultData() {
  try {
    // Seed client users
    await seedClientUsers();

    // Seed default fields
    seedDefaultFields();

    logger.info('Default data seeded successfully');
  } catch (error) {
    logger.error('Error seeding default data:', error);
    throw error;
  }
}

/**
 * Seed client users from config
 */
async function seedClientUsers() {
  const existingUsers = authRepository.findAll();
  const existingUsernames = existingUsers.map(u => u.username);

  const clientUsers = config.devCredentials.clientUsers || [];

  if (clientUsers.length === 0 && existingUsernames.length === 0) {
    logger.warn('⚠️  NO DEFAULT USERS CONFIGURED');
    logger.warn('⚠️  Set DEFAULT_CLIENT_USERS in .env file');
    logger.warn('⚠️  Or create admin user manually via Developer Panel');
  }

  // Insert client users that don't exist
  for (const user of clientUsers) {
    if (!existingUsernames.includes(user.username)) {
      await authRepository.create(user.username, user.password);
      logger.info(`Default client user created: ${user.username}`);
    }
  }
}

/**
 * Seed default predefined fields
 */
function seedDefaultFields() {
  const existingFields = fieldsRepository.findAll();
  
  if (existingFields.length === 0) {
    const fields = [
      { label: 'Profile Photo', defaultValue: '', fieldType: 'photo', isRequired: 1, displayOrder: 1 }
    ];

    for (const field of fields) {
      fieldsRepository.create({
        label: field.label,
        defaultValue: field.defaultValue,
        fieldType: field.fieldType,
        isRequired: field.isRequired,
        displayOrder: field.displayOrder
      });
    }

    logger.info('Default predefined fields created');
  }
}

module.exports = {
  initializeDatabase,
  seedDefaultData
};
