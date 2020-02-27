const redis = require('redis');
const client = redis.createClient();
const { app } = require('./lib/routes');
const CommentLog = require('./lib/commentLog');

const port = process.env.PORT || 4000;

(function() {
  client.get('comments', (err, comments) => {
    if (err) {
      return err;
    }
    app.locals = { totalComments: CommentLog.load(JSON.parse(comments)) };
    app.locals.client = client;
  });
})();

const main = function(port) {
  app.listen(port, () => console.log('started listening'));
};

main(port);
