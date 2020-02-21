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

    // 중복신청 확인
    const checkApply = await getRepository(Application)
      .createQueryBuilder('application')
      .where('application.user = :user', { user: authResult.decode.userId })
      .andWhere('application.house = :house', { house: houseId })
      .getOne();

    // 중복되지 않을 떄 => 정상
    if (!checkApply) {
      // 신청자 정보 가져오기
      const user: any = await User.findOne({ id: authResult.decode.userId });
      // 매물 정보 가져오기
      const house: any = await House.findOne({ id: houseId });

      const apply = await new Application();
      apply.house = house;
      apply.user = user;
      apply.isActive = true;
      apply.save();

      res.status(200).json('신청 성공');
    } else {
      // 중복될 때
      res.status(400).json('이미 신청한 매물입니다.');
    }
  } else {
    res.sendStatus(404);
  }
};

// * GET
// * /application
export const GetApplication = async (req: Request, res: Response) => {
  const authResult = authHelper(req.headers.authorization);

  if (authResult.decode) {
    const apply = await getRepository(Application)
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.house', 'house')
      .leftJoinAndSelect('application.user', 'user')
      .where('house.userId = :userId', { userId: authResult.decode.userId })
      .getMany();

    res.status(200).json(apply);
  } else {
    res.sendStatus(404);
  }
};

// * DELETE
// * /application
export const DeleteApplication = async (req: Request, res: Response) => {
  const authResult = authHelper(req.headers.authorization);

  if (authResult.decode) {
    const { userId, houseId } = req.body;
    // 자신의 매물id와 신청자의 id의 데이터를 삭제

    const apply = await getConnection()
      .createQueryBuilder()
      .delete()
      .from(Application)
      .where('application.userId = :userId', { userId: userId })
      .andWhere('application.houseId = :houseId', { houseId: houseId })
      .execute();

    if (apply.affected === 1) {
      res.status(200).json('삭제 완료');
    } else if (apply.affected === 0) {
      res.status(400).json('해당 매물 없음');
    }
  } else {
    res.sendStatus(404);
  }
};

// * PUT
// * /application

// ! 집주인이 승락하고 이사한 날을 기준으로 expiry = new Data();