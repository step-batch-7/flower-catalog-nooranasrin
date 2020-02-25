const fs = require('fs');
const redis = require('redis');
const client = redis.createClient();
const { loadTemplate } = require('./loadTemplate');
const Comment = require('./comment');
const CommentLog = require('./commentLog');

let totalComments;

(function() {
  client.get('comments', (err, comments) => {
    if (err) {
      return err;
    }
    totalComments = CommentLog.load(JSON.parse(comments));
  });
  client.quit();
})();

const serveGuestBook = function(request, response, next) {
  const path = `${__dirname}/../templates${request.url}`;
  const tableHtml = totalComments.toHTML();
  let body = fs.readFileSync(path, 'utf8');
  body = loadTemplate('guestBook.html', { FEEDBACK: tableHtml });
  response.end(body);
};

const saveCommentsAndRedirect = function(request, response) {
  const client = redis.createClient();
  const { body } = request;
  const comment = new Comment(body.name, body.comment, body.date);
  totalComments.addComment(comment);
  client.set('comments', totalComments.toJSON());
  client.quit();
  response.redirect('guestBook.html');
};

module.exports = {
  serveGuestBook,
  saveCommentsAndRedirect
};
