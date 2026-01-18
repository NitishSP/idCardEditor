const usersRepository = require('../repositories/users.repository');
const logger = require('../utils/logger');
const { RESOURCES } = require('../utils/constants');

class UsersService {
  /**
   * Get all users
   */
  getAllUsers() {
    return usersRepository.findAll();
  }

  /**
   * Get user by ID
   */
  getUserById(id) {
    const user = usersRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  /**
   * Create new user
   */
  createUser(photo, additionalData) {
    console.log('====================================');
    console.log("photo",photo,additionalData);
    console.log('====================================');
    const result = usersRepository.create(photo, additionalData);
    logger.logResourceCreated(RESOURCES.USER, `ID: ${result.id}`);
    return result;
  }

  /**
   * Update user
   */
  updateUser(id, photo, additionalData) {
    usersRepository.update(id, photo, additionalData);
    logger.logResourceUpdated(RESOURCES.USER, `ID: ${id}`);
    return true;
  }

  /**
   * Delete user
   */
  deleteUser(id) {
    usersRepository.delete(id);
    logger.logResourceDeleted(RESOURCES.USER, `ID: ${id}`);
    return true;
  }
}

module.exports = new UsersService();
