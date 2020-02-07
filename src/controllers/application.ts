import { Request, Response } from 'express';
import { User } from '../entities/User';
import { House } from '../entities/House';
import { Application } from '../entities/Application';
import app from '..';
import { getRepository, getConnection } from 'typeorm';

// * POST
// * /application
export const PostApplication = async (req: Request, res: Response) => {
  // ! 토큰 확인!!
  // 신청자 구독기간 확인
  // 최소 거주기간(startTime) 최대 거주기간(endTime) 를 date -> number로 바꾸기
  // User.expiry도 date -> number로 바꾸기

  // 토큰의 user id와 req.body로 매물 Id를 확인
  const { houseId } = req.body;
  const tempTokenUserId = 3;

  // 중복신청 확인
  const checkApply = await getRepository(Application)
    .createQueryBuilder('application')
    .where('application.user = :user', { user: tempTokenUserId })
    .andWhere('application.house = :house', { house: houseId })
    .getOne();

    // 중복되지 않을 떄 => 정상
  if (!checkApply) {
    // 신청자 정보 가져오기, 구독기간 확인
    const user: any = await User.findOne({ id: tempTokenUserId });
    // 매물의 최소 거주기간 확인
    const house: any = await House.findOne({ id: houseId });

    if (house.startTime < user.expiry) {
      // 신청 가능
      const apply = await new Application();
      apply.house = house;
      apply.user = user;
      apply.isActive = true;
      apply.save();

      res.status(200).json('신청 성공');
    } else {
      // 최소 거주기간 부족으로 신청 불가능
      res.status(400).json('최소 거주기간 부족으로 신청 실패');
    }
  } else {
    // 중복될 때
    res.status(400).json('이미 신청한 매물입니다.');
  }
};

// * GET
// * /application
export const GetApplication = async (req: Request, res: Response) => {
  // ! 토큰 확인
  // 자신이 올린 매물과 신청자들의 정보를 가져온다.

  const tempTokenUserId = 2;

  const apply = await getRepository(Application)
    .createQueryBuilder('application')
    .leftJoinAndSelect('application.house', 'house')
    .leftJoinAndSelect('application.user', 'user')
    .where('house.userId = :userId', { userId: tempTokenUserId })
    .getMany();

  res.status(200).json(apply);
};

// * DELETE
// * /application
export const DeleteApplication = async (req: Request, res: Response) => {
  // ! 토큰 확인
  // 집주인이 거절했을 때 application에서 해당 데이터를 삭제한다.
  // 신청자의 id를 확인한다.

  const { userId, houseId } = req.body;
  // 자신의 매물id와 신청자의 id의 데이터를 삭제

  await getConnection()
    .createQueryBuilder()
    .delete()
    .from(Application)
    .where('application.userId = :userId', { userId: userId })
    .andWhere('application.houseId = :houseId', { houseId: houseId})
    .execute();
  
  res.status(200).json('삭제 완료');
};
