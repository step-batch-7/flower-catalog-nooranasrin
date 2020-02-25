const fs = require('fs');
const redis = require('redis');
const client = redis.createClient();
const querystring = require('querystring');
const CONTENT_TYPES = require('./mimeTypes');
const STATUS_CODE = require('./statusCodes');
const { loadTemplate } = require('./loadTemplate');
const Comment = require('./comment');
const CommentLog = require('./commentLog');
const STATIC_FOLDER = `${__dirname}/../public`;

let totalComments;

const loadPreviousComments = function() {
  client.get('comments', (err, comments) => {
    if (err) {
      return err;
    }
    totalComments = CommentLog.load(JSON.parse(comments));
  });
};

loadPreviousComments();

const isFileNotAvailable = function(path) {
  const stat = fs.existsSync(path) && fs.statSync(path);
  return !stat || !stat.isFile();
};

const getContentType = function(path) {
  const [, extension] = path.match(/.*\.(.*)$/);
  return CONTENT_TYPES[extension];
};

const getPath = function(path) {
  if (path === '/') {
    return `${STATIC_FOLDER}/index.html`;
  }
  return `${STATIC_FOLDER}${path}`;
};

const serve404Page = function(request, response) {
  const body = loadTemplate('error.html', { URL: request.url });
  response.setHeader('Content-Type', 'text/html');
  response.writeHead(STATUS_CODE.NOT_FOUND);
  response.end(body);
};

const serveFile = function(request, response, next) {
  const path = getPath(request.url);
  if (isFileNotAvailable(path)) {
    return next();
  }
  const contentType = getContentType(path);
  const body = fs.readFileSync(path);
  response.setHeader('Content-Type', contentType);
  response.end(body);
};

const formatComment = function(body) {
  const { name, comment } = querystring.parse(body);
  const newComment = { name, comment };
  newComment.date = new Date();
  return newComment;
};

const serveGuestBook = function(request, response, next) {
  const path = `${__dirname}/../templates${request.url}`;
  const tableHtml = totalComments.toHTML();
  if (isFileNotAvailable(path)) {
    return next();
  }
  let body = fs.readFileSync(path, 'utf8');
  body = loadTemplate('guestBook.html', { FEEDBACK: tableHtml });
  response.setHeader('Content-Type', 'text/html');
  response.end(body);
};

const saveCommentsAndRedirect = function(request, response) {
  const { body } = request;
  const comment = new Comment(body.name, body.comment, body.date);
  totalComments.addComment(comment);
  client.set('comments', totalComments.toJSON());
  response.setHeader('location', 'guestBook.html');
  response.writeHead(STATUS_CODE.REDIRECT);
  response.end();
};

const methodNotAllowed = function(request, response) {
  response.setHeader('Content-Type', 'text/plain');
  response.writeHead(STATUS_CODE.METHOD_NOT_ALLOWED);
  response.end('Method Not Allowed');
};

const readBody = function(request, response, next) {
  let comment = '';
  request.on('data', chunk => {
    comment += chunk;
  });
  request.on('end', () => {
    request.body = formatComment(comment);
    next();
  });
};

module.exports = {
  readBody,
  serveGuestBook,
  serveFile,
  serve404Page,
  saveCommentsAndRedirect,
  methodNotAllowed
};
