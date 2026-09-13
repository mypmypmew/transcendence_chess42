const { io } = require('socket.io-client');

const sid = process.env.SID;
const conversationId = Number(process.env.CONVERSATION_ID);

const socket = io('http://localhost:3000', {
  reconnection: false,
  extraHeaders: { Cookie: `sid=${sid}` },
});

socket.on('connect', () => {
  console.log('connected as socket', socket.id);

  socket.emit('chat:join', conversationId, (reply) => {
    console.log('join reply:', reply);

    socket.emit('chat:message', { conversationId, body: 'hello from the smoke client' }, (sendReply) => {
      console.log('send reply:', sendReply);
    });
  });
});

socket.on('chat:message', (message) => {
  console.log('received:', message.body, 'from user', message.senderId);
});

socket.on('connect_error', (err) => {
  console.error('connect_error:', err.message);
  process.exitCode = 1;
});