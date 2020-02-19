import { Request, Response } from 'express';
import authHelper from '../util/authHelper';
import { Forum } from '../entities/Forum';
import { getRepository, getConnection } from 'typeorm';
import { JoinForum } from '../entities/JoinForum';

// * POST
// * /forum
export const PostForum = async (req: Request, res: Response) => {
  const authResult = authHelper(req.headers.authorization);

  if (authResult.decode) {
    const { messages, myId, hostId } = req.body;
    console.log('? ', messages, myId, hostId);

    // 포럼 메세지 존재하는지 확인후 메세지 저장하기
    // ! 없으면 디비에 insert하고
    // ! 있으면 디비에 update하기
    const forum: any = await getRepository(Forum).findOne({
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

    const joinForum: any = await getRepository(JoinForum).findOne({
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
      await newJoinForum.save();
    } else {
        console.log('조인포럼 있을 때 실행');
    }

    res.sendStatus(200);
  } else {
    res.sendStatus(401);
  }
};

// ! 없으면 디비에 insert하고
// ! 있으면 디비에 update하기

// * 새로운 엔티티 필요:
// * 1) id / hostId / userId
// * 2) id / hostId  forumLog
