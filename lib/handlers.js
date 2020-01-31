const fs = require('fs');
const querystring = require('querystring');
const CONTENT_TYPES = require('./mimeTypes');
const STATUS_CODE = require('./statusCodes');
const { loadTemplate } = require('./loadTemplate');
const { loadPreviousComments, isFileNotAvailable } = require('./configuration');
const App = require('./app');

const STATIC_FOLDER = `${__dirname}/../public`;

const totalComments = loadPreviousComments();

const formatCommentsToDisplay = function(comments) {
  let div = '';
  comments.forEach(comment => {
    div += '<div class="feedback">';
    div += `<div><b>Date: </b>${getDateAndTime(comment.date).day} </div>`;
    div += `<div><b>Time: </b>${getDateAndTime(comment.date).time} </div>`;
    div += `<div><b>Name: </b>${formatData(comment.name)} </div>`;
    div += `<div><b>Comment: </b>${formatData(comment.comment)} </div>`;
    div += '</div>';
  });
  return div;
};

const getContentType = function(path) {
  const [, extension] = path.match(/.*\.(.*)$/) || [];
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

const formatData = function(data) {
  return data.replace(/\r\n/g, '<br>');
};

const getDateAndTime = function(date) {
  const dateObject = new Date(date);
  const day = dateObject.toDateString();
  const time = dateObject.toLocaleTimeString();
  return { day, time };
};

const formatComment = function(body) {
  const { name, comment } = querystring.parse(body);
  const newComment = { name, comment };
  newComment.date = new Date();
  return newComment;
};

const serveGuestBook = function(request, response, next) {
  const path = `${__dirname}/../templates${request.url}`;
  const tableHtml = formatCommentsToDisplay(totalComments);
  if (isFileNotAvailable(path)) {
    return next();
  }
  let body = fs.readFileSync(path, 'utf8');
  body = loadTemplate('guestBook.html', { FEEDBACK: tableHtml });
  response.setHeader('Content-Type', 'text/html');
  response.end(body);
};

const saveCommentsAndRedirect = function(request, response) {
  totalComments.unshift(request.body);
  const dataStoragePath = `${__dirname}/../data/comments.json`;
  fs.writeFileSync(dataStoragePath, JSON.stringify(totalComments));
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

const app = new App();

app.use(readBody);
app.get('/guestBook.html', serveGuestBook);
app.get('', serveFile);
app.get('', serve404Page);
app.post('/saveComments', saveCommentsAndRedirect);
app.use(methodNotAllowed);

module.exports = { app };
