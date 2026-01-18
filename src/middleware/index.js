const rateLimitMiddleware = require('./rateLimit.middleware');
const validationMiddleware = require('./validation.middleware');
const errorHandlerMiddleware = require('./errorHandler.middleware');

module.exports = {
  rateLimitMiddleware,
  validationMiddleware,
  errorHandlerMiddleware
};
