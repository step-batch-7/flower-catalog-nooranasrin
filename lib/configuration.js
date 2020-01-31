const fs = require('fs');

const COMMENT_STORE = `${__dirname}/../data/comments.json`;

const isFileNotAvailable = function(path) {
  const stat = fs.existsSync(path) && fs.statSync(path);
  return !stat || !stat.isFile();
};

const loadPreviousComments = function() {
  if (isFileNotAvailable(COMMENT_STORE)) {
    return [];
  }
  const comments = JSON.parse(fs.readFileSync(COMMENT_STORE));
  return comments;
};

module.exports = { loadPreviousComments, isFileNotAvailable };
