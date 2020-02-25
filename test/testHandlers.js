const request = require('supertest');
const { app } = require('../lib/routes');

describe('GET method', () => {
  it('should give the index.html page when the url is /', done => {
    request(app)
      .get('/')
      .expect('Content-Type', /text\/html/)
      .expect(200, done)
      .expect(/Flower Catalog/);
  });

  it('should give flowerCatalog.js file when the url is /flowerCatalog.js', done => {
    request(app)
      .get('/js/flowerCatalog.js')
      .expect('Content-Type', /application\/javascript/)
      .expect(/const hide = function/)
      .expect(200, done);
  });

  it('should give flowerCatalog.css file when the url is /flowerCatalog.css', done => {
    request(app)
      .get('/css/flowerCatalog.css')
      .expect('Content-Type', /text\/css/)
      .expect(/.feedback {/)
      .expect(200, done);
  });

  it('should give the image file when the request is for an image file', done => {
    request(app)
      .get('/images/freshorigins.jpg')
      .expect('Content-Type', /image/)
      .expect(200, done);
  });

  it('should give the pdf file when the request is for pdf file', done => {
    request(app)
      .get('/pdf/Ageratum.pdf')
      .expect('Content-Type', 'application/pdf')
      .expect(200, done);
  });

  it('should give 404 error page when the request url is not existing', done => {
    request(app)
      .get('/badPage')
      .expect('Content-Type', /text\/html/)
      .expect(404, done);
  });

  it('should give guestBook page when the request url is /guestBook.html', done => {
    request(app)
      .get('/guestBook.html')
      .expect('Content-Type', /text\/html/)
      .expect(/Leave A Comment/)
      .expect(200, done);
  });

  it('should give guestBook page when the request url is /guestBook.html', done => {
    request(app)
      .get('/guestBook.html.abcd')
      .expect('Content-Type', /text\/html/)
      .expect(404, done);
  });

  it('should give the gif when the request url is /animated-flower-image-0021.gif', done => {
    request(app)
      .get('/images/animated-flower-image-0021.gif')
      .expect('Content-Type', 'image/gif')
      .expect(200, done);
  });

  it('should give the index.html page and should pass the data to the server when the url is /', done => {
    request(app)
      .get('/')
      .send('name=flower')
      .expect('Content-Type', /text\/html/)
      .expect(200, done)
      .expect(/Flower Catalog/);
  });
});

describe('POST method', () => {
  it('should be able to handle post request', done => {
    request(app)
      .post('/saveComments')
      .send('name=nooraNasrin&comment=hai')
      .expect('Location', 'guestBook.html')
      .expect(301, done);
  });
});
