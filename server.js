const http = require('http');
const { methods } = require('./lib/handlers');

const matchingHandler = function(request, handler) {
  return request.url.match(handler.path);
};

const processRequest = function(request, response) {
  const handlers = methods[request.method] || methods.NOT_ALLOWED;
  const matchingHandlers = handlers.filter(matchingHandler.bind(null, request));

  const next = function() {
    const router = matchingHandlers.shift();
    router.handler(request, response, next);
  };

  next();
};

const main = function(port = 4000) {
  const server = http.createServer(processRequest);
  server.on('error', err => console.error('server error', err));
  server.listen(port, () =>
    console.warn('started listening', server.address())
  );
};

main(process.argv[2]);
