const http = require('http');
const fs = require('fs');
const url = require('url');
const socketio = require('socket.io');
const setupSockets = require('./sockets.js');

const MAX_ROOM_SIZE = 4;

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const index = fs.readFileSync(`${__dirname}/../hosted/index.html`);
const bundle = fs.readFileSync(`${__dirname}/../hosted/bundle.js`);
const style = fs.readFileSync(`${__dirname}/../hosted/style.css`);

// deals with http requests
const onRequest = (request, response) => {
  const parsedURL = url.parse(request.url);

  if (parsedURL.pathname === '/bundle.js') {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.write(bundle);
  } else if (parsedURL.pathname === '/style.css') {
    response.writeHead(200, { 'Content-Type': 'text/css' });
    response.write(style);
  } else {
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.write(index);
  }
  response.end();
};

const app = http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1:${port}`);


setupSockets(app);