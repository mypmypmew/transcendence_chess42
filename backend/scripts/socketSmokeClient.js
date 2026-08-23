const { io } = require('socket.io-client');

const sid = process.env.SID;  

const socket = io('http://localhost:3000', {
  reconnection: false,
  timeout: 5000,
  extraHeaders: sid ? { Cookie: `sid=${sid}` } : {},
});

const verificationTimeout = setTimeout(() => {
  console.error('Timed out waiting for server:pong');
  socket.disconnect();
  process.exitCode = 1;
}, 5000);

socket.on('connect', () => {
  console.log(`Client connected: ${socket.id}`);
  socket.emit('client:ping');
});

socket.on('server:pong', () => {
  clearTimeout(verificationTimeout);
  console.log('Client received server:pong');
  socket.disconnect();
});

socket.on('connect_error', (error) => {
  clearTimeout(verificationTimeout);
  console.error(`Connection failed: ${error.message}`);
  socket.disconnect();
  process.exitCode = 1;
});

socket.on('disconnect', (reason) => {
  console.log(`Client disconnected: ${reason}`);
});