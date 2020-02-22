import { Request, Response } from 'express';
import { User } from '../entities/User';
import { House } from '../entities/House';
import { Application } from '../entities/Application';
import { getRepository, getConnection } from 'typeorm';
import authHelper from '../util/authHelper';

// * POST
// * /application
export const PostApplication = async (req: Request, res: Response) => {
  const authResult = authHelper(req.headers.authorization);

  if (authResult.decode) {
    // 토큰의 user id와 req.body로 매물 Id를 확인
    const { houseId } = req.body;

    try {
      // 중복신청 확인
      const checkApply = await getRepository(Application)
        .createQueryBuilder('application')
        .where('application.user = :user', { user: authResult.decode.userId })
        .andWhere('application.house = :house', { house: houseId })
        .getOne();

      // 중복되지 않을 떄 => 정상
      if (!checkApply) {
        // 신청자 정보 가져오기
        const user = await User.findOne({ id: authResult.decode.userId });
        if (!user) {
          res.status(404).json({ error: '유저정보가 존재하지 않습니다.' });
          return;
        }

        // 매물 정보 가져오기
        const house = await House.findOne({ id: houseId });
        if (!house) {
          res.status(404).json({ error: '매물정보가 존재하지 않습니다.' });
          return;
        }

        const apply = new Application();
        apply.house = house;
        apply.user = user;
        apply.isActive = true;
        apply.save();

        res.sendStatus(200);
      } else {
        res.status(400).json({ error: '중복된 신청입니다.' });
      }
    } catch (err) {
      console.error('error is ', err);
      res.status(500).json({ error: err });
    }
  } else {
    res.sendStatus(401);
  }
};

// * GET
// * /application
export const GetApplication = async (req: Request, res: Response) => {
  const authResult = authHelper(req.headers.authorization);

  if (authResult.decode) {
    try {
      const apply = await getRepository(Application)
        .createQueryBuilder('application')
        .leftJoinAndSelect('application.house', 'house')
        .leftJoinAndSelect('application.user', 'user')
        .where('house.userId = :userId', { userId: authResult.decode.userId })
        .getMany();

      if (apply.length === 0) {
        res.status(404).json({ error: '신청이 존재하지 않습니다.' });
      } else {
        res.status(200).json(apply);
      }
    } catch (err) {
      console.error('error is ', err);
      res.status(500).json({ error: err });
    }
  } else {
    res.sendStatus(401);
  }
};

// * DELETE
// * /application
export const DeleteApplication = async (req: Request, res: Response) => {
  const authResult = authHelper(req.headers.authorization);

  if (authResult.decode) {
    const { userId, houseId } = req.body;
    // 자신의 매물id와 신청자의 id의 데이터를 삭제

    try {
      const apply = await getConnection()
        .createQueryBuilder()
        .delete()
        .from(Application)
        .where('application.userId = :userId', { userId: userId })
        .andWhere('application.houseId = :houseId', { houseId: houseId })
        .execute();

      if (apply.affected === 1) {
        res.sendStatus(200);
      } else if (apply.affected === 0) {
        res.status(404).json({ error: '해당하는 신청이 존재하지 않습니다.' });
      }
    } catch (err) {
      console.error('error is ', err);
      res.status(500).json({ error: err });
    }
  } else {
    res.sendStatus(401);
  }
};

// * PUT
// * /application

// ! 집주인이 승락하고 이사한 날을 기준으로 expiry = new Data();
