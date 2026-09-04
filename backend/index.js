let express = require('express')
let cors = require('cors');
let cookieParser = require('cookie-parser');
let authRoutes = require('./src/routes/authRoutes');
const gameRoutes = require('./src/routes/gameRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const socketAuth = require('./src/middlewares/socketAuth');
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

io.use(socketAuth);

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id} (user ${socket.data.userId})`);

  socket.on('client:ping', () => {
    socket.emit('server:pong');
  });

  socket.on('disconnect', (reason) => {
    console.log(`Socket disconnected: ${socket.id}; reason: ${reason}`);
  });
});

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/conversations', chatRoutes);

app.get('/api/health', (req, res) => {
    res.json({status: 'ok'});
});

httpServer.listen(PORT, () => {
    console.log(`Hello, Backend running on http://localhost:${PORT}`);
});