const responseUtils = require('./utils/responseUtils');
const { acceptsJson, isJson, parseBodyJson } = require('./utils/requestUtils');
const { renderPublic } = require('./utils/render');
const { getCurrentUser } = require('./auth/auth');
const { getAllOrders, viewOrder, addOrder } = require('./controllers/orders');
const { getAllProducts, viewProduct, updateProduct, addProduct, deleteProduct } = require('./controllers/products');
const { getAllUsers, deleteUser, updateUser, viewUser, registerUser } = require('./controllers/users');
const http = require('http');

/**
 * Known API routes and their allowed methods
 *
 * Used to check allowed methods and also to send correct header value
 * in response to an OPTIONS request by sendOptions() (Access-Control-Allow-Methods)
 */
const allowedMethods = {
  '/api/register': ['POST'],
  '/api/users': ['GET'],
  '/api/products': ['GET', 'POST'],
  '/api/orders': ['GET', 'POST'],
};

/**
 * Send response to client options request.
 *
 * @param {string} filePath pathname of the request URL
 * @param {http.ServerResponse} response of the server
 * @returns {*} the response's end or notfound
 */
const sendOptions = (filePath, response) => {
  if (filePath in allowedMethods) {
    response.writeHead(204, {
      'Access-Control-Allow-Methods': allowedMethods[filePath].join(','),
      'Access-Control-Allow-Headers': 'Content-Type,Accept',
      'Access-Control-Max-Age': '86400',
      'Access-Control-Expose-Headers': 'Content-Type,Accept'
    });
    return response.end();
  }
  return responseUtils.notFound(response);
};

/**
 * Does the url have an ID component as its last part? (e.g. /api/users/dsf7844e)
 *
 * @param {string} url filePath
 * @param {string} prefix the prefix of the path
 * @returns {boolean} true if the url has an ID component at it's last part, false if doesn't
 */
const matchIdRoute = (url, prefix) => {
  const idPattern = '[0-9a-z]{8,24}';
  const regex = new RegExp(`^(/api)?/${prefix}/${idPattern}$`);
  return regex.test(url);
};

/**
 * Does the URL match /api/users/{userId}
 *
 * @param {string} url filePath
 * @returns {boolean} true if URL matches, false if doesn't
 */
const matchUserId = url => {
  return matchIdRoute(url, 'users');
};

/**
 * Does the URL match /api/products/{productId}
 *
 * @param {string} url filePath
 * @returns {boolean} true if URL matches, false if doesn't
 */
const matchProductId = url => {
  return matchIdRoute(url, 'products');
};

/**
 * Does the URL match /api/orders/{orderId}
 *
 * @param {string} url filePath
 * @returns {boolean} true if URL matches, false if doesn't
 */
const matchOrderId = url => {
  return matchIdRoute(url, 'orders');
};

/**
 * Handles the request
 * 
 * @param {http.incomingMessage} request http request
 * @param {http.ServerResponse} response http response
 * @returns {*} the method to be executed
 */
const handleRequest = async (request, response) => {
  const { url, method, headers } = request;
  const filePath = new URL(url, `http://${headers.host}`).pathname;

  // serve static files from public/ and return immediately
  if (method.toUpperCase() === 'GET' && !filePath.startsWith('/api')) {
    const fileName = filePath === '/' || filePath === '' ? 'index.html' : filePath;
    return renderPublic(fileName, response);
  }

  // Single user
  if (matchUserId(filePath)) {
    const currentUser = await getCurrentUser(request);
    
    if (currentUser === null) return responseUtils.basicAuthChallenge(response);
    
    if (currentUser.role !== 'admin') return responseUtils.forbidden(response);
    
    // Require a correct accept header (require 'application/json' or '*/*')
    if (!acceptsJson(request)) return responseUtils.contentTypeNotAcceptable(response);

    const userId = filePath.replace(/^.*[///]/, '');

    if (method.toUpperCase() === 'GET') {
      return viewUser(response, userId, currentUser);
    }

    if (method.toUpperCase() === 'PUT') {
      const requestBodyJSON = await parseBodyJson(request);
      return updateUser(response, userId, currentUser, requestBodyJSON);
    }

    if (method.toUpperCase() === 'DELETE') {
      return deleteUser(response, userId, currentUser);
    }
  }

  // Single product
  if (matchProductId(filePath)) {
    
    const currentUser = await getCurrentUser(request);
    
    if (currentUser === null) return responseUtils.basicAuthChallenge(response);
    
    // Require a correct accept header (require 'application/json' or '*/*')
    if (!acceptsJson(request)) return responseUtils.contentTypeNotAcceptable(response);

    const productId = filePath.replace(/^.*[///]/, '');

    if (method.toUpperCase() === 'GET') {
      return viewProduct(response, productId);
    }

    if (method.toUpperCase() === 'PUT') {
      if (currentUser.role !== 'admin') return responseUtils.forbidden(response);
      
      const productData = await parseBodyJson(request);
      return updateProduct(response, productId, productData);
    }

    if (method.toUpperCase() === 'DELETE') {
      if (currentUser.role !== 'admin') return responseUtils.forbidden(response);
      
      return deleteProduct(response, productId);
    }

    return responseUtils.unauthorized(response);
  }

    // single order
  if (matchOrderId(filePath)) {
    const currentUser = await getCurrentUser(request);
    
    if (currentUser === null) return responseUtils.basicAuthChallenge(response);
    
    // Require a correct accept header (require 'application/json' or '*/*')
    if (!acceptsJson(request)) return responseUtils.contentTypeNotAcceptable(response);

    const orderId = filePath.replace(/^.*[///]/, '');

    if (method.toUpperCase() === 'GET') {
      return viewOrder(response, currentUser, orderId);
    }
  }

  // Default to 404 Not Found if unknown url
  if (!(filePath in allowedMethods)) return responseUtils.notFound(response);
  // See: http://restcookbook.com/HTTP%20Methods/options/
  if (method.toUpperCase() === 'OPTIONS') return sendOptions(filePath, response);

  // Check for allowable methods
  if (!allowedMethods[filePath].includes(method.toUpperCase())) {
    return responseUtils.methodNotAllowed(response);
  }

  // Require a correct accept header (require 'application/json' or '*/*')
  if (!acceptsJson(request)) {
    return responseUtils.contentTypeNotAcceptable(response);
  }

  // GET all users
  if (filePath === '/api/users' && method.toUpperCase() === 'GET') {
    const currentUser = await getCurrentUser(request);

    if (currentUser === null) return responseUtils.basicAuthChallenge(response);

    if (currentUser.role !== 'admin') return responseUtils.forbidden(response);
      
    return getAllUsers(response);
  }

  // register new user
  if (filePath === '/api/register' && method.toUpperCase() === 'POST') {
    // Fail if not a JSON request, don't allow non-JSON Content-Type
    if (!isJson(request)) {
      return responseUtils.badRequest(response, 'Invalid Content-Type. Expected application/json');
    }

    const userDataJSON = await parseBodyJson(request);
    return registerUser(response, userDataJSON);
  }

  // get products
  if (filePath === '/api/products' && method.toUpperCase() === 'GET') {
    const currentUser = await getCurrentUser(request);

    if (currentUser === null) return responseUtils.basicAuthChallenge(response);

    return getAllProducts(response);
  }

  // Add product
  if (filePath === '/api/products' && method.toUpperCase() === 'POST') {
    const currentUser = await getCurrentUser(request);

    if (currentUser === null) return responseUtils.basicAuthChallenge(response);

    if (currentUser.role !== 'admin') return responseUtils.forbidden(response);

    // Fail if not a JSON request, don't allow non-JSON Content-Type
    if (!isJson(request)) {
      return responseUtils.badRequest(response, 'Invalid Content-Type. Expected application/json');
    }

    const productData = await parseBodyJson(request);
    return addProduct(response, productData);
  }

  // Orders
  if (filePath === '/api/orders') {
    const currentUser = await getCurrentUser(request);

    if (currentUser === null) return responseUtils.basicAuthChallenge(response);

    if (method.toUpperCase() === 'GET') {
      return getAllOrders(response, currentUser);
    }

    if (method.toUpperCase() === 'POST') {
      if (!isJson(request)) {
        return responseUtils.badRequest(response, 'Invalid Content-Type. Expected application/json');
      }

      const orderData = await parseBodyJson(request);
      return addOrder(response, currentUser, orderData);
    }
  }
};

module.exports = { handleRequest };
