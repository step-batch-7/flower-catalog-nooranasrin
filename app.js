const fs = require('fs');
const Response = require('./lib/response');
const CONTENT_TYPES = require('./lib/mimeTypes');
const { loadTemplate } = require('./lib/loadTemplate');

const STATIC_FOLDER = `${__dirname}/public`;

const provideResponse = function(path, statusCode, content) {
  const [, extension] = path.match(/.*\.(.*)$/) || [];
  const contentType = CONTENT_TYPES[extension];
  const response = new Response();
  response.setHeader('Content-Type', contentType);
  response.setHeader('Content-Length', content.length);
  response.statusCode = statusCode;
  response.body = content;
  return response;
};

const serveFile = req => {
  const path = `${STATIC_FOLDER}${req.url}`;
  const stat = fs.existsSync(path) && fs.statSync(path);
  if (!stat || !stat.isFile()) {
    const content = loadTemplate('error.html', { URL: req.url });
    return provideResponse('error.html', 404, content);
  }
  const content = fs.readFileSync(path);
  return provideResponse(path, 200, content);
};

const storeUserFeedBack = function(request) {
  const dataStoragePath = `${__dirname}/feedback.json`;
  let feedback = require(dataStoragePath);
  const newFeedBack = request.body;
  feedback.push(newFeedBack);
  feedback = JSON.stringify(feedback, null, 2);
  fs.writeFileSync(dataStoragePath, feedback);
  const dataToStore = `const feedback=${feedback}`;
  fs.writeFileSync(`${__dirname}/public/js/feedback.js`, dataToStore);
};

const findHandler = request => {
  if (request.method === 'GET' && request.url === '/') {
    request.url = '/index.html';
    return serveFile;
  }
  if (request.method === 'GET') return serveFile;
  if (request.method === 'POST') {
    storeUserFeedBack(request);
  }
  return () => new Response();
};

const processRequest = req => {
  const handler = findHandler(req);
  return handler(req);
};

module.exports = { processRequest };
