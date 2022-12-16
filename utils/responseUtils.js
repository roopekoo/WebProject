const http = require('http');

/**
 * Sends basic authentication challenge headers
 * 
 * @param {http.ServerResponse} response http response
 * @returns {*} response's end
 */
const basicAuthChallenge = response => {
  // TODO: 8.5 Send proper basic authentication challenge headers
  response.writeHead(401, { 'www-authenticate': 'Basic' });
  return response.end();
};

/**
 * Sends payload as JSON 
 * 
 * @param {http.ServerResponse} response http response
 * @param {*} payload payload to be sended
 * @param {*} code the http code
 * @returns {*} response's end
 */
const sendJson = (response, payload, code = 200) => {
  response.writeHead(code, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(payload));
};

/**
 * Creates resource as JSON
 * 
 * @param {http.ServerResponse} response http response
 * @param {*} payload payload to be sended
 * @returns {*} sendJSON 
 */
const createdResource = (response, payload) => {
  return sendJson(response, payload, 201);
};

/**
 * Creates response as noContent
 * 
 * @param {http.ServerResponse} response http response
 * @returns {*} response's end
 */
const noContent = response => {
  response.statusCode = 204;
  return response.end();
};

/**
 * Creates response as badRequest
 * 
 * @param {http.ServerResponse} response http response
 * @param {*} errorMsg error message
 * @returns {*} sendJson if error message is not empty, else response's end with status code 400
 */
const badRequest = (response, errorMsg) => {
  if (errorMsg) return sendJson(response, { error: errorMsg }, 400);

  response.statusCode = 400;
  return response.end();
};

/**
 * Creates response as unauthorized
 * 
 * @param {http.ServerResponse} response http response
 * @returns {*} response's end
 */
const unauthorized = response => {
  response.statusCode = 401;
  return response.end();
};

/**
 * Creates response as forbidden
 * 
 * @param {http.ServerResponse} response http response
 * @returns {*} response's end
 */
const forbidden = response => {
  response.statusCode = 403;
  return response.end();
};

/**
 * Creates response as not found
 * 
 * @param {http.ServerResponse} response http response
 * @returns {*} response's end
 */
const notFound = response => {
  response.statusCode = 404;
  return response.end();
};

/**
 * Creates response as method not allowed
 * 
 * @param {http.ServerResponse} response http response
 * @returns {*} response's end
 */
const methodNotAllowed = response => {
  response.statusCode = 405;
  return response.end();
};

/**
 * Creates response as content type not acceptable
 * 
 * @param {http.ServerResponse} response http response
 * @returns {*} response's end
 */
const contentTypeNotAcceptable = response => {
  response.statusCode = 406;
  return response.end();
};

/**
 * Creates response as internal server error
 * 
 * @param {http.ServerResponse} response http response
 * @returns {*} response's end
 */
const internalServerError = response => {
  response.statusCode = 500;
  return response.end();
};

/**
 * Creates response as redirecting to new ppage
 * 
 * @param {http.ServerResponse} response http response
 * @param {*} page the new page to be redirected
 */
const redirectToPage = (response, page) => {
  response.writeHead(302, { Location: page });
  response.end();
};

module.exports = {
  sendJson,
  createdResource,
  noContent,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  methodNotAllowed,
  contentTypeNotAcceptable,
  internalServerError,
  basicAuthChallenge,
  redirectToPage
};