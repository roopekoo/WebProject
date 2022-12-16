const User = require("../models/user");
const responseUtils = require('../utils/responseUtils');
const { validateUser } = require('../utils/users');
const http = require('http');

/**
 * Send all users as JSON
 *
 * @param {http.ServerResponse} response http response
 */
const getAllUsers = async response => {
  const users = await User.find({});
  responseUtils.sendJson(response, users, 200);
};

/**
 * Delete user and send deleted user as JSON
 *
 * @param {http.ServerResponse} response http response
 * @param {string} userId id of the user to be deleted
 * @param {object} currentUser (mongoose document object)
 * @returns {*} JSON response
 */
const deleteUser = async (response, userId, currentUser) => {
  if (currentUser.id === userId) {
    responseUtils.badRequest(response, 'Deleting own data is not allowed');
  }
  else {
    const deletedUser = await User.findById(userId).exec();
    if (deletedUser === null) {
      responseUtils.notFound(response);
    }
    else {
      await User.deleteOne({ _id: userId });
      return responseUtils.sendJson(response, deletedUser);
    }
  }
};

/**
 * Update user and send updated user as JSON
 *
 * @param {http.ServerResponse} response http response
 * @param {string} userId id of the user to be updated
 * @param {object} currentUser (mongoose document object)
 * @param {object} userData JSON data from request body
 */
const updateUser = async (response, userId, currentUser, userData) => {
  const getUser = await User.findById(userId).exec();
  if (!getUser || getUser === null) responseUtils.notFound(response);
  else if (userId === currentUser.id) responseUtils.badRequest(response, 'Updating own data is not allowed');

  else if (!userData.role || userData.role === null || userData.role === undefined) {
    responseUtils.badRequest(response, "User is missing or not valid");
  } else {
    try {
      getUser.role = userData.role;
      const savedUser = await getUser.save();
      responseUtils.sendJson(response, savedUser);
    } catch (error) {
      responseUtils.badRequest(response, error.message);
    }
  }
};

/**
 * Send user data as JSON
 *
 * @param {http.ServerResponse} response http response
 * @param {string} userId id of the user to be viewed
 * @param {object} currentUser (mongoose document object)
 */
const viewUser = async (response, userId, currentUser) => {
  if (currentUser.role.toLowerCase() !== 'admin') responseUtils.forbidden(response);

  else {
    const getUser = await User.findById(userId).exec();

    if (getUser === null) {
      responseUtils.notFound(response);
    }
    else {
      responseUtils.sendJson(response, getUser);
    }
  }
};

/**
 * Register new user and send created user back as JSON
 *
 * @param {http.ServerResponse} response http response
 * @param {object} userData JSON data from request body
 */
const registerUser = async (response, userData) => {
  const errorMsg = validateUser(userData);
  const userInDb = await User.findOne({ email: userData.email }).exec();

  if (userInDb === null && errorMsg.length < 1) {
    try {
      const userDetails = {
        name: userData.name,
        email: userData.email,
        password: userData.password
      };

      const newUser = new User(userDetails);
      const savedUser = await newUser.save();
      responseUtils.createdResource(response, savedUser);
    } catch (error) {
      responseUtils.badRequest(response, error);
    }
  }

  else if (errorMsg.length > 0) responseUtils.badRequest(response, errorMsg);

  else responseUtils.badRequest(response, 'Email is already in use');
};

module.exports = { getAllUsers, registerUser, deleteUser, viewUser, updateUser };