const App = require('./app');
const handlers = require('./handlers');

const app = new App();

app.use(handlers.readBody);
app.get('/guestBook.html', handlers.serveGuestBook);
app.get('', handlers.serveFile);
app.get('', handlers.serve404Page);
app.post('/saveComments', handlers.saveCommentsAndRedirect);
app.use(handlers.methodNotAllowed);

module.exports = { app };
