const http = require('http');
const path = require('path');
const express = require('express');
const socketio = require('socket.io');
const setupSockets = require('./sockets.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

// Create a new express app
const app = express();

app.use('/assets', express.static(path.resolve(`${__dirname}/../hosted/`)));

app.get('/', (req, res) => {
  res.sendFile(path.resolve(`${__dirname}/../hosted/index.html`));
});

const server = http.createServer(app);

const io = socketio(server);

// pass our socket server to our socket function
setupSockets(io);

// start listening for traffic
server.listen(port, (err) => {
  if (err) {
    throw err;
  }
  console.log(`Listening on port ${port}`);
});