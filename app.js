const fs = require('fs');
const Response = require('./lib/response');
const CONTENT_TYPES = require('./lib/mimeTypes');
const { loadTemplate } = require('./lib/loadTemplate');

const STATIC_FOLDER = `${__dirname}/public`;

const provideResponse = function(statusCode, content, contentType) {
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
    return provideResponse(404, content, 'text/html');
  }
  const [, extension] = path.match(/.*\.(.*)$/) || [];
  const contentType = CONTENT_TYPES[extension];
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

const handleUserFeedback = function(method, body) {
  const dataStoragePath = `${__dirname}/feedback.json`;
  let feedback = require(dataStoragePath);
  if (method === 'POST') feedback.push(generateFeedbackDetails(body));
  feedback = feedback.reverse();
  feedback = JSON.stringify(feedback, null, 2);
  fs.writeFileSync(dataStoragePath, feedback);
  return createTable(JSON.parse(feedback));
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
