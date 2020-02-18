import app from './index';

// ! Create Socket IO module
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

io.on('connection', (socket: any) => {
  // 1:1 룸에 조인하기
  socket.on('joinRoom', (userId: string) => {
    socket.join(userId, () => {
      console.log(`서버 메세지: ${userId}의 룸입니다.`);
    });
  });

  // 1:1 룸으로 메세지 보내기
  socket.on('chat', (userId: string, msg: string) => {
    io.to(userId).emit('chat', msg);
  });
});

export default server;

// socket.on('chat', (data: any) => {
//   console.log('클라이언트에서 온 메시지: ', data.msg);
//   const msg = {
//     msg: data.msg,
//   };
//   io.emit('chat', msg);
// });
