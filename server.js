const http = require('http');
const { stdout, stderr } = process;
const { app } = require('./lib/handlers');
const PORT = process.argv[2] || 4000;

const main = function(port) {
  const server = http.createServer(app.processRequest.bind(app));
  server.on('error', err => stderr.write('server error', err));
  server.listen(port, () =>
    stdout.write('started listening', server.address())
  );
};

main(PORT);
