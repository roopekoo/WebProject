const { getCredentials } = require('../utils/requestUtils');
const User = require('../models/user');
const http = require('http');

/**
 * Get current user based on the request headers
 *
 * @param {http.IncomingMessage} request of the user
 * @returns {object|null} current authenticated user or null if not yet authenticated
 */
const getCurrentUser = async request => {
  const userCreds = getCredentials(request);

  if (userCreds === null) {
    return null;
  }
  const user = await User.findOne({ email: userCreds[0] }).exec();

  if (user === null) {
    return null;
  }

  if (!await user.checkPassword(userCreds[1])) return null;

  return user;
};

module.exports = { getCurrentUser };

