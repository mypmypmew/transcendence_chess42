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

app.use(cors());

app.get('/api/health', (req, res) => {
    res.json({status: 'ok'});
});

httpServer.listen(PORT, () => {
    console.log(`Hello, Backend running on http://localhost:${PORT}`);
});