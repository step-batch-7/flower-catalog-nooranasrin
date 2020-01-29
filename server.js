const http = require('http');
const { app } = require('./lib/handlers');

const main = function(port = 4000) {
  const server = http.createServer(app.processRequest.bind(app));
  server.on('error', err => console.error('server error', err));
  server.listen(port, () =>
    console.warn('started listening', server.address())
  );
};

main(process.argv[2]);
