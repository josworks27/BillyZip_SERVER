import { Request, Response } from 'express';
import { User } from '../entities/User';
import { House } from '../entities/House';
import { Application } from '../entities/Application';
import { getRepository, getConnection } from 'typeorm';
import { Image } from '../entities/Image';

// * POST
// * /application
export const PostApplication = async (req: Request, res: Response) => {
  const { houseId } = req.body;
  const userId = Number(req.headers['x-userid-header']);

  try {
    const checkApply = await getRepository(Application)
      .createQueryBuilder('application')
      .where('application.user = :user', { user: userId })
      .andWhere('application.house = :house', { house: houseId })
      .getOne();

    // 중복되지 않을 떄 => 정상
    if (!checkApply) {
      // 신청자 정보 가져오기
      const user = await User.findOne({ id: userId });
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
};

// * GET
// * /application
export const GetApplication = async (req: Request, res: Response) => {
  // ! completed === false 인 얘만
  const userId = Number(req.headers['x-userid-header']);

  try {
    const apply = await getRepository(Application)
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.house', 'house')
      .leftJoinAndSelect('application.user', 'user')
      .where('application.completed = :completed', { completed: false })
      .andWhere('house.userId = :userId', { userId: userId })
      .getMany();

    // image 추가하기
    const images = [];
    for (let i = 0; i < apply.length; i++) {
      const image = await getRepository(Image)
        .createQueryBuilder('image')
        .leftJoinAndSelect('image.house', 'house')
        .where('image.houseId = :houseId', { houseId: apply[i].house.id })
        .getOne();

      images.push(image);
    }

    if (apply.length === 0) {
      res.status(404).json({ error: '신청이 존재하지 않습니다.' });
    } else {
      res.status(200).json({ apply: apply, images: images });
    }
  } catch (err) {
    console.error('error is ', err);
    res.status(500).json({ error: err });
  }
};

// * DELETE
// * /application
export const DeleteApplication = async (req: Request, res: Response) => {
  // ! 신청현황에서 자신이 신청한 apply를 삭제
  // ! 신청한 유저가 삭제
  // const { applyId } = req.body;
  // const userId = Number(req.headers['x-userid-header']);
  // try {
  //   const apply = await getConnection()
  //     .createQueryBuilder()
  //     .leftJoinAndSelect('application.house', 'house')
  //     .delete()
  //     .from(Application)
  //     .where('application.id = :id', { id: applyId })
  //     .where('house.userId = :userId', { userId: userId })
  //     .execute();
  //   if (apply.affected === 1) {
  //     res.sendStatus(200);
  //   } else if (apply.affected === 0) {
  //     res.status(404).json({ error: '해당하는 신청이 존재하지 않습니다.' });
  //   }
  // } catch (err) {
  //   console.error('error is ', err);
  //   res.status(500).json({ error: err });
  // }
};

// * PUT
// * /application
export const PutApplication = async (req: Request, res: Response) => {
  const { agree, reject, applyId } = req.body;

  try {
    const apply = await Application.findOne({ id: applyId });
    if (!apply) {
      res.status(404).json({ error: 'apply가 존재하지 않습니다.' });
      return;
    }

    if (agree) {
      // 승낙했을 때
      // ! status 변경
      await getConnection()
        .createQueryBuilder()
        .update(Application)
        .set({ status: 'agree', completed: true })
        .where('id = :id', { id: applyId })
        .execute();

      // ! 해당 유저의 livingHouse가 신청된 매물의 아이디로 변경
      await getConnection()
        .createQueryBuilder()
        .update(User)
        .set({ livingHouse: Number(apply.house) })
        .where('id = :id', { id: apply.user })
        .execute();

      // ! house의 status를 살고 있는 걸로 변경
      await getConnection()
        .createQueryBuilder()
        .update(House)
        .set({ status: true })
        .where('id = :id', { id: apply.house })
        .execute();
    } else if (reject) {
      // 거절했을 때
      // ! status 변경
      await getConnection()
        .createQueryBuilder()
        .update(Application)
        .set({ status: 'reject', completed: true })
        .where('id = :id', { id: applyId })
        .execute();
    }
  } catch (err) {
    console.error('error is ', err);
    res.status(500).json({ error: err });
  }
};
// 승낙(agree) / 거부(reject)에 따라 컬럼 값 변경, 기본값 대기(wait)
