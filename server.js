const { stdout } = process;
const { app } = require('./lib/routes');
const port = process.env.PORT || 4000;

const main = function(port) {
  app.listen(port, () => stdout.write('started listening'));
};

main(port);
