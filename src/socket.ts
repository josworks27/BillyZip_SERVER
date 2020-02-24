/* eslint-disable @typescript-eslint/no-explicit-any */
import app from './index';

// ! Create Socket IO module
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

io.on('connection', (socket: any) => {
  socket.on('joinRoom', (userId: string) => {
    socket.join(userId, () => {
      console.log(`서버 메세지: ${userId}의 룸입니다.`);
    });
    io.to(userId).emit('joinRoom', 'a user connected');
  });

  socket.on('chat', (userId: string, msg: string | number, name: string) => {
    console.log(name + '이(가) 접속하였습니다.');
    io.to(userId).emit('chat', { name, msg });
  });
});

export default server;
