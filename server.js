const { Server } = require('net');
const Request = require('./lib/request');
const { processRequest } = require('./app');

const handleConnection = function(socket) {
  const remote = `${socket.remoteAddress}:${socket.remotePort}`;
  console.warn('new connection', remote);
  socket.setEncoding('utf8');
  socket.on('end', () => console.warn(`${remote} ended`));
  socket.on('error', err => console.error('socket error', err));
  socket.on('drain', () => console.warn(`${remote} drained`));
  socket.on('data', text => {
    const res = processRequest(Request.parse(text));
    res.writeTo(socket);
  });
};
const main = (port = 4000) => {
  const server = new Server();
  server.on('error', err => console.error('server error', err));
  server.on('connection', handleConnection);
  server.on('listening', () =>
    console.warn('started listening', server.address())
  );
  server.listen(port);
};
main(process.argv[2]);
