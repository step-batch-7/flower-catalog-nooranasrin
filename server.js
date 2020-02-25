const http = require('http');
const { stdout, stderr } = process;
const { app } = require('./lib/routes');
const port = process.env.PORT || 4000;

const main = function(port) {
  const server = http.createServer((req, res) => app.processRequest(req, res));
  server.on('error', err => stderr.write('server error', err));
  server.listen(port, () =>
    stdout.write('started listening', server.address())
  );
};

main(port);
