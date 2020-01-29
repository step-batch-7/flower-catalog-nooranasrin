const http = require('http');
const { methods } = require('./lib/handlers');

const processRequest = function(request, response) {
  const handlers = methods[request.method] || methods.NOT_ALLOWED;
  const handler = handlers[request.url] || handlers.default;
  return handler(request, response);
};

const main = function(port = 4000) {
  const server = http.createServer(processRequest);
  server.on('error', err => console.error('server error', err));
  server.listen(port, () =>
    console.warn('started listening', server.address())
  );
};

main(process.argv[2]);
