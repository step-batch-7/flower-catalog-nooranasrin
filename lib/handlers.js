const fs = require('fs');
const { loadTemplate } = require('./loadTemplate');

const serveCommentsLog = function(request, response, next) {
  request.totalComments = request.app.locals.totalComments;
  request.client = request.app.locals.client;
  next();
};

const serveGuestBook = function(request, response) {
  const tableHtml = request.totalComments.toHTML();
  let body = fs.readFileSync(`${__dirname}/../templates${request.url}`);
  body = loadTemplate('guestBook.html', { FEEDBACK: tableHtml });
  response.end(body);
};

const saveCommentsAndRedirect = function(request, response) {
  const { name, comment } = request.body;
  request.totalComments.addComment(name, comment, new Date());
  request.client.set('comments', request.totalComments.toJSON());
  response.redirect('/guestBook.html');
};

module.exports = { serveGuestBook, saveCommentsAndRedirect, serveCommentsLog };
