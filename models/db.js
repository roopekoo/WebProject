require('dotenv').config();
const mongoose = require('mongoose');

/**
 * Get database connect URL.
 *
 * Reads URL from DBURL environment variable or
 * returns default URL if variable is not defined
 *
 * @returns {string} connection URL
 */
const getDbUrl = () => {
  // TODO: 9.4 Implement this
  if (typeof(process.env.DBURL) === 'undefined') {
    return 'mongodb://localhost:27017/WebShopDb';
  }

  return process.env.DBURL;
};

/**
 * Connects to the database
 */
function connectDB() {
  // Do nothing if already connected
  if (!mongoose.connection || mongoose.connection.readyState === 0) {
    mongoose
      .connect(getDbUrl(), {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
        autoIndex: true
      })
      .then(() => {
        mongoose.connection.on('error', err => {
          console.error(err);
        });

        mongoose.connection.on('reconnectFailed', handleCriticalError);
      })
      .catch(handleCriticalError);
  }
}

/**
 * Prints error and throws it
 * 
 * @param {Error} err error object
 */
function handleCriticalError(err) {
  console.error(err);
  throw err;
}

/**
 * Disconnects the database
 */
function disconnectDB() {
  mongoose.disconnect();
}

module.exports = { connectDB, disconnectDB, getDbUrl };