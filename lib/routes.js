const express = require('express');
const app = express();

const handlers = require('./handlers');

app.use(handlers.readBody);
app.get('/guestBook.html', handlers.serveGuestBook);
app.post('/saveComments', handlers.saveCommentsAndRedirect);
app.use(express.static('public'));

module.exports = { app };
