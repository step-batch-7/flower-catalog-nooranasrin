const express = require('express');
const app = express();

const handlers = require('./handlers');

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.get('/guestBook.html', handlers.serveGuestBook);
app.post('/saveComments', handlers.saveCommentsAndRedirect);

module.exports = { app };
