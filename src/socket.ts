import app from './index';

// ! Create Socket IO module
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

io.on('connection', (socket: any) => {

  // 클라이언트로부터의 메시지가 수신되면
  socket.on('chat', (data: any) => {
    console.log('Message from %s: %s', socket.name, data.msg);

    // 접속된 모든 클라이언트에게 메시지를 전송한다
    const msg = {
      msg: data.msg
    };
    io.emit('chat', msg);

  });
});

export default server;
