const fs = require('fs');
const Response = require('./lib/response');
const CONTENT_TYPES = require('./lib/mimeTypes');
const { loadTemplate } = require('./lib/loadTemplate');

const STATIC_FOLDER = `${__dirname}/public`;

const getContentType = function(path) {
  const [, extension] = path.match(/.*\.(.*)$/) || [];
  return CONTENT_TYPES[extension];
};

const provideResponse = function(statusCode, content, contentType) {
  const response = new Response(statusCode, content);
  response.setHeader('Content-Type', contentType);
  response.setHeader('Content-Length', content.length);
  return response;
};

const serveFile = req => {
  const path = `${STATIC_FOLDER}${req.url}`;
  const stat = fs.existsSync(path) && fs.statSync(path);
  if (!stat || !stat.isFile()) {
    const content = loadTemplate('error.html', { URL: req.url });
    return provideResponse(404, content, 'text/html');
  }
  const contentType = getContentType(path);
  const content = fs.readFileSync(path);
  return provideResponse(200, content, contentType);
};

const createTable = function(feedbacks) {
  let table = '';
  feedbacks.forEach(feedback => {
    table += '<tr>';
    table += `<td> ${feedback.date} </td>`;
    table += `<td> ${feedback.time} </td>`;
    table += `<td> ${feedback.name.split('+').join(' ')} </td>`;
    table += `<td> ${feedback.comment.split('+').join(' ')} </td>`;
    table += '</tr>';
  });
  return table;
};

const generateFeedbackDetails = function(body) {
  const newFeedBack = body;
  newFeedBack.date = new Date().toDateString();
  newFeedBack.time = new Date().toLocaleTimeString();
  return newFeedBack;
};

const loadPreviousFeedbacks = function() {
  const dataStoragePath = `${__dirname}/feedback.json`;
  const feedback = require(dataStoragePath);
  return feedback;
};

const storeTheFeedbacks = function(feedbacks) {
  const dataStoragePath = `${__dirname}/feedback.json`;
  feedbacks = JSON.stringify(feedbacks, null, 2);
  fs.writeFileSync(dataStoragePath, feedbacks);
};

const handleUserFeedback = function(method, body) {
  let feedbacks = loadPreviousFeedbacks();
  if (method === 'POST') feedbacks.push(generateFeedbackDetails(body));
  feedbacks = feedbacks.reverse();
  storeTheFeedbacks(feedbacks);
  return createTable(feedbacks);
};

const serveGuestBookPage = function(request) {
  const tableHtml = handleUserFeedback(request.method, request.body);
  let html = fs.readFileSync(`${__dirname}/public/guestBook.html`, 'utf8');
  html = html.replace('__FEEDBACK__', tableHtml);
  return provideResponse(200, html, 'text/html');
};

const findHandler = request => {
  if (request.method === 'GET' && request.url === '/') {
    request.url = '/index.html';
    return serveFile;
  }
  if (request.url === '/guestBook.html') return serveGuestBookPage;
  if (request.method === 'GET') return serveFile;
  return () => new Response();
};

const processRequest = req => {
  const handler = findHandler(req);
  return handler(req);
};

module.exports = { processRequest };
