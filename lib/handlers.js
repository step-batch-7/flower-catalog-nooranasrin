const fs = require('fs');
const url = require('url');
const CONTENT_TYPES = require('./mimeTypes');
const { loadTemplate } = require('./loadTemplate');

const STATIC_FOLDER = `${__dirname}/../public`;

const createTable = function(comments) {
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

const isFileNotAvailable = function(path) {
  const stat = fs.existsSync(path) && fs.statSync(path);
  return !stat || !stat.isFile();
};

const getPath = function(path) {
  if (path === '/') return `${STATIC_FOLDER}/index.html`;
  return `${STATIC_FOLDER}${path}`;
};

const sendResponse = function(response, contentType, statusCode, body) {
  response.setHeader('Content-Type', contentType);
  response.writeHead(statusCode);
  response.end(body);
};

const serve404Page = function(request, response) {
  const body = loadTemplate('error.html', { URL: request.url });
  sendResponse(response, 'text/html', 404, body);
};

const serveFile = function(request, response, next) {
  const path = getPath(request.url);
  if (isFileNotAvailable(path)) return next();
  const contentType = getContentType(path);
  const body = fs.readFileSync(path);
  sendResponse(response, contentType, 200, body);
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
  const { name, comment } = url.parse(`?${body}`, true).query;
  const newComment = { name, comment };
  newComment.date = new Date();
  return newComment;
};

const loadPreviousFeedbacks = function() {
  const dataStoragePath = `${__dirname}/../data/comments.json`;
  if (!fs.existsSync(dataStoragePath)) return [];
  const comments = require(dataStoragePath);
  return comments;
};

const serveGuestBook = function(request, response) {
  const path = `${__dirname}/../templates/guestBook.html`;
  let comments = loadPreviousFeedbacks();
  const tableHtml = createTable(comments);
  let body = fs.readFileSync(path, 'utf8');
  body = body.replace('__FEEDBACK__', tableHtml);
  sendResponse(response, 'text/html', 200, body);
};

const saveComments = function(request, response) {
  let totalComments = loadPreviousFeedbacks();
  totalComments.unshift(formatComment(request.body));
  const dataStoragePath = `${__dirname}/../data/comments.json`;
  fs.writeFileSync(dataStoragePath, JSON.stringify(totalComments));
  serveGuestBook(request, response);
};

const readBody = function(request, response, next) {
  let comment = '';
  request.on('data', chunk => (comment += chunk));
  request.on('end', () => {
    request.body = comment;
    next();
  });
};

const getHandlers = [
  { path: '', handler: readBody },
  { path: '/guestBook.html', handler: serveGuestBook },
  { path: '', handler: serveFile },
  { path: '', handler: serve404Page }
];
const postHandlers = [
  { path: '', handler: readBody },
  { path: '/guestBook.html', handler: saveComments }
];

const methods = { GET: getHandlers, POST: postHandlers };

module.exports = { methods };
