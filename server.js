const http = require('http');
const { processRequest } = require('./app');

const main = function(port = 4000) {
  const server = http.createServer(processRequest);
  server.on('error', err => console.error('server error', err));
  server.listen(port, () =>
    console.warn('started listening', server.address())
  );
};

main(process.argv[2]);
