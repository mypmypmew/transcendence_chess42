const { io } = require('socket.io-client');

const sid = process.env.SID;
const conversationId = Number(process.env.CONVERSATION_ID);