import { Request, Response } from 'express';
import { Forum } from '../entities/Forum';
import { getRepository, getConnection } from 'typeorm';
import { JoinForum } from '../entities/JoinForum';
import authHelper from '../util/authHelper';
import { User } from '../entities/User';

// * POST
// * /forum
export const PostForum = async (req: Request, res: Response) => {
  const authResult = authHelper(req.headers.authorization);

  if (authResult.decode) {
    const { messages, myId, hostId } = req.body;

    try {
      // 호스트 이름 찾기
      const hostInfo = await getRepository(User).findOne({
        where: {
          id: hostId,
        },
      });

      if (!hostInfo) {
        res.status(404).json({ error: 'hostInfo가 존재하지 않습니다.' });
        return;
      }

      // 포럼 메세지 존재하는지 확인후 메세지 저장하기
      // ! 없으면 디비에 insert하고
      // ! 있으면 디비에 update하기
      const forum = await getRepository(Forum).findOne({
        where: {
          hostId: hostId,
        },
      });

      if (!forum) {
        // 포럼이 없을 때 => 생성
        console.log('포럼 없을 때 실행');
        const newForum = new Forum();
        newForum.hostId = hostId;
        newForum.forumLog = JSON.stringify(messages);
        newForum.isActive = true;
        await newForum.save();
      } else {
        // 포럼이 있을 때 => 갱신
        console.log('포럼 있을 때 실행');
        await getConnection()
          .createQueryBuilder()
          .update(Forum)
          .set({ forumLog: JSON.stringify(messages) })
          .where('hostId = :hostId', { hostId: hostId })
          .execute();
      }

      // 조인포럼에 유저와 호스트 있는지 확인 후 없으면 생성, 있으면 종료
      // ! 없으면 디비에 insert하고
      // ! 있으면 종료
      const joinForum = await getRepository(JoinForum).findOne({
        where: {
          userId: myId,
          hostId: hostId,
        },
      });

      if (!joinForum) {
        // 조인포럼이 없을 때
        console.log('조인포럼 없을 때 실행');
        const newJoinForum = new JoinForum();
        newJoinForum.userId = myId;
        newJoinForum.hostId = hostId;
        newJoinForum.hostName = hostInfo.name;
        newJoinForum.isActive = true;
        await newJoinForum.save();
      } else {
        console.log('조인포럼 있을 때 실행');
        res.sendStatus(200);
        return;
      }

      res.sendStatus(200);
    } catch (err) {
      console.error('error is ', err);
      res.status(500).json({ error: err });
    }
  } else {
    res.sendStatus(401);
  }
};

// * POST
// * /forum/room
export const PostForumRoom = async (req: Request, res: Response) => {
  const authResult = authHelper(req.headers.authorization);

  if (authResult.decode) {
    const { hostId } = req.body;

    try {
      const forumLog = await getRepository(Forum).findOne({
        where: {
          hostId: hostId,
        },
      });

      res.status(200).json(forumLog);
    } catch (err) {
      console.error('error is ', err);
      res.status(500).json({ error: err });
    }
  } else {
    res.sendStatus(401);
  }
};

// * POST
// * /forum/list
export const PostForumList = async (req: Request, res: Response) => {
  const authResult = authHelper(req.headers.authorization);

  if (authResult.decode) {
    const { myId } = req.body;

    try {
      const forumList = await getRepository(JoinForum).find({
        where: {
          userId: myId,
        },
      });
      res.status(200).json(forumList);
    } catch (err) {
      console.error('error is ', err);
      res.status(500).json({ error: err });
    }
  } else {
    res.sendStatus(401);
  }
};
