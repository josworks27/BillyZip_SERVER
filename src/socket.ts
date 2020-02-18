import app from './index';

// ! Create Socket IO module
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

io.on('connection', (socket: any) => {
  socket.on('chat', (data: any) => {
    console.log('클라이언트에서 온 메시지: ', data.msg);
    const msg = {
      msg: data.msg,
    };
    io.emit('chat', msg);
  });

  // socket.on('leaveRoom', (num, name) => {
  //   socket.leave(room[num], () => {
  //     console.log(name + ' leave a ' + room[num]);
  //     io.to(room[num]).emit('leaveRoom', num, name);
  //   });
  // });

  // socket.on('joinRoom', (num, name) => {
  //   socket.join(room[num], () => {
  //     console.log(name + ' join a ' + room[num]);
  //     io.to(room[num]).emit('joinRoom', num, name);
  //   });
  // });

  // socket.on('chat', (num, name, msg) => {});
});

export default server;
