import app from './index';

// ! Create Socket IO module
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

const room = ['room1', 'room2'];
let a = 0;
io.on('connection', (socket: any) => {
  // socket.on('chat', (data: any) => {
  //   console.log('클라이언트에서 온 메시지: ', data.msg);
  //   const msg = {
  //     msg: data.msg,
  //   };
  //   io.emit('chat', msg);
  // });

  // 1:1 룸에 조인하기
  socket.on('joinRoom', (num: number, name: string) => {
    socket.join(num, () => {
      console.log(name + ' join a ' + num);

      io.to(num).emit('joinRoom', num, name);
    });
  });

  // 1:1 룸으로 메세지 보내기
  socket.on('chat', (num: number, name: string, msg: string) => {
    io.to(num).emit('chat', name, msg);
  });
});

export default server;
