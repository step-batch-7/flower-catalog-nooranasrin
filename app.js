const fs = require('fs');
const url = require('url');
const CONTENT_TYPES = require('./lib/mimeTypes');
const { loadTemplate } = require('./lib/loadTemplate');

const STATIC_FOLDER = `${__dirname}/public`;

const getContentType = function(path) {
  const [, extension] = path.match(/.*\.(.*)$/) || [];
  return CONTENT_TYPES[extension];
};

const sendResponse = function(statusCode, content, contentType, response) {
  response.setHeader('Content-Type', contentType);
  response.writeHead(statusCode);
  response.end(content);
};

const isFileNotAvailable = function(path) {
  const stat = fs.existsSync(path) && fs.statSync(path);
  return !stat || !stat.isFile();
};

const getPath = function(path) {
  if (path === '/') return `${STATIC_FOLDER}/index.html`;
  return `${STATIC_FOLDER}${path}`;
};

const serveFile = function(request, response) {
  const path = getPath(request.url);
  if (isFileNotAvailable(path)) {
    const content = loadTemplate('error.html', { URL: request.url });
    sendResponse(404, content, 'text/html', response);
  }
  const contentType = getContentType(path);
  const content = fs.readFileSync(path);
  sendResponse(200, content, contentType, response);
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

// const createTable = function(feedbacks) {
//   let table = '';
//   feedbacks.forEach(feedback => {
//     table += '<tr>';
//     table += `<td> ${getDateAndTime(feedback.date).day} </td>`;
//     table += `<td> ${getDateAndTime(feedback.date).time} </td>`;
//     table += `<td> ${formatData(feedback.name)} </td>`;
//     table += `<td> ${formatData(feedback.comment)} </td>`;
//     table += '</tr>';
//   });
//   return table;
// };

const createTable = function(feedbacks) {
  let div = '';
  feedbacks.forEach(feedback => {
    div += '<div class="feedback">';
    div += `<div><b>Date: </b>${getDateAndTime(feedback.date).day} </div>`;
    div += `<div><b>Time: </b>${getDateAndTime(feedback.date).time} </div>`;
    div += `<div><b>Name: </b>${formatData(feedback.name)} </div>`;
    div += `<div><b>Comment: </b>${formatData(feedback.comment)} </div>`;
    div += '</div>';
  });
  return div;
};

const generateFeedbackDetails = function(body) {
  const { name, comment } = url.parse(`?${body}`, true).query;
  const newFeedBack = { name, comment };
  newFeedBack.date = new Date();
  return newFeedBack;
};

const loadPreviousFeedbacks = function() {
  const dataStoragePath = `${__dirname}/feedback.json`;
  if (!fs.existsSync(dataStoragePath)) return [];
  const feedback = require(dataStoragePath);
  return feedback;
};

const storeTheFeedbacks = function(feedbacks) {
  const dataStoragePath = `${__dirname}/feedback.json`;
  fs.writeFileSync(dataStoragePath, JSON.stringify(feedbacks));
};

const handleUserFeedback = function(method, body) {
  let feedbacks = loadPreviousFeedbacks();
  if (method === 'POST') feedbacks.push(generateFeedbackDetails(body));
  feedbacks = feedbacks.reverse();
  storeTheFeedbacks(feedbacks);
  return createTable(feedbacks);
};

const serveGuestBook = function(request, response) {
  let userFeedbackDetails = '';
  request.on('data', chunk => (userFeedbackDetails += chunk));
  request.on('end', () => {
    const tableHtml = handleUserFeedback(request.method, userFeedbackDetails);
    let html = fs.readFileSync(`${__dirname}/templates/guestBook.html`, 'utf8');
    html = html.replace('__FEEDBACK__', tableHtml);
    sendResponse(200, html, 'text/html', response);
  });
};

const processRequest = function(request, response) {
  const getHandlers = { '/guestBook.html': serveGuestBook, default: serveFile };
  const postHandlers = { '/guestBook.html': serveGuestBook };
  const methods = { GET: getHandlers, POST: postHandlers };
  const handlers = methods[request.method] || methods.NOT_ALLOWED;
  const handler = handlers[request.url] || handlers.default;
  return handler(request, response);
};

module.exports = { processRequest };
