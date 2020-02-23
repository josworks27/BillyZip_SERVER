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

    if (!checkApply) {
      const user = await User.findOne({ id: userId });
      if (!user) {
        res.status(404).json({ error: '유저정보가 존재하지 않습니다.' });
        return;
      }

      const house = await House.findOne({ id: houseId });
      if (!house) {
        res.status(404).json({ error: '매물정보가 존재하지 않습니다.' });
        return;
      }

      if (user.currentPlan !== house.plan) {
        res
          .status(403)
          .json({ error: '신청자의 구독플랜과 일치하지 않는 매물입니다.' });
        return;
      }

      const apply = new Application();
      apply.house = house;
      apply.user = user;
      apply.completed = false;
      apply.status = 'wait';
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
  const userId = Number(req.headers['x-userid-header']);

  try {
    const apply = await getRepository(Application)
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.house', 'house')
      .leftJoinAndSelect('application.user', 'user')
      .where('application.completed = :completed', { completed: false })
      .andWhere('house.userId = :userId', { userId: userId })
      .getMany();

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
  const { applyId } = req.body;
  const userId = Number(req.headers['x-userid-header']);

  try {
    const apply = await getConnection()
      .createQueryBuilder()
      .delete()
      .from(Application)
      .where('application.id = :id', { id: applyId })
      .andWhere('application.userId = :userId', { userId: userId })
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
};

// * PUT
// * /application
export const PutApplication = async (req: Request, res: Response) => {
  const { agree, reject, applyId } = req.body;

  try {
    const apply = await getRepository(Application)
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.house', 'house')
      .leftJoinAndSelect('application.user', 'user')
      .where('application.id = :id', { id: applyId })
      .getOne();

    if (!apply) {
      res.status(404).json({ error: 'apply가 존재하지 않습니다.' });
      return;
    }

    if (agree) {
      await getConnection()
        .createQueryBuilder()
        .update(Application)
        .set({ status: 'agree', completed: true })
        .where('id = :id', { id: applyId })
        .execute();

      await getConnection()
        .createQueryBuilder()
        .update(User)
        .set({ livingHouse: Number(apply.house.id) })
        .where('id = :id', { id: Number(apply.user.id) })
        .execute();

      await getConnection()
        .createQueryBuilder()
        .update(House)
        .set({ status: true })
        .where('id = :id', { id: Number(apply.house.id) })
        .execute();

      res.sendStatus(200);
    } else if (reject) {
      await getConnection()
        .createQueryBuilder()
        .update(Application)
        .set({ status: 'reject', completed: true })
        .where('id = :id', { id: applyId })
        .execute();

      res.sendStatus(200);
    }
  } catch (err) {
    console.error('error is ', err);
    res.status(500).json({ error: err });
  }
};

// * GET
// * /application/my-application
export const GetMyApplication = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-userid-header']);

  try {
    const applications = await getRepository(Application)
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.house', 'house')
      .where('application.userId = :userId', { userId: userId })
      .getMany();

    if (applications.length === 0) {
      res.status(404).json({ error: 'applications이 존재하지 않습니다.' });
      return;
    }

    res.status(200).json(applications);
  } catch (err) {
    console.error('error is ', err);
    res.status(500).json({ error: err });
  }
};
