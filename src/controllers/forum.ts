import { Request, Response } from 'express';
import { Forum } from '../entities/Forum';
import { getRepository, getConnection } from 'typeorm';
import { JoinForum } from '../entities/JoinForum';
import { User } from '../entities/User';

// * POST
// * /forum
export const PostForum = async (req: Request, res: Response) => {
  const { messages, myId, hostId } = req.body;

  try {
    const hostInfo = await getRepository(User).findOne({
      where: {
        id: hostId,
      },
    });

    if (!hostInfo) {
      res.status(404).json({ error: 'hostInfo가 존재하지 않습니다.' });
      return;
    }

    const forum = await getRepository(Forum).findOne({
      where: {
        hostId: hostId,
      },
    });

    if (!forum) {
      console.log('포럼 없을 때 실행');
      const newForum = new Forum();
      newForum.hostId = hostId;
      newForum.forumLog = JSON.stringify(messages);
      newForum.isActive = true;
      await newForum.save();
    } else {
      console.log('포럼 있을 때 실행');
      await getConnection()
        .createQueryBuilder()
        .update(Forum)
        .set({ forumLog: JSON.stringify(messages) })
        .where('hostId = :hostId', { hostId: hostId })
        .execute();
    }

    const joinForum = await getRepository(JoinForum).findOne({
      where: {
        userId: myId,
        hostId: hostId,
      },
    });

    if (!joinForum) {
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
};

// * POST
// * /forum/room
export const PostForumRoom = async (req: Request, res: Response) => {
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
};

// * POST
// * /forum/list
export const PostForumList = async (req: Request, res: Response) => {
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
};
