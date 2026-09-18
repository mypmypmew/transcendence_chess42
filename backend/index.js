let express = require('express')
let cors = require('cors');
let cookieParser = require('cookie-parser');
let authRoutes = require('./src/routes/authRoutes');
const gameRoutes = require('./src/routes/gameRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const socketAuth = require('./src/middlewares/socketAuth');
const registerChatHandlers = require('./src/sockets/chatSocket');
const registerPresenceHandlers = require('./src/sockets/presenceSocket');
const { broadcastPresenceChange } = require('./src/sockets/presenceSocket');
const { PresenceService } = require('./src/services/presenceService');
const { GameService } = require('./src/services/gameService');
const { GameDisconnectService } = require('./src/services/gameDisconnectService');
const { cancelInterruptedGames } = require('./src/repositories/gameRepository');
const { MatchmakingService } = require('./src/services/matchmakingService');
const { registerMatchmakingHandlers } = require('./src/socket/matchmakingSocket');
const { registerGameHandlers } = require('./src/socket/gameSocket');
let app = express();
let PORT = 3000;
const http = require('http');
const { Server } = require('socket.io');
const FRONTEND_ORIGIN = 'http://localhost:5173';
const httpServer = http.createServer(app);
const userRoutes = require('./src/routes/userRoutes');
const friendshipRoutes = require('./src/routes/friendshipRoutes');
const { UPLOADS_DIR } = require('./src/services/avatarService');

const io = new Server(httpServer, {
  cors: {
    origin: FRONTEND_ORIGIN,
    credentials: true,
  },
});

app.set('io', io);

// Keep one authoritative game store and one matchmaking queue shared by every authenticated Socket.IO connection.
const gameService = new GameService();
// Share the existing game state with HTTP routes.
app.set('gameService', gameService);

const matchmakingService = new MatchmakingService({
  gameService,
});

const presenceService = new PresenceService();

const gameDisconnectService = new GameDisconnectService({
  io,
  gameService,
  presenceService,
});

presenceService.onChange((change) => {
  broadcastPresenceChange(io, change);
  gameDisconnectService.handlePresenceChange(change);
});

app.set('presenceService', presenceService);

io.use(socketAuth);

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id} (user ${socket.data.userId})`);

  registerChatHandlers(io, socket);
  registerPresenceHandlers(socket, presenceService);
  // Connect this authenticated socket to the shared matchmaking services.
  registerMatchmakingHandlers({
    io,
    socket,
    matchmakingService,
  });

  // Connect this authenticated socket to the shared authoritative game state.
  registerGameHandlers({
    io,
    socket,
    gameService,
  });

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

app.use('/api/users', userRoutes);
app.use('/api', friendshipRoutes);
app.use('/uploads', express.static(UPLOADS_DIR));
app.get('/api/health', (req, res) => {
    res.json({status: 'ok'});
});

async function startServer() {
  try {
    // Resolve games with lost in-memory state before accepting connections.
    const { count } = await cancelInterruptedGames();

    if (count > 0) {
      console.log(`Cancelled ${count} interrupted game(s) after restart.`);
    }

    httpServer.listen(PORT, () => {
        console.log(`Hello, Backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Backend startup failed:', error);
    process.exit(1);
  }
}

startServer();
