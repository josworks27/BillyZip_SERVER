import app from './index';

// ! Create Socket IO module
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

io.on('connection', (socket: any) => {
  // socket.on('login', (data: any) => {
  //   console.log(
  //     'Client logged-in:\n name:' + data.name + '\n userid: ' + data.userid,
  //   );

  //   // socket에 클라이언트 정보를 저장한다
  //   socket.name = data.name;
  //   socket.userid = data.userid;

  //   // 접속된 모든 클라이언트에게 메시지를 전송한다
  //   io.emit('login', data.name);
  // });

  // 클라이언트로부터의 메시지가 수신되면
  socket.on('chat', (data: any) => {
    console.log('Message from %s: %s', socket.name, data.msg);

    const msg = {
      from: {
        name: socket.name,
        userid: socket.userid,
      },
      msg: data.msg,
    };

    // 메시지를 전송한 클라이언트를 제외한 모든 클라이언트에게 메시지를 전송한다
    // socket.broadcast.emit('chat', msg);

    // 메시지를 전송한 클라이언트에게만 메시지를 전송한다
    // socket.emit('s2c chat', msg);

    // 접속된 모든 클라이언트에게 메시지를 전송한다
    io.emit('chat', msg);

    // 특정 클라이언트에게만 메시지를 전송한다
    // io.to(id).emit('s2c chat', data);
  });

  // force client disconnect from server
  socket.on('forceDisconnect', () => {
    socket.disconnect();
  });

  socket.on('disconnect', () => {
    console.log('user disconnected: ' + socket.name);
  });
});

export default server;
