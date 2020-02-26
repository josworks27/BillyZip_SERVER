/* eslint-disable @typescript-eslint/no-explicit-any */
import app from './index';
import { getRepository, getConnection } from 'typeorm';
import { Forum } from './entities/Forum';
import { JoinForum } from './entities/JoinForum';
import { User } from './entities/User';

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

  socket.on(
    'chat',
    async (myId: string, userId: string, msg: string | number, name: string) => {
      // DB에서 로그 불러오고 새로 들어온 메세지를 콘캣으로 추가한다.
      // 디비에 업데이트한다.
      // 메세지와 네임을 소켓서버로 보내준다.

      console.log('!?', msg);

      const hostInfo = await getRepository(User).findOne({
        where: {
          id: userId,
        },
      });

      if (!hostInfo) {
        console.log('호스트 없음');
        return;
      }

      const log = await getRepository(Forum).findOne({
        where: {
          hostId: userId,
        },
      });

      console.log('log', log);

      if (!log) {
        console.log('포럼 없을 때 실행');
        const newForum = new Forum();
        newForum.hostId = Number(userId);
        newForum.forumLog = JSON.stringify([{name, msg}]);
        newForum.isActive = true;
        await newForum.save();
      // }
      } else {
        console.log('포럼 있을 때 실행');

        const addedLog = JSON.parse(log.forumLog).concat([{name, msg}]);

        console.log('added', addedLog);

        await getConnection()
          .createQueryBuilder()
          .update(Forum)
          .set({ forumLog: JSON.stringify(addedLog) })
          .where('hostId = :hostId', { hostId: userId })
          .execute();
      }

      const joinForum = await getRepository(JoinForum).findOne({
        where: {
          userId: myId,
          hostId: userId,
        },
      });
  
      if (!joinForum) {
        console.log('조인포럼 없을 때 실행');
        const newJoinForum = new JoinForum();
        newJoinForum.userId = Number(myId);
        newJoinForum.hostId = Number(userId);
        newJoinForum.hostName = hostInfo.name;
        newJoinForum.isActive = true;
        await newJoinForum.save();
      } else {
        console.log('조인포럼 있을 때 실행');
      }
      

      io.to(userId).emit('chat', { name, msg });
    },
  );
});

export default server;
