const http = require('http');
const { stdout, stderr } = process;
const { app } = require('./lib/handlers');
const [, , port] = process.argv;
const DEFAULT_PORT = 4000;

const main = function(port = DEFAULT_PORT) {
  const server = http.createServer((req, res) => app.processRequest(req, res));
  server.on('error', err => stderr.write('server error', err));
  server.listen(port, () =>
    stdout.write('started listening', server.address())
  );
};

main(port);
