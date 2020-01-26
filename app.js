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

const findHandler = req => {
  if (req.method === 'GET' && req.url === '/') {
    req.url = '/index.html';
    return serveFile;
  }
  if (req.method === 'GET') return serveFile;
  return () => new Response();
};

const processRequest = req => {
  const handler = findHandler(req);
  return handler(req);
};

module.exports = { processRequest };
