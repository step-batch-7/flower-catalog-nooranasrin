const express = require('express');
const app = express();

const handlers = require('./handlers');

app.use(express.urlencoded({ extended: true }));
app.get('/guestBook.html', handlers.serveGuestBook);
app.post('/saveComments', handlers.saveCommentsAndRedirect);
app.use(express.static('public'));

module.exports = { app };
