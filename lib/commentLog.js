const Comment = require('./comment');

class CommentLog {
  constructor() {
    this.comments = [];
  }

  addComment(name, comment, date) {
    this.comments.unshift(new Comment(name, comment, date));
  }

  toHTML() {
    return this.comments.map(comment => comment.toHTML()).join('');
  }

  static load(commentList) {
    const comments = new CommentLog();
    commentList.forEach(comment => {
      const { name, date } = comment;
      comments.addComment(name, comment.comment, new Date(date));
    });
    return comments;
  }

  toJSON() {
    return JSON.stringify(this.comments);
  }
}

module.exports = CommentLog;
