const http = require('http');

/**
 * Decode, parse and return user credentials (username and password)
 * from the Authorization header.
 *
 * @param {http.incomingMessage} request http request
 * @returns {Array|null} [username, password] or null if header is missing
 */
const getCredentials = request => {

  const authHeader = request.headers['authorization'];
  // it's e.g. in the form 'Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ=='

  if (!authHeader || authHeader === "" || authHeader.split(" ")[0] !== 'Basic') {
    return null;
  } else {
    const encoded = authHeader.split(' ')[1];
    // now it's only the encoded part

    // create a buffer
    const buff = Buffer.from(encoded, 'base64');
    // decode buffer from base64 to UTF-8 
    const decoded = buff.toString('utf-8');
    // now it's in the form "email:password"
    const arr = decoded.split(":");
    return arr;
  }
};

/**
 * Does the client accept JSON responses?
 *
 * @param {http.incomingMessage} request http request
 * @returns {boolean} true if client accepts JSON response, false if doesn't
 */
const acceptsJson = request => {
  //Check if the client accepts JSON as a response based on "Accept" request header
  // NOTE: "Accept" header format allows several comma separated values simultaneously
  // as in "text/html,application/xhtml+xml,application/json,application/xml;q=0.9,*/*;q=0.8"
  // Do not rely on the header value containing only single content type!
  const acceptHeader = request.headers.accept || '';
  return acceptHeader.includes('application/json') || acceptHeader.includes('*/*');
};

/**
 * Is the client request content type JSON?
 *
 * @param {http.incomingMessage} request http request
 * @returns {boolean} true if request is JSON, false if isn't
 */
const isJson = request => {
  // Check whether request "Content-Type" is JSON or not
  const contentType = request.headers['content-type'] || '';
  return contentType.toLowerCase() === 'application/json';
};

/**
 * Asynchronously parse request body to JSON
 *
 * Remember that an async function always returns a Promise which
 * needs to be awaited or handled with then() as in:
 *
 *   const json = await parseBodyJson(request);
 *
 *   -- OR --
 *
 *   parseBodyJson(request).then(json => {
 *     // Do something with the json
 *   })
 *
 * @param {http.IncomingMessage} request http request
 * @returns {Promise<*>} Promise resolves to JSON content of the body
 */
const parseBodyJson = request => {
  return new Promise((resolve, reject) => {
    let body = '';

    request.on('error', err => reject(err));

    request.on('data', chunk => {
      body += chunk.toString();
    });

    request.on('end', () => {
      resolve(JSON.parse(body));
    });
  });
};

module.exports = { acceptsJson, getCredentials, isJson, parseBodyJson };