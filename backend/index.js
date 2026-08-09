let express = require('express')
let cors = require('cors');
let app = express();
let PORT = 3000;
const http = require('http');
const { Server } = require('socket.io');
const FRONTEND_ORIGIN = 'http://localhost:5173';
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: FRONTEND_ORIGIN,
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('client:ping', () => {
    socket.emit('server:pong');
  });

  socket.on('disconnect', (reason) => {
    console.log(`Socket disconnected: ${socket.id}; reason: ${reason}`);
  });
});

app.use(cors());

app.get('/api/health', (req, res) => {
    res.json({status: 'ok'});
});

httpServer.listen(PORT, () => {
    console.log(`Hello, Backend running on http://localhost:${PORT}`);
});